import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import * as IBusManager from 'resource:///org/gnome/shell/misc/ibusManager.js';

import {prepareHome} from './home.js';
import {tryFieldChecker} from './keysTry.js';
import {LuftApp, sleep, waitFor} from './luftApp.js';

const KEY_1 = 2;
const KEY_2 = 3;
const KEY_BACKSPACE = 14;
const KEY_TAB = 15;
const KEY_Q = 16;
const KEY_E = 18;
const KEY_U = 22;
const KEY_LEFTCTRL = 29;
const KEY_A = 30;
const KEY_S = 31;
const KEY_TLDE = 41;
const KEY_LEFTSHIFT = 42;
const KEY_Z = 44;
const KEY_SPACE = 57;
const KEY_LEFT = 105;
const IMPORTED = 15000;
const SAVED = 5000;
const FIXTURES = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', 'fixtures']);
const KLC = [
  'KBD\tdeadtest\t"Dead key test"',
  'SHIFTSTATE',
  '0', '1', '6', '7',
  'LAYOUT',
  '29\tOEM_3\t0\t02c7@\t02d8@\t-1\t-1',
  '10\tQ\t1\tq\tQ\t-1\t-1',
  '12\tE\t1\te\tE\t-1\t-1',
  '16\tU\t1\tu\tU\t-1\t-1',
  '1e\tA\t1\ta\tA\t-1\t-1',
  '1f\tS\t1\ts\tS\t-1\t-1',
  '2c\tZ\t1\tz\tZ\t-1\t-1',
  '39\tSPACE\t0\t0020\t0020\t-1\t-1',
  'DEADKEY\t02c7',
  '0061\t017e\t// a -> ž',
  '0041\t017d',
  '007a\t017e',
  '0073\t0161',
  '0075\t02d8@',
  '0020\t02c7',
  'DEADKEY\t02d8',
  '0061\t0103',
  '0065\t0115',
  '0020\t02d8',
  'KEYNAME_DEAD',
  '02c7\t"CARON"',
  '02d8\t"BREVE"',
  'ENDKBD',
].join('\r\n');

const read = path => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
const exists = path => GLib.file_test(path, GLib.FileTest.EXISTS);
const windows = () => global.get_window_actors().map(actor => actor.meta_window);

function x11Entry() {
  const binary = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel-x11-entry']);
  Gio.Subprocess.new(['cc', '-O2', '-o', binary, GLib.build_filenamev([FIXTURES, 'entries', 'x11Entry.c']), '-lX11'], Gio.SubprocessFlags.NONE).wait_check(null);
  return binary;
}

