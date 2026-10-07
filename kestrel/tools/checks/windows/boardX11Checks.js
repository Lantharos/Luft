import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {clickAt, clickOf, screenPoint, zoomWithWheel} from './boardPointer.js';

const SETTLE = 700;
const FIXTURE = GLib.build_filenamev([GLib.path_get_dirname(GLib.getenv('KESTREL_WINDOW_SCRIPT')), 'entries', 'x11Clicks.c']);
const FAR_AWAY = [[9000, 6000], [-7000, -4000]];

function compile() {
  const binary = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel-x11-clicks']);
  Gio.Subprocess.new(['cc', '-O2', '-o', binary, FIXTURE, '-lX11'], Gio.SubprocessFlags.NONE).wait_check(null);
  return binary;
}

export async function checkBoardX11({board, pointer, keyboard, pause, require}) {
  const app = Gio.Subprocess.new([compile(), '480', '300'], Gio.SubprocessFlags.NONE);
  const opened = () => global.get_window_actors().map(actor => actor.meta_window).find(window => window.get_title()?.startsWith('Kestrel clicks'));
  try {
    for (let tries = 0; !opened() && tries < 80; tries++) await pause(100);
    const window = opened();
    require(window?.unconstrained, 'an X11 window opens on the board');
    await pause(SETTLE);
    const client = () => window.frame_rect_to_client_rect(window.get_frame_rect());
    const clickReaches = async (x, y) => {
      await clickAt({board, pointer, pause}, client(), x, y);
      const landed = clickOf(window);
      return landed && Math.abs(landed[0] - x) <= 1 && Math.abs(landed[1] - y) <= 1 ? landed : null;
    };

    for (const [x, y] of FAR_AWAY) {
      window.move_frame(true, x, y);
      board.enterWindow(window);
      await pause(SETTLE);
      require(board.camera.view.scale === 1 && await clickReaches(100, 50) && await clickReaches(470, 290),
        `clicks land in an X11 window placed at ${x}, ${y} on the board (${window.get_title()})`);
    }
    for (const key of 'ok') {
      keyboard.notify_keyval(GLib.get_monotonic_time(), key.charCodeAt(0), Clutter.KeyState.PRESSED);
      keyboard.notify_keyval(GLib.get_monotonic_time(), key.charCodeAt(0), Clutter.KeyState.RELEASED);
    }
    await pause(300);
    require(window.get_title().startsWith('Kestrel clicks: ok@'), 'typing reaches the X11 window on the board');

    const rect = client();
    const center = screenPoint(board.camera.view, board.viewport, rect.x + rect.width / 2, rect.y + rect.height / 2).map(Math.round);
    await zoomWithWheel({pointer, keyboard, pause}, Clutter.ScrollDirection.UP, center, 8);
    require(board.camera.view.scale > 1, `the X11 window can be magnified to ${Math.round(board.camera.view.scale * 100)}%`);
    require(await clickReaches(30, 20) && await clickReaches(240, 150) && await clickReaches(465, 285),
      `clicks land in the magnified X11 window (${window.get_title()})`);
  } finally {
    app.force_exit();
    board.fitAll();
    await pause(SETTLE);
  }
}
