// render.js — everything the player sees on the canvas: the gallery
// floor with its three routes, the walls and cover, the loot case, the
// getaway door, every vision cone, and the thief, guards and cameras
// themselves. Safe cover, danger and loot each read at a glance.

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './config.js';

export function drawCone(ctx, x, y, angle, halfAngle, range, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawFloor(ctx, world) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Checkerboard tiles so movement reads clearly.
  ctx.fillStyle = COLORS.floorTile;
  const tile = 40;
  for (let ty = 0; ty < CANVAS_HEIGHT / tile; ty += 1) {
    for (let tx = 0; tx < CANVAS_WIDTH / tile; tx += 1) {
      if ((tx + ty) % 2 === 0) ctx.fillRect(tx * tile, ty * tile, tile, tile);
    }
  }
  // The vent run along the top and the service corridor along the bottom
  // are tinted so the three routes read as three routes.
  ctx.fillStyle = COLORS.ventFloor;
  ctx.fillRect(16, 16, 928, 94);
  ctx.fillStyle = COLORS.corridorFloor;
  ctx.fillRect(16, 536, 928, 88);
  // Vent grates mark the two gaps into the top run.
  ctx.fillStyle = '#3d3350';
  ctx.fillRect(180, 110, 60, 16);
  ctx.fillRect(700, 110, 80, 16);
  ctx.strokeStyle = '#8a7bb0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(186 + i * 14, 112);
    ctx.lineTo(186 + i * 14, 124);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(706 + i * 18, 112);
    ctx.lineTo(706 + i * 18, 124);
    ctx.stroke();
  }
  // Labels painted on the floor name each route.
  ctx.fillStyle = 'rgba(220, 220, 240, 0.35)';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VENT RUN', 30, 40);
  ctx.fillText('SERVICE CORRIDOR', 30, 560);
  ctx.fillText('MAIN HALL', 340, 505);
}

function drawWalls(ctx, world) {
  for (const wall of world.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, Math.min(4, wall.h));
  }
}

