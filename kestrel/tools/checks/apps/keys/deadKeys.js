import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import * as IBusManager from 'resource:///com/lantharos/kestrel/misc/ibusManager.js';

import {checks} from '../../lib/check.js';
import {type} from '../../lib/input.js';
import {fixture, scratch} from '../../lib/processes.js';
import {within} from '../../lib/wait.js';
import {changes, withApp} from '../lib/apps.js';
import {exists, read, write} from '../lib/files.js';
import {saveBothStyles} from '../lib/palette.js';
import {userLayouts} from './layout.js';
import {ENGINE} from './method.js';
import {code, focus, openEntry, simpleEngineRestarted, tryFieldHolds, typeInto, useSources} from './typing.js';

const {require, eventually} = checks('Keys');
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
const IBUS_RESTART = 30000;
const COMPOSE = GLib.build_filenamev([GLib.get_user_config_dir(), 'keys', 'Compose']);
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

const caronThen = (...codes) => () => {
  code(KEY_TLDE);
  for (const key of codes) code(key);
};

const composes = sequence => () => exists(COMPOSE) && read(COMPOSE).includes(sequence);

function x11Entry() {
  const binary = scratch('kestrel-x11-entry');
  Gio.Subprocess.new(['cc', '-O2', '-o', binary, fixture('clients', 'entries', 'x11Entry.c'), '-lX11'], Gio.SubprocessFlags.NONE).wait_check(null);
  return binary;
}

async function importLayout(existing) {
  const created = () => userLayouts().find(layout => !existing.includes(layout));
  await eventually(created, 'Keys imports the .klc file', IMPORTED);
  await eventually(composes('<UEC40> <a> : "ž"'), 'a .klc dead key table becomes compose sequences of its own dead key', IMPORTED);
  require(read(COMPOSE).includes('<UEC40> <u> <a> : "ă"'), 'a chained dead key from the .klc file continues into the next table');
  const user = GLib.build_filenamev([GLib.get_home_dir(), '.XCompose']);
  require(exists(user) && read(user).startsWith('include "%L"') && read(user).includes(COMPOSE), '~/.XCompose keeps the locale sequences and includes the dead keys');
  return created();
}

async function checkTyping(early) {
  await typeInto(early, caronThen(KEY_A), 'ž', 'a GTK 4 app that was already open types the new dead key');
  await typeInto(early, caronThen(KEY_U, KEY_A), 'žă', 'a chained dead key types from the second table');
  await typeInto(early, caronThen(KEY_SPACE), 'žăˇ', 'the dead key and Space type its symbol');
  await typeInto(early, caronThen(KEY_Q), 'žăˇˇq', 'a key without a result types the symbol and the key');
  await typeInto(early, () => {
    code(KEY_LEFTSHIFT, KEY_TLDE);
    code(KEY_E);
  }, 'žăˇˇqĕ', 'a second dead key on the same key with Shift has its own table');
}

async function checkEditing(app, palette, early) {
  await focus(app.window);
  await changes(app, 'Keys shows the dead key table', () => code(KEY_LEFTCTRL, KEY_2));
  await saveBothStyles(app, palette, 'keys-dead-keys');
  await changes(app, 'the dead key’s Try it field shows what is typed', () => type('ua'));
  await saveBothStyles(app, palette, 'keys-dead-key-try');
  await tryFieldHolds(app, () => {
    type(' ');
    code(KEY_LEFT);
    code(KEY_BACKSPACE);
    type('z');
  }, 'žˇ', 'the dead key’s Try it field chains, types its symbol with Space and edits at the caret');
  for (let step = 0; step < 3; step++) code(KEY_TAB);
  const reloaded = simpleEngineRestarted();
  code(KEY_LEFTCTRL, KEY_A);
  type('ez');
  await eventually(composes('<UEC40> <a> : "ez"'), 'changing a result in the dead key table updates its sequence', SAVED);
  await within(reloaded, SAVED, 'IBus picks up the changed dead keys');
  await typeInto(early, caronThen(KEY_A), 'žăˇˇqĕez', 'an app that stayed open types the changed result right away');

  await focus(app.window);
  const restored = simpleEngineRestarted();
  code(KEY_LEFTCTRL, KEY_Z);
  await eventually(composes('<UEC40> <a> : "ž"'), 'undo brings the previous result back', SAVED);
  await within(restored, SAVED, 'IBus picks up the restored dead keys');
}