export async function checkDeadKeys({require, reached, pause, keyboard, shoot, useSources, userLayouts, engine}) {
  const press = (...codes) => {
    for (const code of codes) keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.PRESSED);
    for (const code of [...codes].reverse()) keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.RELEASED);
  });
  const open = async (argv, environment = []) => {
    const before = new Set(windows());
    const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
    for (const [name, value] of environment) launcher.setenv(name, value, true);
    const process = launcher.spawnv(argv);
    const opened = () => windows().find(window => !before.has(window) && /^Kestrel (window check|entry)/.test(window.title ?? ''));
    await waitFor(opened, 8000, () => `${argv.join(' ')} did not open`);
    await sleep(600);
    return {process, window: opened()};
  };
  const gtk4 = (...environment) => open(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--entry'], environment);
  const typeInto = async ({window}, keys, expected, label) => {
    window.activate(global.get_current_time());
    await pause(300);
    keys();
    await reached(() => window.title === `Kestrel entry: ${expected}`, label).catch(error => {
      throw new Error(`${error.message} (typed “${window.title}”)`);
    });
  };
  const tryFieldHolds = tryFieldChecker({keyboard, pause, waitFor});
  const caronThen = (...codes) => () => {
    press(KEY_TLDE);
    for (const code of codes) press(code);
  };

  const existing = userLayouts();
  const early = await gtk4();
  const file = GLib.build_filenamev([prepareHome(), 'Documents', 'Dead key test.klc']);
  GLib.file_set_contents(file, KLC);
  const keys = new LuftApp('keys', [file]);
  try {
    await keys.open();
    await waitFor(() => userLayouts().find(layout => !existing.includes(layout)), IMPORTED, () => 'Keys did not import the .klc file');
    const id = userLayouts().find(layout => !existing.includes(layout));
    const compose = GLib.build_filenamev([GLib.get_user_config_dir(), 'keys', 'Compose']);
    await reached(() => exists(compose) && read(compose).includes('<UEC40> <a> : "ž"'), 'a .klc dead key table becomes compose sequences of its own dead key', IMPORTED);
    require(read(compose).includes('<UEC40> <u> <a> : "ă"'), 'a chained dead key from the .klc file continues into the next table');
    const user = GLib.build_filenamev([GLib.get_home_dir(), '.XCompose']);
    require(exists(user) && read(user).startsWith('include "%L"') && read(user).includes(compose), '~/.XCompose keeps the locale sequences and includes the dead keys');

    useSources([['xkb', id]]);
    await pause(1500);
    await typeInto(early, caronThen(KEY_A), 'ž', 'a GTK 4 app that was already open types the new dead key');
    await typeInto(early, caronThen(KEY_U, KEY_A), 'žă', 'a chained dead key types from the second table');
    await typeInto(early, caronThen(KEY_SPACE), 'žăˇ', 'the dead key and Space type its symbol');
    await typeInto(early, caronThen(KEY_Q), 'žăˇˇq', 'a key without a result types the symbol and the key');
    await typeInto(early, () => {
      press(KEY_LEFTSHIFT, KEY_TLDE);
      press(KEY_E);
    }, 'žăˇˇqĕ', 'a second dead key on the same key with Shift has its own table');

    keys.window.activate(global.get_current_time());
    await pause(400);
    press(KEY_LEFTCTRL, KEY_2);
    await pause(900);
    await shoot(keys, 'keys-dead-keys');
    type('ua');
    await pause(300);
    await shoot(keys, 'keys-dead-key-try');
    type(' ');
    press(KEY_LEFT);
    press(KEY_BACKSPACE);
    type('z');
    await tryFieldHolds('žˇ', 'the dead key’s Try it field chains, types its symbol with Space and edits at the caret');
    for (let step = 0; step < 3; step++) press(KEY_TAB);
    press(KEY_LEFTCTRL, KEY_A);
    type('ez');
    await reached(() => read(compose).includes('<UEC40> <a> : "ez"'), 'changing a result in the dead key table updates its sequence', SAVED);
    await pause(1500);
    await typeInto(early, caronThen(KEY_A), 'žăˇˇqĕez', 'an app that stayed open types the changed result right away');

    keys.window.activate(global.get_current_time());
    await pause(300);
    press(KEY_LEFTCTRL, KEY_Z);
    await reached(() => read(compose).includes('<UEC40> <a> : "ž"'), 'undo brings the previous result back', SAVED);
    early.process.force_exit();

    const gtk3 = await open(['gjs', '-m', GLib.build_filenamev([FIXTURES, 'entries', 'gtk3Entry.js'])]);
    try {
      await typeInto(gtk3, caronThen(KEY_A), 'ž', 'a GTK 3 app types the dead key');
    } finally {
      gtk3.process.force_exit();
    }

    const xwayland = await gtk4(['GDK_BACKEND', 'x11']);
    try {
      require(xwayland.window.get_client_type() === Meta.WindowClientType.X11, 'the GTK 4 entry runs under Xwayland');
      await typeInto(xwayland, caronThen(KEY_A), 'ž', 'a GTK app under Xwayland types the dead key');
    } finally {
      xwayland.process.force_exit();
    }

    const xlib = await open([x11Entry()], [['XMODIFIERS', '@im=none']]);
    try {
      require(xlib.window.get_client_type() === Meta.WindowClientType.X11, 'the plain X11 entry runs under Xwayland');
      await typeInto(xlib, caronThen(KEY_A), 'ž', 'a plain X11 app composing with libX11 types the dead key');
    } finally {
      xlib.process.force_exit();
    }

    await reached(() => IBusManager.getIBusManager().getEngineDesc(engine), 'Keys’ input method is registered', 30000);
    useSources([['ibus', engine], ['xkb', id]]);
    await pause(1500);
    const method = await gtk4();
    try {
      await typeInto(method, caronThen(KEY_A), 'ž', 'dead keys type through one of Keys’ input methods');
      await typeInto(method, caronThen(KEY_U, KEY_A), 'žă', 'chained dead keys type through one of Keys’ input methods');
    } finally {
      method.process.force_exit();
    }

    keys.window.activate(global.get_current_time());
    await pause(300);
    press(KEY_LEFTCTRL, KEY_1);
    await pause(900);
    press(KEY_TAB);
    await pause(300);
    caronThen(KEY_A, KEY_A, KEY_S)();
    await tryFieldHolds('žas', 'the Try it field types with the layout while one of Keys’ input methods is the input source');

    useSources([['ibus', 'mozc-jp'], ['xkb', id]]);
    await pause(2500);
    const mozc = await gtk4();
    try {
      await typeInto(mozc, caronThen(KEY_A), 'ž', 'dead keys type while Mozc is the input source');
    } finally {
      mozc.process.force_exit();
    }

    keys.window.activate(global.get_current_time());
    await pause(300);
    press(KEY_LEFTCTRL, KEY_A);
    press(KEY_BACKSPACE);
    caronThen(KEY_U, KEY_A, KEY_Q)();
    press(KEY_E);
    await tryFieldHolds('ăqe', 'the Try it field types with the layout while Mozc is the input source');
    return id;
  } finally {
    await keys.close();
  }
}
