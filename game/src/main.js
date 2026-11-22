// main.js — the heist itself: the game loop, the thief's movement, the
// tools (decoy coin, EMP), the loot grab, the getaway, and the win and
// caught moments. It wires the world, guards, cameras, input, audio and
// rendering together and keeps the HUD honest.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  THIEF_SPEED,
  ALARM_MAX,
  ALARM_DECAY_RATE,
  DECOY_THROW_RANGE,
  DECOY_LURE_SECONDS,
} from './config.js';
import { createWorld, resetWorld, moveBody, distanceToLoot, thiefAtExit, decayAlarm } from './world.js';
import { createGuards, updateGuards, lureGuards, guardCaughtThief } from './guards.js';
import { createCameras, updateCameras, updateCameraAlarm, fireEmp, empSecondsLeft } from './cameras.js';
import { createInput, wasPressed, endFrame, moveVector } from './input.js';
import { render } from './render.js';
import {
  ensureAudio,
  playStep,
  playPickup,
  playDecoy,
  playEmp,
  playSpotted,
  playCaught,
  playWin,
  playClick,
  startMusic,
  stopMusic,
} from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

const world = createWorld();
let guards = createGuards();
let cameras = createCameras();

// Playtest handle: lets an automated browser read the live positions
// (thief, guards, cameras) so scripted play can steer by feedback.
window.__heist = { world, get guards() { return guards; }, get cameras() { return cameras; } };

let phase = 'ready';
let now = 0;
let lastTime = 0;
let stepTimer = 0;
let wasSpotted = false;

const el = (id) => document.getElementById(id);
const alarmFill = el('alarm-fill');
const alarmText = el('alarm-text');
const objectiveText = el('objective');
const toolsText = el('tools');
const timeText = el('time');
const overlay = el('overlay');
const overlayTitle = el('overlay-title');
const overlayBody = el('overlay-body');
const overlayHint = el('overlay-hint');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function alarmColor(value) {
  if (value >= 70) return '#ff503c';
  if (value >= 40) return '#ffc442';
  return '#3ddc84';
}

function updateHud() {
  const alarm = Math.round(world.alarm);
  alarmFill.style.width = `${alarm}%`;
  alarmFill.style.background = alarmColor(alarm);
  alarmText.textContent = `ALARM ${alarm}%`;
  alarmText.style.color = alarmColor(alarm);
  objectiveText.textContent = world.loot.taken
    ? 'Star secured — reach the green ESCAPE door!'
    : 'Steal The Cobalt Star, then escape.';
  const empLeft = empSecondsLeft(world, now);
  toolsText.textContent =
    `Decoys (Q): ${world.decoys}   EMP (E): ${world.emps}` +
    (empLeft > 0 ? `   Cameras down ${empLeft.toFixed(1)}s` : '');
  timeText.textContent = formatTime(world.elapsed);
}

