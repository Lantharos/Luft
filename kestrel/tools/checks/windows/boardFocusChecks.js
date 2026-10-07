import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {touchpad} from './touchpad.js';

const SETTLE = 700;
const GRID = {Notes: [0, 0], Inbox: [1200, 0], Music: [0, 900], Files: [1200, 900]};

const screenPoint = (view, viewport, x, y) => [viewport.x + (x - view.x) * view.scale, viewport.y + (y - view.y) * view.scale];
const sameView = (a, b) => Math.abs(a.scale - b.scale) < 1e-6 && Math.abs(a.x - b.x) < 1e-3 && Math.abs(a.y - b.y) < 1e-3;

export async function checkBoardFocus({board, named, windows, fixture, pointer, keyboard, pause, capture, output, require}) {
  const viewport = board.viewport;
  const view = () => ({...board.camera.view});
  const time = () => GLib.get_monotonic_time();
  const press = keyval => {
    keyboard.notify_keyval(time(), keyval, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(time(), keyval, Clutter.KeyState.RELEASED);
  };
  const superKey = async keyval => {
    keyboard.notify_keyval(time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    press(keyval);
    await pause(60);
    keyboard.notify_keyval(time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
    await pause(SETTLE);
  };
  const centerOf = window => {
    const rect = window.get_frame_rect();
    return screenPoint(board.camera.view, viewport, rect.x + rect.width / 2, rect.y + rect.height / 2);
  };
  const enteredFully = window => {
    const rect = window.get_frame_rect();
    const scale = Math.min(1, (viewport.width - 48) / rect.width, (viewport.height - 48) / rect.height);
    const [x, y] = centerOf(window);
    return board.enteredWindow() === window && global.display.focus_window === window &&
      Math.abs(board.camera.view.scale - scale) < 1e-6 &&
      Math.abs(x - viewport.x - viewport.width / 2) < 1 && Math.abs(y - viewport.y - viewport.height / 2) < 1;
  };
  const dimmedAround = window => windows().every(other => {
    const opacity = other.get_compositor_private().opacity;
    return other === window ? opacity === 255 : opacity < 255;
  });
  const gesture = async events => {
    for (const event of events) board.input.handle(event);
    await pause(SETTLE);
  };
  const pinch = (scale, [x, y]) => gesture([
    touchpad.pinch('begin', 3, 1, x, y),
    touchpad.pinch('update', 3, (1 + scale) / 2, x, y),
    touchpad.pinch('update', 3, scale, x, y),
    touchpad.pinch('end', 3, scale, x, y),
  ]);
  const swipe = (fingers, dx, dy) => gesture([
    touchpad.swipe('begin', fingers),
    touchpad.swipe('update', fingers, dx / 2, dy / 2),
    touchpad.swipe('update', fingers, dx / 2, dy / 2),
    touchpad.swipe('end', fingers),
  ]);

  for (const [title, [x, y]] of Object.entries(GRID)) named(title).move_frame(false, x, y);
  board.fitAll();
  await pause(SETTLE);
  const overview = view();
  require(overview.scale < 0.6 && !board.enteredWindow(), `the overview shows the windows at ${Math.round(overview.scale * 100)}%`);

  const notes = named('Notes');
  const [clickX, clickY] = centerOf(notes);
  pointer.notify_absolute_motion(time(), clickX, clickY);
  pointer.notify_button(time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
  await pause(SETTLE);
  require(enteredFully(notes), 'clicking a window in the overview enters it at 100%, centered and focused');
  require(dimmedAround(notes), 'the other windows dim while one is entered');
  for (const key of 'hi') press(key.charCodeAt(0));
  await pause(300);
  require(notes.get_title() === 'Notes: hi', 'typing reaches the entered window');
  await capture(`${output}/board-entered.png`);

  await superKey(Clutter.KEY_Right);
  require(enteredFully(named('Inbox')), 'Super+Right enters the window to the right');
  await superKey(Clutter.KEY_Down);
  require(enteredFully(named('Files')), 'Super+Down enters the window below');
  await superKey(Clutter.KEY_Left);
  require(enteredFully(named('Music')), 'Super+Left enters the window to the left');
  await superKey(Clutter.KEY_Up);
  require(enteredFully(notes), 'Super+Up enters the window above');
  await superKey(Clutter.KEY_Up);
  require(enteredFully(notes), 'Super+Up stays put with nothing above');

  await superKey(Clutter.KEY_Escape);
  require(!board.enteredWindow() && sameView(view(), overview), 'Super+Escape returns to the overview it came from');
  require(windows().every(window => window.get_compositor_private().opacity === 255), 'no window stays dimmed in the overview');

  await superKey(Clutter.KEY_Return);
  require(enteredFully(notes), 'Super+Enter enters the focused window');
  await pinch(0.7, centerOf(notes));
  require(!board.enteredWindow() && sameView(view(), overview), 'pinching in returns to the overview');

  const inbox = named('Inbox');
  await pinch(1.4, centerOf(inbox));
  require(enteredFully(inbox), 'spreading three fingers over a window enters it');
  await swipe(3, 120, 0);
  require(enteredFully(notes), 'a three-finger swipe to the right brings in the window on the left');
  await swipe(3, 0, 120);
  require(board.shown && !board.enteredWindow() && sameView(view(), overview), 'a three-finger swipe down returns to the overview and stays on the board');

  const before = global.display.focus_window;
  keyboard.notify_keyval(time(), Clutter.KEY_Alt_L, Clutter.KeyState.PRESSED);
  press(Clutter.KEY_Tab);
  await pause(350);
  keyboard.notify_keyval(time(), Clutter.KEY_Alt_L, Clutter.KeyState.RELEASED);
  await pause(SETTLE);
  const chosen = global.display.focus_window;
  require(chosen !== before && enteredFully(chosen), 'Alt+Tab enters the chosen window');

  const rect = chosen.get_frame_rect();
  chosen.move_resize_frame(true, rect.x, rect.y, 1700, 1100);
  await pause(SETTLE);
  require(chosen.get_frame_rect().width > rect.width && enteredFully(chosen), 'the view follows the entered window as it grows');
  chosen.move_frame(true, rect.x - 400, rect.y);
  await pause(SETTLE);
  require(enteredFully(chosen), 'the view follows the entered window as it moves');

  const extra = Gio.Subprocess.new(['gjs', '-m', fixture, 'Extra', '480', '360'], Gio.SubprocessFlags.NONE);
  try {
    let added = null;
    for (let tries = 0; !added && tries < 40; tries++) {
      await pause(100);
      added = global.get_window_actors().map(actor => actor.meta_window).find(window => window.get_title()?.startsWith('Extra'));
    }
    await pause(SETTLE);
    const beside = chosen.get_frame_rect();
    const placed = added.get_frame_rect();
    require(placed.x >= beside.x + beside.width && placed.y < beside.y + beside.height && placed.y + placed.height > beside.y,
      'a window opened while another is entered lands beside it');
  } finally {
    extra.force_exit();
    await pause(500);
  }

  chosen.move_resize_frame(true, rect.x, rect.y, rect.width, rect.height);
  await superKey(Clutter.KEY_Escape);
}
