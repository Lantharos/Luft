import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {Keys, LuftApp, sleep, waitFor} from './luftApp.js';

const STEPS = 24;
const SETTLE = 600;
const DROP_TIMEOUT = 5000;
const ROVER = {note: [338, 140], inbox: [330, 104], search: [142, 32]};
const MENU_FIRST_ITEM = [40, 23];
const TOOLS = GLib.path_get_dirname(GLib.path_get_dirname(GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0])));
const MESSAGE = 'From: Ayesha <ayesha@example.test>\r\nTo: luft@example.test\r\nSubject: Harbour photos\r\n\r\nThe photos from Saturday are in the shared folder.\r\n';

const home = (...parts) => GLib.build_filenamev([GLib.get_user_state_dir(), 'luft-home', ...parts]);
const exists = path => GLib.file_test(path, GLib.FileTest.EXISTS);
const clipboard = () => new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));

function at(app, [x, y]) {
  const frame = app.window.get_frame_rect();
  return [frame.x + x, frame.y + y];
}

async function click(pointer, [x, y], button = Clutter.BUTTON_PRIMARY) {
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), x, y);
  pointer.notify_button(GLib.get_monotonic_time(), button, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), button, Clutter.ButtonState.RELEASED);
  await sleep(SETTLE);
}

async function drag(pointer, [fromX, fromY], [toX, toY]) {
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), fromX, fromY);
  await sleep(100);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  await sleep(100);
  for (let step = 1; step <= STEPS; step++) {
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), fromX + (toX - fromX) * step / STEPS, fromY + (toY - fromY) * step / STEPS);
    await sleep(30);
  }
  await sleep(300);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
  await sleep(SETTLE);
}

async function openDragSource(paths) {
  const source = Gio.Subprocess.new(['gjs', '-m', `${TOOLS}/fixtures/fileDragSource.js`, ...paths], Gio.SubprocessFlags.NONE);
  const window = () => global.get_window_actors().map(actor => actor.meta_window).find(candidate => candidate.title === 'Kestrel drag source');
  await waitFor(() => window()?.get_frame_rect().width > 0, DROP_TIMEOUT, () => 'the drag source did not open');
  window().activate(global.get_current_time());
  await sleep(SETTLE);
  const frame = window().get_frame_rect();
  return {center: [frame.x + frame.width / 2, frame.y + frame.height / 2], close: () => source.force_exit()};
}

async function checkRover({require, output, pointer}) {
  const folder = home('Drag check');
  GLib.mkdir_with_parents(GLib.build_filenamev([folder, 'Inbox']), 0o755);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'Note.txt']), 'Pack the charger\n');
  const app = new LuftApp('rover', [folder]);
  try {
    await app.open();
    await sleep(SETTLE);
    await drag(pointer, at(app, ROVER.note), at(app, ROVER.inbox));
    const moved = GLib.build_filenamev([folder, 'Inbox', 'Note.txt']);
    await waitFor(() => exists(moved), DROP_TIMEOUT, () => 'Rover did not move the dropped file');
    require(!exists(GLib.build_filenamev([folder, 'Note.txt'])), 'dragging a file onto a folder in Rover moves it there');

    const keys = new Keys();
    await click(pointer, at(app, ROVER.search));
    await keys.type('inbox');
    keys.press(Clutter.KEY_a, [Clutter.KEY_Control_L]);
    await sleep(SETTLE);
    await click(pointer, at(app, ROVER.search), Clutter.BUTTON_SECONDARY);
    (await app.frame()).save(`${output}/rover-text-menu-dark.png`);
    const [x, y] = at(app, ROVER.search);
    await click(pointer, [x + MENU_FIRST_ITEM[0], y + MENU_FIRST_ITEM[1]]);
    require(await clipboard() === 'inbox', "a text field's own menu cuts the selected text");
  } finally {
    await app.close();
    GLib.spawn_command_line_sync(`rm -rf ${GLib.shell_quote(folder)}`);
  }
}

async function checkMailman({require, output, pointer}) {
  const message = home('Harbour photos.eml');
  GLib.file_set_contents(message, MESSAGE);
  const stashed = GLib.build_filenamev([GLib.get_user_cache_dir(), 'mailman', 'compose']);
  const app = new LuftApp('mailman');
  let source = null;
  try {
    await app.open();
    source = await openDragSource([message]);
    const frame = app.window.get_frame_rect();
    await drag(pointer, source.center, [frame.x + frame.width / 3, frame.y + frame.height / 2]);
    const received = () => {
      if (!exists(stashed)) return false;
      const folders = Gio.File.new_for_path(stashed).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
      return [...folders].some(info => exists(GLib.build_filenamev([stashed, info.get_name(), 'Harbour photos.eml'])));
    };
    await waitFor(received, DROP_TIMEOUT, () => 'Mailman did not take the dropped message');
    require(received(), 'a message file dropped from another app reaches Mailman');
    app.window.activate(global.get_current_time());
    (await app.settle(() => true)).save(`${output}/mailman-dropped-message-dark.png`);
  } finally {
    source?.close();
    await app.close();
    GLib.unlink(message);
  }
}

export async function checkDragAndDrop(context) {
  await checkRover(context);
  await checkMailman(context);
}
