// world.js — the gallery itself: walls, cover, the loot case, the exit
// door, and the geometry questions the rest of the game asks: can a body
// stand here, and can one point see another?

import {
  WALLS,
  COVER,
  LOOT,
  EXIT_DOOR,
  START_POSITION,
  START_ALARM,
  ALARM_DECAY_RATE,
  DECOY_START_COUNT,
  EMP_START_COUNT,
} from './config.js';

export function createWorld() {
  return {
    walls: WALLS,
    cover: COVER,
    loot: { ...LOOT, taken: false },
    exit: { ...EXIT_DOOR },
    thief: { x: START_POSITION.x, y: START_POSITION.y, radius: 13 },
    alarm: START_ALARM,
    alarmPeak: START_ALARM,
    decoys: DECOY_START_COUNT,
    emps: EMP_START_COUNT,
    decoyActive: null,
    empUntil: 0,
    elapsed: 0,
    spotted: false,
    status: 'ready',
    message: '',
  };
}

export function resetWorld(world) {
  const fresh = createWorld();
  Object.assign(world, fresh);
  world.thief = fresh.thief;
  world.loot = fresh.loot;
  world.exit = fresh.exit;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Can a circle of the given radius stand at (x, y) without touching a
// wall or a piece of cover? Cover is solid: the thief walks around it.
export function canStand(world, x, y, radius) {
  const box = { x: x - radius, y: y - radius, w: radius * 2, h: radius * 2 };
  for (const wall of world.walls) {
    if (rectsOverlap(box, wall)) return false;
  }
  for (const block of world.cover) {
    if (rectsOverlap(box, block)) return false;
  }
  return true;
}

// Move a body with axis separation so it slides along walls instead of
// sticking on corners.
export function moveBody(world, body, dx, dy) {
  const r = body.radius;
  if (canStand(world, body.x + dx, body.y, r)) body.x += dx;
  if (canStand(world, body.x, body.y + dy, r)) body.y += dy;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Quick reject: both ends on one outside side.
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  if (maxX < rect.x || minX > rect.x + rect.w) return false;
  if (maxY < rect.y || minY > rect.y + rect.h) return false;
  // Sample the segment; the gallery is small and the step is fine enough
  // that no wall thinner than the step can be skipped.
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    if (px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h) {
      return true;
    }
  }
  return false;
}

// True when nothing solid stands between the two points. Walls and cover
// both block sight, so a thief behind a plinth is safe inside a cone.
export function hasLineOfSight(world, x1, y1, x2, y2) {
  for (const wall of world.walls) {
    if (segmentHitsRect(x1, y1, x2, y2, wall)) return false;
  }
  for (const block of world.cover) {
    if (segmentHitsRect(x1, y1, x2, y2, block)) return false;
  }
  return true;
}

export function distanceToLoot(world) {
  return Math.hypot(world.thief.x - world.loot.x, world.thief.y - world.loot.y);
}

export function thiefAtExit(world) {
  const t = world.thief;
  return (
    t.x > world.exit.x - 6 &&
    t.x < world.exit.x + world.exit.w + 6 &&
    t.y > world.exit.y - 6 &&
    t.y < world.exit.y + world.exit.h + 6
  );
}

export function raiseAlarm(world, amount, dt) {
  world.alarm = Math.min(100, world.alarm + amount * dt);
  if (world.alarm > world.alarmPeak) world.alarmPeak = world.alarm;
}

export function decayAlarm(world, dt) {
  world.alarm = Math.max(0, world.alarm - ALARM_DECAY_RATE * dt);
}
