// guards.js — the patrol guards: where they walk, where they look, and
// whether they can see the thief. A guard that spots the thief chases
// for a short while; a thrown decoy coin lures a nearby guard away from
// its route instead.

import {
  GUARDS,
  GUARD_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_VIEW_RANGE,
  GUARD_VIEW_HALF_ANGLE,
  ALARM_GUARD_RATE,
  DECOY_LURE_SECONDS,
} from './config.js';
import { hasLineOfSight, moveBody, raiseAlarm } from './world.js';

export function createGuards() {
  return GUARDS.map((def, index) => {
    const start = def.waypoints[0];
    return {
      name: def.name,
      waypoints: def.waypoints,
      viewRange: def.viewRange || GUARD_VIEW_RANGE,
      waypointIndex: 1,
      x: start.x,
      y: start.y,
      radius: 13,
      angle: 0,
      state: 'patrol',
      chaseTimer: 0,
      lureTimer: 0,
      lureTarget: null,
      pauseTimer: 0,
      index,
    };
  });
}

function angleTo(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Can this guard see the thief right now: inside the cone's range and
// angle, with a clear line of sight?
export function guardSeesThief(world, guard) {
  const dx = world.thief.x - guard.x;
  const dy = world.thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > guard.viewRange) return false;
  if (dist < 26) return hasLineOfSight(world, guard.x, guard.y, world.thief.x, world.thief.y);
  const toThief = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(toThief, guard.angle)) > GUARD_VIEW_HALF_ANGLE) return false;
  return hasLineOfSight(world, guard.x, guard.y, world.thief.x, world.thief.y);
}

function walkToward(world, guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, speed * dt);
  const nx = (dx / dist) * step;
  const ny = (dy / dist) * step;
  const before = { x: guard.x, y: guard.y };
  moveBody(world, guard, nx, ny);
  guard.angle = angleTo(before.x, before.y, guard.x, guard.y);
  return dist <= step + 1;
}

export function updateGuards(world, guards, dt) {
  let anySees = false;
  for (const guard of guards) {
    if (guard.lureTimer > 0) {
      guard.lureTimer -= dt;
      guard.state = 'lured';
      if (guard.lureTarget) {
        const arrived = walkToward(world, guard, guard.lureTarget.x, guard.lureTarget.y, GUARD_SPEED * 1.25, dt);
        if (arrived || guard.lureTimer <= 0) {
          guard.lureTimer = 0;
          guard.lureTarget = null;
          guard.state = 'patrol';
        }
      }
      continue;
    }

    const sees = guardSeesThief(world, guard);
    if (sees) {
      anySees = true;
      raiseAlarm(world, ALARM_GUARD_RATE, dt);
      guard.state = 'chase';
      guard.chaseTimer = 1.6;
      walkToward(world, guard, world.thief.x, world.thief.y, GUARD_CHASE_SPEED, dt);
      continue;
    }

    if (guard.state === 'chase') {
      guard.chaseTimer -= dt;
      if (guard.chaseTimer > 0) {
        walkToward(world, guard, world.thief.x, world.thief.y, GUARD_CHASE_SPEED, dt);
        continue;
      }
      guard.state = 'patrol';
    }

    if (guard.pauseTimer > 0) {
      guard.pauseTimer -= dt;
      continue;
    }

    const target = guard.waypoints[guard.waypointIndex];
    const arrived = walkToward(world, guard, target.x, target.y, GUARD_SPEED, dt);
    if (arrived) {
      guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
      guard.pauseTimer = 0.9;
    }
  }
  return anySees;
}

// A decoy coin clatters to the floor; every guard close enough to hear it
// leaves its route to investigate the sound.
export function lureGuards(guards, x, y) {
  let lured = 0;
  for (const guard of guards) {
    const dist = Math.hypot(guard.x - x, guard.y - y);
    if (dist < 190) {
      guard.lureTimer = DECOY_LURE_SECONDS;
      guard.lureTarget = { x, y };
      guard.state = 'lured';
      lured += 1;
    }
  }
  return lured;
}

// A guard that physically catches the thief ends the heist at once.
export function guardCaughtThief(world, guards) {
  for (const guard of guards) {
    const dist = Math.hypot(guard.x - world.thief.x, guard.y - world.thief.y);
    if (dist < guard.radius + world.thief.radius - 2) return guard;
  }
  return null;
}
