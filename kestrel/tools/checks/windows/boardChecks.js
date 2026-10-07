import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {board as currentBoard} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {captureFrame} from '../apps/luftApp.js';
import {checkBoardCorner} from './boardCornerChecks.js';
import {checkBoardFocus} from './boardFocusChecks.js';
import {checkBoardView, headerOf} from './boardViewChecks.js';
import {checkBoardX11} from './boardX11Checks.js';
import {touchpad} from './touchpad.js';

const WINDOWS = [['Notes', 720, 460], ['Inbox', 640, 520], ['Music', 560, 380], ['Files', 800, 500]];
const SETTLE = 700;

const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const screenPoint = (view, viewport, x, y) => [viewport.x + (x - view.x) * view.scale, viewport.y + (y - view.y) * view.scale];

export async function checkBoard({pause, capture, pointer, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel board check failed: ${label}`);
    console.log(`Kestrel board check: ${label}`);
  };
  const board = currentBoard();
  const fixture = GLib.build_filenamev([GLib.path_get_dirname(GLib.getenv('KESTREL_WINDOW_SCRIPT')), 'boardWindow.js']);
  const apps = WINDOWS.map(([title, width, height]) =>
    Gio.Subprocess.new(['gjs', '-m', fixture, title, `${width}`, `${height}`], Gio.SubprocessFlags.NONE));
  const manager = global.workspace_manager;
  const group = global.window_group;
  const panel = Main.layoutManager.uiGroup.get_children().find(actor => actor.name === 'kestrel-panel');
  const windows = () => global.get_window_actors().map(actor => actor.meta_window)
    .filter(window => WINDOWS.some(([title]) => window.get_title()?.startsWith(title)));
  const named = title => windows().find(window => window.get_title().startsWith(title));
  const rects = () => windows().filter(window => !window.minimized).map(window => window.get_frame_rect());
  const noOverlap = () => rects().every((a, i) => rects().every((b, j) => i === j || !overlap(a, b)));
  const view = () => ({...board.camera.view});
  try {
    await pause(2500);
    require(windows().length === 4, 'four windows open on the first desktop');
    require(!noOverlap(), 'the desktop starts with stacked windows');
    named('Inbox').activate(global.get_current_time());
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 1, 1);
    await pause(400);
    const header = await captureFrame(headerOf(named('Inbox')));

    global.display.emit('overlay-key');
    await pause(120);
    global.display.emit('overlay-key');
    await pause(SETTLE);
    require(board.shown && !Main.layoutManager.uiGroup.get_children().find(actor => actor.name === 'kestrel-start')?.visible,
      'double-tapping Super turns the board on without leaving Start open');
    require(windows().every(window => window.unconstrained), 'windows on the board can go anywhere');
    require(noOverlap(), 'no windows overlap on the board');
    require(group.scale_x === board.camera.view.scale && group.scale_x <= 1, 'the window group shows the board through one transform');
    await pause(300);
    require(!panel.visible, 'the taskbar steps aside on the board');
    await capture(`${output}/board.png`);

    const index = manager.get_active_workspace_index();
    Main.wm.actionMoveWorkspace(manager.get_workspace_by_index(index + 1));
    await pause(SETTLE);
    require(!board.shown && group.scale_x === 1 && group.translation_x === 0, 'the next desktop stays a normal desktop');
    require(panel.visible, 'the taskbar returns on a normal desktop');
    const saved = view();
    Main.wm.actionMoveWorkspace(manager.get_workspace_by_index(index));
    await pause(SETTLE);
    require(board.shown && JSON.stringify(view()) === JSON.stringify(saved), 'returning to the board keeps its view');
    const superScroll = async direction => {
      keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
      pointer.notify_discrete_scroll(GLib.get_monotonic_time(), direction, Clutter.ScrollSource.WHEEL);
      await pause(60);
      keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
      await pause(SETTLE);
    };
    await superScroll(Clutter.ScrollDirection.DOWN);
    require(manager.get_active_workspace_index() === index + 1 && !board.shown, 'Super and scrolling switches to the next desktop from a board');
    await superScroll(Clutter.ScrollDirection.UP);
    require(manager.get_active_workspace_index() === index && board.shown && JSON.stringify(view()) === JSON.stringify(saved),
      'Super and scrolling back returns to the board as it was');

    const viewport = board.viewport;
    const before = view();
    for (const event of [touchpad.swipe('begin', 3), touchpad.swipe('update', 3, 120, 60), touchpad.swipe('update', 3, 80, 40)])
      board.input.handle(event);
    const panned = view();
    board.input.handle(touchpad.swipe('end', 3));
    board.camera.stop();
    require(Math.abs(before.x - 200 / before.scale - panned.x) < 1e-6 && Math.abs(before.y - 100 / before.scale - panned.y) < 1e-6,
      'a three-finger swipe pans the board with the fingers');
    const focusX = viewport.x + viewport.width / 3;
    const focusY = viewport.y + viewport.height / 2;
    const anchor = [board.camera.view.x + (focusX - viewport.x) / board.camera.view.scale, board.camera.view.y + (focusY - viewport.y) / board.camera.view.scale];
    for (const event of [touchpad.pinch('begin', 2, 1, focusX, focusY), touchpad.pinch('update', 2, 1.4, focusX, focusY), touchpad.pinch('end', 2, 1.4, focusX, focusY)])
      board.input.handle(event);
    const [anchorX, anchorY] = screenPoint(board.camera.view, viewport, ...anchor);
    require(Math.abs(anchorX - focusX) < 0.5 && Math.abs(anchorY - focusY) < 0.5, 'pinching zooms around the fingers');
    require(Number.isInteger(group.translation_x) && Number.isInteger(group.translation_y), 'the board is drawn on whole pixels after a pinch');

    board.fitAll();
    await pause(SETTLE);
    const zoomed = board.camera.view;

    const inbox = named('Inbox');
    const start = inbox.get_frame_rect();
    const [grabX, grabY] = screenPoint(zoomed, viewport, start.x + start.width / 2, start.y + start.height / 2);
    board.input.handle(touchpad.hold('begin', 3));
    board.input.handle(touchpad.hold('end', 3, 80));
    for (const event of [touchpad.swipe('begin', 3, 0, 0, grabX, grabY), touchpad.swipe('update', 3, -60, 0, grabX, grabY), touchpad.swipe('update', 3, -60, 0, grabX, grabY), touchpad.swipe('end', 3, 0, 0, grabX, grabY)])
      board.input.handle(event);
    await pause(200);
    const moved = inbox.get_frame_rect();
    require(moved.x !== start.x, 'tapping with three fingers and swiping moves the window under them');
    require(noOverlap(), 'windows pushed aside still never overlap');

    const superDrag = async (window, screenDx, screenDy) => {
      const frame = window.get_frame_rect();
      const [fromX, fromY] = screenPoint(board.camera.view, viewport, frame.x + frame.width / 2, frame.y + frame.height / 2);
      keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
      pointer.notify_absolute_motion(GLib.get_monotonic_time(), fromX, fromY);
      pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
      for (let step = 1; step <= 12; step++) {
        pointer.notify_absolute_motion(GLib.get_monotonic_time(), fromX + screenDx * step / 12, fromY + screenDy * step / 12);
        await pause(30);
      }
      await pause(150);
      pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
      keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
      await pause(300);
      return frame;
    };
    const music = named('Music');
    const scale = board.camera.view.scale;
    const lifted = await superDrag(music, 0, -90);
    const after = music.get_frame_rect();
    require(Math.abs(after.y - lifted.y + 90 / scale) <= 14 / scale && Math.abs(after.x - lifted.x) <= 14 / scale,
      `Super+dragging follows the pointer at ${Math.round(scale * 100)}%`);
    const files = named('Files');
    const filesBefore = files.get_frame_rect();
    const target = filesBefore;
    const source = music.get_frame_rect();
    await superDrag(music, (target.x - source.x) * scale, (target.y - source.y) * scale);
    require(noOverlap() && !files.get_frame_rect().equal(filesBefore), 'dropping a window onto another pushes it aside');

    await checkBoardFocus({board, named, windows, fixture, pointer, keyboard, pause, capture, output, require});
    await checkBoardView({board, named, pointer, keyboard, pause, capture, output, require, header});
    await checkBoardX11({board, pointer, keyboard, pause, require});
    await checkBoardCorner({board, named, windows, pointer, keyboard, pause, capture, output, require});

    const layout = new Map(windows().map(window => [window, window.get_frame_rect()]));
    board.enterWindow(named('Files'));
    await pause(SETTLE);
    require(board.enteredWindow() === named('Files'), 'a window can be entered right before leaving the board');
    const filling = view();
    board.input.handle(touchpad.swipe('begin', 4));
    board.input.handle(touchpad.swipe('update', 4, 0, 30));
    board.input.handle(touchpad.swipe('end', 4));
    await pause(SETTLE);
    require(!board.shown && group.scale_x === 1, 'a four-finger swipe down leaves the board even with a window entered');
    require(named('Files').is_maximized(), 'the entered window is maximized');
    require(windows().filter(window => window !== named('Files')).every(window => window.minimized), 'windows outside the view are minimized');
    require(windows().every(window => !window.unconstrained), 'windows are kept on screen again');
    await capture(`${output}/board-exit-maximized.png`);

    board.input.handle(touchpad.swipe('begin', 4));
    board.input.handle(touchpad.swipe('update', 4, 0, -30));
    board.input.handle(touchpad.swipe('end', 4));
    await pause(SETTLE + 300);
    require(board.shown, 'a four-finger swipe up returns to the board');
    require([...layout].every(([window, rect]) => window.get_frame_rect().equal(rect)), 'the board comes back exactly as it was');
    require(JSON.stringify(view()) === JSON.stringify(filling), 'the board view comes back too');

    board.fitAll();
    await pause(SETTLE);
    const shown = view();
    const onScreen = new Map(windows().map(window => {
      const rect = window.get_frame_rect();
      return [window, screenPoint(shown, viewport, rect.x + rect.width / 2, rect.y + rect.height / 2)];
    }));
    board.toggle();
    await pause(SETTLE);
    const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    require(windows().every(window => !window.minimized), 'leaving the board with everything in view keeps every window');
    require(windows().every(window => {
      const rect = window.get_frame_rect();
      const [x, y] = onScreen.get(window);
      const clamped = rect.width >= area.width || rect.height >= area.height;
      return clamped || Math.hypot(rect.x + rect.width / 2 - x, rect.y + rect.height / 2 - y) < 260;
    }), 'windows stay where they were on screen');
    await capture(`${output}/board-exit.png`);
  } finally {
    if (board.shown) board.toggle();
    for (const app of apps) app.force_exit();
    await pause(500);
  }
}
