import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import {toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {moveTo, press, pressButton, releaseButton, rest} from '../lib/input/input.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {nextFrame, settled} from '../lib/wait.js';

const {require, eventually} = checks('tiled');
const COLOR = '#bf3070';
const TOLERANCE = 12;
const DRAG_STEPS = 16;
const GRAB_HEIGHT = 16;
const EDGES = [
  [Meta.Direction.TOP, 'top'],
  [Meta.Direction.RIGHT, 'right'],
  [Meta.Direction.BOTTOM, 'bottom'],
  [Meta.Direction.LEFT, 'left'],
];
const QUARTERS = [1, 0];
const THIRDS = [0, 2];

const flags = names => EDGES.filter(([, name]) => names.includes(name)).reduce((all, [flag]) => all | flag, 0);
const reported = window => window.get_title().split(': ')[1];

async function cornersSquare(window) {
  const frame = window.get_frame_rect();
  const shot = await captureFrame(frame);
  const right = frame.width - 1;
  const bottom = frame.height - 1;
  return [[0, 0], [right, 0], [0, bottom], [right, bottom]].map(([x, y]) => shot.near(x, y, COLOR, TOLERANCE));
}

async function expectTiled(window, names, how) {
  const edges = names.join(' ');
  await eventually(() => window.get_tiled_edges() === flags(names), `${how} marks the window tiled on its ${edges} edges`);
  await eventually(() => reported(window) === edges, `${how} tells the app it is tiled on exactly its ${edges} edges`);
  await settled();
  const corners = await cornersSquare(window);
  require(corners.every(Boolean), `${how} squares every corner`);
}

async function expectFloating(window, how) {
  await eventually(() => window.get_tiled_edges() === 0 && reported(window) === 'floating', `${how} lets the window float again`);
  await settled();
  const corners = await cornersSquare(window);
  require(!corners.some(Boolean), `${how} rounds every corner again`);
}

async function snapWithLayout(window, [row, card], zone) {
  window.activate(global.get_current_time());
  await eventually(() => window.has_focus(), 'the window takes focus');
  toggleSurface('snap');
  const picker = named('kestrel-snap-layouts');
  await eventually(() => picker.visible, 'Super+Z shows snap layouts');
  picker.get_child_at_index(row).get_child_at_index(card).get_child_at_index(zone).emit('clicked', 1);
}

function beginGrab(window, op) {
  const sprite = global.stage.get_context().get_backend().get_pointer_sprite(global.stage);
  window.begin_grab_op(op, sprite, global.get_current_time(), null);
}

async function drag(window, [toX, toY]) {
  const frame = window.get_frame_rect();
  const [fromX, fromY] = [frame.x + frame.width / 2, frame.y + GRAB_HEIGHT];
  moveTo([fromX, fromY]);
  await nextFrame();
  beginGrab(window, Meta.GrabOp.MOVING);
  for (let step = 1; step <= DRAG_STEPS; step++) {
    moveTo([fromX + (toX - fromX) * step / DRAG_STEPS, fromY + (toY - fromY) * step / DRAG_STEPS]);
    await nextFrame();
  }
  pressButton();
  releaseButton();
}

async function checkLayouts(window, backend) {
  await snapWithLayout(window, QUARTERS, 0);
  await expectTiled(window, ['top', 'left'], `A ${backend} quarter from snap layouts`);
  await capture(`tiled-${backend}-quarter`);

  window.change_workspace_by_index(1, false);
  await eventually(() => window.get_workspace().index() === 1, 'the window moves to the next workspace');
  require(window.get_tiled_edges() === flags(['top', 'left']), `a tiled ${backend} window stays tiled on another workspace`);
  window.change_workspace_by_index(0, false);

  window.maximize();
  await eventually(() => window.is_maximized(), 'the snapped window maximizes');
  window.unmaximize();
  await expectTiled(window, ['top', 'left'], `Restoring a maximized ${backend} quarter`);

  await snapWithLayout(window, THIRDS, 1);
  await expectTiled(window, ['top', 'bottom'], `A ${backend} middle third from snap layouts`);
  await capture(`tiled-${backend}-third`);
}

async function checkCorner(window, backend, area) {
  await drag(window, [area.x + area.width - 1, area.y + 1]);
  await eventually(() => {
    const frame = window.get_frame_rect();
    return frame.y === area.y && frame.x + frame.width === area.x + area.width && Math.abs(frame.width - area.width / 2) <= 1;
  }, 'the window snaps into the top right corner');
  await expectTiled(window, ['top', 'right'], `Dragging a ${backend} window into a corner`);

  await drag(window, [area.x + area.width / 3, area.y + area.height / 2]);
  await expectFloating(window, `Dragging a snapped ${backend} window away`);
  await capture(`tiled-${backend}-floating`);
}

async function checkKeyboardMove(window, backend) {
  await snapWithLayout(window, QUARTERS, 0);
  await expectTiled(window, ['top', 'left'], `Snapping a ${backend} window again`);
  beginGrab(window, Meta.GrabOp.KEYBOARD_MOVING);
  await expectFloating(window, `Moving a snapped ${backend} window from its menu`);
  press(Clutter.KEY_Return);
}

async function checkBackend(backend) {
  const client = gjs('clients/windows/tiledWindow.js', [], {env: {GDK_BACKEND: backend}});
  const window = await waitForWindow(candidate => candidate.get_title()?.startsWith(`Kestrel tiled ${backend}:`));
  try {
    window.move_to_monitor(global.display.get_primary_monitor());
    const area = Main.layoutManager.getWorkAreaForMonitor(window.get_monitor());
    await eventually(() => reported(window) === 'floating', `a new ${backend} window floats`);
    await checkLayouts(window, backend);
    await checkCorner(window, backend, area);
    await checkKeyboardMove(window, backend);
  } finally {
    rest();
    await stop(client);
  }
}

export async function run() {
  await checkBackend('wayland');
  await checkBackend('x11');
}
