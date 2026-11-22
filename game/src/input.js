// input.js — keyboard and mouse state for the heist.
// WASD or arrows move the thief; Q throws a decoy coin toward the mouse,
// E fires the EMP, R restarts after a win or a capture, Enter starts.
// A mouse click sets a walk target so the game is playable by mouse alone.

export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    clickTarget: null,
    pressed: new Set(),
  };

  const KEY_ALIASES = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
    KeyQ: 'decoy',
    KeyE: 'emp',
    KeyR: 'restart',
    Enter: 'start',
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', (event) => {
    const action = KEY_ALIASES[event.code] || KEY_ALIASES[event.key];
    if (!action) return;
    if (['up', 'down', 'left', 'right'].includes(action)) event.preventDefault();
    if (!keys.has(action)) state.pressed.add(action);
    keys.add(action);
  });

  window.addEventListener('keyup', (event) => {
    const action = KEY_ALIASES[event.code] || KEY_ALIASES[event.key];
    if (action) keys.delete(action);
  });

  window.addEventListener('blur', () => {
    keys.clear();
  });

  canvas.addEventListener('mousemove', (event) => {
    const p = canvasPoint(event);
    state.mouseX = p.x;
    state.mouseY = p.y;
  });

  canvas.addEventListener('mousedown', (event) => {
    const p = canvasPoint(event);
    state.mouseX = p.x;
    state.mouseY = p.y;
    state.mouseDown = true;
    state.clickTarget = { x: p.x, y: p.y };
  });

  window.addEventListener('mouseup', () => {
    state.mouseDown = false;
  });

  return state;
}

// True once for the frame in which the action key went down.
export function wasPressed(input, action) {
  return input.pressed.has(action);
}

export function endFrame(input) {
  input.pressed.clear();
}

// A unit movement vector from held keys, or null when idle.
export function moveVector(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('left')) x -= 1;
  if (input.keys.has('right')) x += 1;
  if (input.keys.has('up')) y -= 1;
  if (input.keys.has('down')) y += 1;
  if (x === 0 && y === 0) return null;
  const len = Math.hypot(x, y);
  return { x: x / len, y: y / len };
}