function showOverlay(title, body, hint) {
  overlayTitle.textContent = title;
  overlayBody.textContent = body;
  overlayHint.textContent = hint;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function startHeist() {
  resetWorld(world);
  guards = createGuards();
  cameras = createCameras();
  phase = 'playing';
  now = 0;
  lastTime = 0;
  wasSpotted = false;
  hideOverlay();
  ensureAudio();
  startMusic();
  updateHud();
}

function endHeist(won, reason) {
  phase = won ? 'won' : 'caught';
  stopMusic();
  if (won) {
    playWin();
    const score = Math.max(
      0,
      Math.round(1000 - world.elapsed * 4 - world.alarmPeak * 5),
    );
    showOverlay(
      'CLEAN GETAWAY!',
      `Rook slipped out with The Cobalt Star in ${formatTime(world.elapsed)}. ` +
        `Peak alarm ${Math.round(world.alarmPeak)}%. Score ${score}.`,
      'Press R or Enter to run it again.',
    );
  } else {
    playCaught();
    showOverlay(
      'CAUGHT!',
      reason,
      'Press R or Enter to try the heist again.',
    );
  }
  updateHud();
}

function throwDecoy() {
  if (world.decoys <= 0) return;
  const dx = input.mouseX - world.thief.x;
  const dy = input.mouseY - world.thief.y;
  const dist = Math.hypot(dx, dy);
  const range = Math.min(dist, DECOY_THROW_RANGE);
  const tx = dist > 0 ? world.thief.x + (dx / dist) * range : world.thief.x + 60;
  const ty = dist > 0 ? world.thief.y + (dy / dist) * range : world.thief.y;
  world.decoys -= 1;
  world.decoyActive = { x: tx, y: ty, until: now + DECOY_LURE_SECONDS };
  lureGuards(guards, tx, ty);
  playDecoy();
}

function fireEmpTool() {
  if (fireEmp(world, now)) playEmp();
}

function updatePlaying(dt) {
  now += dt;
  world.elapsed += dt;

  // Movement: keys first, otherwise walk toward the mouse click target.
  const vec = moveVector(input);
  if (vec) {
    input.clickTarget = null;
    moveBody(world, world.thief, vec.x * THIEF_SPEED * dt, vec.y * THIEF_SPEED * dt);
    stepTimer -= dt;
    if (stepTimer <= 0) {
      playStep();
      stepTimer = 0.34;
    }
  } else if (input.clickTarget) {
    const dx = input.clickTarget.x - world.thief.x;
    const dy = input.clickTarget.y - world.thief.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) {
      input.clickTarget = null;
    } else {
      moveBody(
        world,
        world.thief,
        (dx / dist) * THIEF_SPEED * dt,
        (dy / dist) * THIEF_SPEED * dt,
      );
    }
  }

  if (wasPressed(input, 'decoy')) throwDecoy();
  if (wasPressed(input, 'emp')) fireEmpTool();

  if (world.decoyActive && now > world.decoyActive.until) world.decoyActive = null;

  const guardSees = updateGuards(world, guards, dt);
  const cameraSees = updateCameraAlarm(world, cameras, dt);
  updateCameras(world, cameras, dt, now);

  world.spotted = guardSees || cameraSees;
  if (world.spotted && !wasSpotted) playSpotted();
  wasSpotted = world.spotted;
  if (!world.spotted) decayAlarm(world, dt);

  if (!world.loot.taken && distanceToLoot(world) < 34) {
    world.loot.taken = true;
    playPickup();
  }

  const catcher = guardCaughtThief(world, guards);
  if (catcher) {
    endHeist(false, `${catcher.name} grabbed Rook in the open. Break line of sight before the alarm fills.`);
    return;
  }
  if (world.alarm >= ALARM_MAX) {
    endHeist(false, 'The alarm hit 100% and the gallery locked down with Rook inside.');
    return;
  }
  if (world.loot.taken && thiefAtExit(world)) {
    endHeist(true);
  }
}

function frame(timestamp) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, lastTime ? (timestamp - lastTime) / 1000 : 0.016);
  lastTime = timestamp;

  if (phase === 'ready' && (wasPressed(input, 'start') || input.mouseDown)) {
    playClick();
    startHeist();
  } else if ((phase === 'won' || phase === 'caught') && (wasPressed(input, 'restart') || wasPressed(input, 'start'))) {
    playClick();
    startHeist();
  }

  if (phase === 'playing') updatePlaying(dt);

  render(ctx, world, guards, cameras);
  if (phase !== 'ready') updateHud();
  endFrame(input);
}

showOverlay(
  'MERIDIAN MIDNIGHT',
  'One room, one star, three guards and two cameras. Steal The Cobalt Star ' +
    'from its case in the top-right corner, then slip out through the green ESCAPE door. ' +
    'Hide behind plinths and planters — cover breaks a guard’s line of sight. ' +
    'Sneak the vent run along the top, the service corridor along the bottom, or straight through the hall. ' +
    'Q throws a decoy coin, E fires the EMP that blinds the cameras.',
  'WASD / arrows to move — click to walk there — Enter to start.',
);
requestAnimationFrame(frame);
