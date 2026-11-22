// config.js — every fixed number that shapes the Meridian Gallery heist:
// canvas size, the room's walls and cover, patrol routes, cameras, loot,
// the getaway door, and the tuning of the alarm, tools and movement.

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;

export const THIEF_SPEED = 165;
export const THIEF_RADIUS = 13;

export const GUARD_SPEED = 62;
export const GUARD_CHASE_SPEED = 96;
export const GUARD_VIEW_RANGE = 175;
export const GUARD_VIEW_HALF_ANGLE = 0.62;

export const CAMERA_VIEW_RANGE = 205;
export const CAMERA_VIEW_HALF_ANGLE = 0.52;
export const CAMERA_SWEEP_SPEED = 0.55;
export const CAMERA_SWEEP_ARC = 0.85;

export const ALARM_GUARD_RATE = 55;
export const ALARM_CAMERA_RATE = 42;
export const ALARM_DECAY_RATE = 9;
export const ALARM_MAX = 100;

export const DECOY_START_COUNT = 2;
export const DECOY_LURE_SECONDS = 4;
export const DECOY_LURE_RADIUS = 190;

export const EMP_START_COUNT = 1;
export const EMP_FREEZE_SECONDS = 6;

export const START_POSITION = { x: 62, y: 584 };
export const START_ALARM = 0;

// Walls are solid rectangles. The outer frame plus two interior walls
// carve the gallery into three routes: the open central hall, the narrow
// vent run along the top, and the service corridor along the bottom.
export const WALLS = [
  { x: 0, y: 0, w: 960, h: 16 },
  { x: 0, y: 624, w: 960, h: 16 },
  { x: 0, y: 0, w: 16, h: 640 },
  { x: 944, y: 0, w: 16, h: 640 },
  { x: 300, y: 120, w: 16, h: 300 },
  { x: 620, y: 220, w: 16, h: 300 },
  { x: 16, y: 110, w: 164, h: 16 },
  { x: 240, y: 110, w: 460, h: 16 },
  { x: 780, y: 110, w: 164, h: 16 },
  // The wall above the service corridor has two gaps: one near the left
  // end (a quiet way up before the corridor guard's patrol) and one near
  // the right end (the direct way up, past the guard).
  { x: 16, y: 520, w: 224, h: 16 },
  { x: 320, y: 520, w: 240, h: 16 },
  { x: 640, y: 520, w: 304, h: 16 },
];

// Cover blocks a guard's line of sight. A thief crouched behind a plinth
// or planter is invisible even inside a vision cone.
export const COVER = [
  { x: 180, y: 300, w: 52, h: 52, kind: 'planter' },
  { x: 380, y: 200, w: 62, h: 42, kind: 'plinth' },
  { x: 480, y: 330, w: 62, h: 42, kind: 'plinth' },
  { x: 400, y: 440, w: 52, h: 52, kind: 'planter' },
  { x: 700, y: 180, w: 52, h: 52, kind: 'planter' },
  { x: 760, y: 400, w: 62, h: 42, kind: 'plinth' },
  { x: 560, y: 150, w: 40, h: 40, kind: 'crate' },
];

// Guards walk their waypoint loops and look where they walk.
export const GUARDS = [
  {
    name: 'Hall Guard',
    waypoints: [
      { x: 360, y: 300 },
      { x: 560, y: 300 },
      { x: 560, y: 460 },
      { x: 360, y: 460 },
    ],
  },
  {
    name: 'Star Guard',
    waypoints: [
      { x: 700, y: 180 },
      { x: 880, y: 180 },
      { x: 880, y: 320 },
      { x: 700, y: 320 },
    ],
  },
  {
    name: 'Corridor Guard',
    // Patrols only the right half of the service corridor, so the thief's
    // starting corner stays out of its vision range: the opening is a
    // chance to read the patrol, not an ambush. Short-sighted: it watches
    // the direct gap to the hall, not the quiet left gap.
    viewRange: 130,
    waypoints: [
      { x: 300, y: 580 },
      { x: 520, y: 580 },
    ],
  },
];

// Wall cameras sweep a fixed arc from their mount.
export const CAMERAS = [
  { x: 316, y: 132, baseAngle: Math.PI / 2, label: 'CAM-1' },
  { x: 636, y: 508, baseAngle: -Math.PI / 2, label: 'CAM-2' },
];

export const LOOT = {
  x: 862,
  y: 72,
  radius: 24,
  name: 'The Cobalt Star',
};

export const EXIT_DOOR = { x: 888, y: 560, w: 56, h: 64 };

export const DECOY_THROW_RANGE = 260;

export const COLORS = {
  floor: '#1d2436',
  floorTile: '#232c42',
  ventFloor: '#2a2438',
  corridorFloor: '#1c2b2a',
  wall: '#4a3f55',
  wallTop: '#6b5a78',
  coverPlinth: '#7a6a4f',
  coverPlanter: '#2f6b4a',
  coverCrate: '#8a6b3d',
  coneGuard: 'rgba(255, 196, 66, 0.20)',
  coneGuardHot: 'rgba(255, 80, 60, 0.30)',
  coneCamera: 'rgba(255, 70, 90, 0.16)',
  coneCameraOff: 'rgba(120, 130, 150, 0.10)',
  thief: '#39c6d6',
  thiefTrim: '#0e7d8c',
  guard: '#e8b23a',
  guardTrim: '#8a5c10',
  camera: '#ff4d6d',
  loot: '#5fb8ff',
  lootGlow: 'rgba(95, 184, 255, 0.35)',
  exit: '#3ddc84',
  exitLocked: '#5a6b62',
  alarmLow: '#3ddc84',
  alarmMid: '#ffc442',
  alarmHigh: '#ff503c',
};