async function checkOtherToolkits() {
  const gtk3 = await openEntry(['gjs', '-m', fixture('clients', 'entries', 'gtk3Entry.js')]);
  try {
    await typeInto(gtk3, caronThen(KEY_A), 'ž', 'a GTK 3 app types the dead key');
  } finally {
    await gtk3.close();
  }
  const xwayland = await openEntry(null, {GDK_BACKEND: 'x11'});
  try {
    require(xwayland.window.get_client_type() === Meta.WindowClientType.X11, 'the GTK 4 entry runs under Xwayland');
    await typeInto(xwayland, caronThen(KEY_A), 'ž', 'a GTK app under Xwayland types the dead key');
  } finally {
    await xwayland.close();
  }
  const xlib = await openEntry([x11Entry()], {XMODIFIERS: '@im=none'});
  try {
    require(xlib.window.get_client_type() === Meta.WindowClientType.X11, 'the plain X11 entry runs under Xwayland');
    await typeInto(xlib, caronThen(KEY_A), 'ž', 'a plain X11 app composing with libX11 types the dead key');
  } finally {
    await xlib.close();
  }
}

async function checkInputMethods(app, id) {
  await useSources([['ibus', ENGINE], ['xkb', id]], 'Keys’ input method is the input source over the dead key layout');
  const method = await openEntry();
  try {
    await typeInto(method, caronThen(KEY_A), 'ž', 'dead keys type through one of Keys’ input methods');
    await typeInto(method, caronThen(KEY_U, KEY_A), 'žă', 'chained dead keys type through one of Keys’ input methods');
  } finally {
    await method.close();
  }
  await focus(app.window);
  await changes(app, 'Keys shows the layout', () => code(KEY_LEFTCTRL, KEY_1));
  code(KEY_TAB);
  await tryFieldHolds(app, caronThen(KEY_A, KEY_A, KEY_S), 'žas', 'the Try it field types with the layout while one of Keys’ input methods is the input source');

  await useSources([['ibus', 'mozc-jp'], ['xkb', id]], 'Mozc is the input source over the dead key layout', {engineStarts: false});
  const mozc = await openEntry();
  try {
    await typeInto(mozc, caronThen(KEY_A), 'ž', 'dead keys type while Mozc is the input source');
  } finally {
    await mozc.close();
  }
  await focus(app.window);
  code(KEY_LEFTCTRL, KEY_A);
  code(KEY_BACKSPACE);
  await tryFieldHolds(app, () => {
    caronThen(KEY_U, KEY_A, KEY_Q)();
    code(KEY_E);
  }, 'ăqe', 'the Try it field types with the layout while Mozc is the input source');
}

async function checkImported(app, palette, early, existing, reloaded) {
  let id = null;
  try {
    id = await importLayout(existing);
    await useSources([['xkb', id]]);
    await within(reloaded, SAVED, 'IBus picks up the imported dead keys');
    await checkTyping(early);
    await checkEditing(app, palette, early);
  } finally {
    await early.close();
  }
  await checkOtherToolkits();
  await eventually(() => IBusManager.getIBusManager().getEngineDesc(ENGINE), 'Keys’ input method is registered', IBUS_RESTART);
  await checkInputMethods(app, id);
}

export async function checkDeadKeys(palette) {
  const existing = userLayouts();
  const early = await openEntry();
  const file = `${GLib.get_home_dir()}/Documents/Dead key test.klc`;
  write(file, KLC);
  const reloaded = simpleEngineRestarted();
  await withApp('keys', [file], app => checkImported(app, palette, early, existing, reloaded));
}