function drawCover(ctx, world) {
  for (const block of world.cover) {
    if (block.kind === 'plinth') {
      ctx.fillStyle = COLORS.coverPlinth;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.fillStyle = '#a08a5f';
      ctx.fillRect(block.x + 4, block.y + 4, block.w - 8, 8);
      ctx.fillStyle = '#d8c58a';
      ctx.beginPath();
      ctx.arc(block.x + block.w / 2, block.y + block.h / 2 + 4, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (block.kind === 'planter') {
      ctx.fillStyle = COLORS.coverPlanter;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.fillStyle = '#3f8f5f';
      ctx.beginPath();
      ctx.arc(block.x + 16, block.y + 18, 13, 0, Math.PI * 2);
      ctx.arc(block.x + 36, block.y + 30, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = COLORS.coverCrate;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.strokeStyle = '#5f4a26';
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x + 3, block.y + 3, block.w - 6, block.h - 6);
      ctx.beginPath();
      ctx.moveTo(block.x, block.y);
      ctx.lineTo(block.x + block.w, block.y + block.h);
      ctx.stroke();
    }
  }
}

function drawExit(ctx, world) {
  const locked = !world.loot.taken;
  ctx.fillStyle = locked ? COLORS.exitLocked : COLORS.exit;
  ctx.fillRect(world.exit.x, world.exit.y, world.exit.w, world.exit.h);
  ctx.fillStyle = '#0c2418';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(locked ? 'LOCKED' : 'ESCAPE', world.exit.x + world.exit.w / 2, world.exit.y + 34);
  ctx.strokeStyle = locked ? '#8a9a90' : '#eafff0';
  ctx.lineWidth = 3;
  ctx.strokeRect(world.exit.x + 2, world.exit.y + 2, world.exit.w - 4, world.exit.h - 4);
  if (!locked) {
    ctx.fillStyle = 'rgba(61, 220, 132, 0.25)';
    ctx.fillRect(world.exit.x - 8, world.exit.y - 8, world.exit.w + 16, world.exit.h + 16);
  }
}

function drawLoot(ctx, world) {
  if (world.loot.taken) return;
  const pulse = 1 + Math.sin(performance.now() / 280) * 0.08;
  ctx.save();
  ctx.translate(world.loot.x, world.loot.y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = COLORS.lootGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  // Glass display case.
  ctx.fillStyle = 'rgba(200, 225, 255, 0.18)';
  ctx.fillRect(-26, -26, 52, 52);
  ctx.strokeStyle = '#bcd8ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(-26, -26, 52, 52);
  // The Cobalt Star: a faceted blue diamond.
  ctx.fillStyle = COLORS.loot;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8ecff';
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#cfe6ff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE COBALT STAR', world.loot.x, world.loot.y - 36);
}

function drawThief(ctx, world) {
  const t = world.thief;
  ctx.save();
  ctx.translate(t.x, t.y);
  // Soft shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hooded figure in teal: cloak, hood and a pale face slit.
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thiefTrim;
  ctx.beginPath();
  ctx.arc(0, -2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8fbff';
  ctx.fillRect(-5, -4, 10, 3);
  ctx.restore();
}

function drawGuards(ctx, guards, world) {
  for (const guard of guards) {
    const hot = guard.state === 'chase';
    drawCone(
      ctx,
      guard.x,
      guard.y,
      guard.angle,
      0.62,
      guard.viewRange,
      hot ? COLORS.coneGuardHot : COLORS.coneGuard,
    );
  }
  for (const guard of guards) {
    const hot = guard.state === 'chase';
    ctx.save();
    ctx.translate(guard.x, guard.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hot ? '#ff6b4a' : COLORS.guard;
    ctx.beginPath();
    ctx.arc(0, 0, guard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.guardTrim;
    ctx.fillRect(-7, -13, 14, 6);
    // Flashlight dot shows exactly where the guard looks.
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(Math.cos(guard.angle) * 16, Math.sin(guard.angle) * 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (guard.state === 'lured') {
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', guard.x, guard.y - 20);
    }
    if (hot) {
      ctx.fillStyle = '#ff503c';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 20);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const cam of cameras) {
    drawCone(
      ctx,
      cam.x,
      cam.y,
      cam.angle,
      0.52,
      205,
      cam.frozen ? COLORS.coneCameraOff : COLORS.coneCamera,
    );
  }
  for (const cam of cameras) {
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(cam.angle);
    ctx.fillStyle = cam.frozen ? '#7a8698' : COLORS.camera;
    ctx.fillRect(-4, -6, 16, 12);
    ctx.fillStyle = '#2a0e14';
    ctx.beginPath();
    ctx.arc(13, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cam.frozen ? '#55606e' : '#ff8ba0';
    ctx.beginPath();
    ctx.arc(13, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = cam.frozen ? '#8a94a2' : '#ff8ba0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cam.frozen ? cam.label + ' OFF' : cam.label, cam.x + 16, cam.y - 10);
  }
}

function drawDecoy(ctx, world) {
  const d = world.decoyActive;
  if (!d) return;
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath();
  ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff3c4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(d.x, d.y, 11 + Math.sin(performance.now() / 120) * 2, 0, Math.PI * 2);
  ctx.stroke();
}

export function render(ctx, world, guards, cameras) {
  drawFloor(ctx, world);
  drawExit(ctx, world);
  drawCover(ctx, world);
  drawWalls(ctx, world);
  drawLoot(ctx, world);
  drawDecoy(ctx, world);
  drawCameras(ctx, cameras);
  drawGuards(ctx, guards, world);
  drawThief(ctx, world);
  if (world.spotted) {
    ctx.fillStyle = 'rgba(255, 60, 40, 0.10)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED — BREAK LINE OF SIGHT!', CANVAS_WIDTH / 2, 36);
  }
}
