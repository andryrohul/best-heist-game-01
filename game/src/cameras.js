// cameras.js — the wall cameras: they sweep their arc, watch a cone of
// floor, and raise the alarm when the thief crosses it. An EMP freezes
// every camera for a few seconds; while frozen a camera sees nothing.

import {
  CAMERAS,
  CAMERA_VIEW_RANGE,
  CAMERA_VIEW_HALF_ANGLE,
  CAMERA_SWEEP_SPEED,
  CAMERA_SWEEP_ARC,
  ALARM_CAMERA_RATE,
  EMP_FREEZE_SECONDS,
} from './config.js';
import { hasLineOfSight, raiseAlarm } from './world.js';

export function createCameras() {
  return CAMERAS.map((def) => ({
    x: def.x,
    y: def.y,
    label: def.label,
    baseAngle: def.baseAngle,
    angle: def.baseAngle,
    sweepPhase: Math.random() * Math.PI * 2,
    frozen: false,
  }));
}

// The camera's current look direction, sweeping a sine arc around its
// mount angle. Frozen cameras hold still and see nothing.
export function updateCameras(world, cameras, dt, now) {
  const frozen = now < world.empUntil;
  for (const cam of cameras) {
    cam.frozen = frozen;
    if (!frozen) {
      cam.sweepPhase += CAMERA_SWEEP_SPEED * dt;
      cam.angle = cam.baseAngle + Math.sin(cam.sweepPhase) * CAMERA_SWEEP_ARC;
    }
  }
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function cameraSeesThief(world, cam) {
  if (cam.frozen) return false;
  const dx = world.thief.x - cam.x;
  const dy = world.thief.y - cam.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CAMERA_VIEW_RANGE) return false;
  const toThief = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(toThief, cam.angle)) > CAMERA_VIEW_HALF_ANGLE) return false;
  return hasLineOfSight(world, cam.x, cam.y, world.thief.x, world.thief.y);
}

export function updateCameraAlarm(world, cameras, dt) {
  let anySees = false;
  for (const cam of cameras) {
    if (cameraSeesThief(world, cam)) {
      anySees = true;
      raiseAlarm(world, ALARM_CAMERA_RATE, dt);
    }
  }
  return anySees;
}

export function fireEmp(world, now) {
  if (world.emps <= 0) return false;
  world.emps -= 1;
  world.empUntil = now + EMP_FREEZE_SECONDS;
  return true;
}

export function empSecondsLeft(world, now) {
  return Math.max(0, world.empUntil - now);
}
