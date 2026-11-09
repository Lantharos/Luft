import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {named, shownStyled, showsText} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press} from '../lib/input/input.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {withScheme} from '../apps/lib/palette.js';
import {Nearby} from './post/nearby.js';
import {NEARBY} from './post/transfers.js';
import {Caller} from './send/caller.js';
import {onePagePdf, savePicture} from './send/files.js';
import {checkFlatbed} from './send/flatbed.js';
import {checkHeft} from './send/heft.js';
import {checkSandboxed} from './send/sandboxed.js';

const {require, eventually} = checks('Send sheet');
const SHEETS_A_MINUTE = 5;
const SENT = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'sent']);

const sheet = () => shownStyled('kestrel-send-sheet');
const choice = (name: string) => {
  const open = sheet();
  const found = open && named(name, open);
  return found?.mapped && found.reactive ? found : null;
};
const read = (path: string) => GLib.file_get_contents(path)[1];
const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, index) => byte === b[index]);

async function refused(files: Record<string, string>, label: string) {
  const caller = await Caller.start(files, `an app with ${Object.keys(files).join(', ')} opens`);
  try {
    await caller.send();
    return await caller.next(label);
  } finally {
    await caller.stop();
  }
}

async function checkRefusals(note: string) {
  const fromKestrel = await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Share', 'com.lantharos.Kestrel.Share', 'Send',
    new GLib.Variant('(a(sh))', [[]])).then(() => '', (error: Error) => error.message);
  require(fromKestrel.includes('Only the app in front'), 'nothing without a window in front opens the Send sheet');
  require((await refused({'null': '/dev/null'}, 'handing over a device is answered')).includes("isn't a regular file"),
    'devices, pipes and sockets are refused');
  require((await refused({'../notes.txt': note}, 'a name with a folder in it is answered')).includes("isn't a file name"),
    'names that reach into folders are refused');
  require(!sheet(), 'and no sheet opened for them');
}

/** The computer nearby takes what's offered, and resolves to where it saved it. */
function receiving(nearby: Nearby) {
  let taken = 0;
  return async (name: string): Promise<string> => {
    const offer = await eventually(() => nearby.offers[taken], `the computer nearby is offered ${name}`);
    taken++;
    await nearby.accept(offer.id);
    const saved = GLib.build_filenamev([nearby.folder, name]);
    await eventually(() => nearby.finished.some(finished => finished.saved.includes(saved)), `${name} reaches the computer nearby`);
    return saved;
  };
}

/** Sends to the computer nearby through Post, which shows up in the sheet as Post finds it. */
async function checkSending(caller: Caller, scan: string, arrives: (name: string) => Promise<string>) {
  await caller.send();
  const open = await eventually(sheet, 'the app in front opens the Send sheet for its file');
  require(showsText('Send “Scan.pdf”', open) && showsText('Devices nearby', open), 'naming the file, with the devices nearby');
  await caller.send();
  require((await caller.next('a second sheet is answered')).includes('already open'), 'one sheet opens at a time');
  await eventually(() => choice(NEARBY), 'Post finds the computer nearby while the sheet is open', 30000);
  await settled();
  await capture('send-sheet-dark');
  await withScheme('light', async () => {
    await settled();
    await capture('send-sheet-light');
  });
  click(choice(NEARBY)!);
  await eventually(() => !sheet(), 'choosing the device closes the sheet');
  require(await caller.next('the app hears the sheet closed') === 'sent', 'and the app hears it closed');
  require(same(read(await arrives('Scan.pdf')), read(scan)), 'the file reaches the computer nearby whole');
  const copies = Gio.File.new_for_path(SENT).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const kept: string[] = [];
  for (let info = copies.next_file(null); info; info = copies.next_file(null)) kept.push(GLib.build_filenamev([SENT, info.get_name(), 'Scan.pdf']));
  const copy = kept.find(path => GLib.file_test(path, GLib.FileTest.EXISTS));
  require(!!copy && same(read(copy), read(scan)), 'from a copy under its own name, in Kestrel\'s folder of sent files');
  const mode = Gio.File.new_for_path(copy!).query_info('unix::mode', Gio.FileQueryInfoFlags.NONE, null).get_attribute_uint32('unix::mode');
  require((mode & 0o077) === 0, 'which only you can read');
}

async function checkRateLimit(caller: Caller) {
  for (let opened = 1; opened < SHEETS_A_MINUTE; opened++) {
    await caller.send();
    await eventually(sheet, `the sheet opens again (${opened + 1} this minute)`);
    await settled();
    press(Clutter.KEY_Escape);
    require(await caller.next('the cancelled sheet is answered') === 'sent', 'Escape closes it');
  }
  await caller.send();
  require((await caller.next('one sheet too many is answered')).includes('Too many'), `an app opens at most ${SHEETS_A_MINUTE} sheets a minute`);
}

export async function run() {
  const folder = scratch('send');
  GLib.mkdir_with_parents(folder, 0o700);
  const scan = GLib.build_filenamev([folder, 'Scan.pdf']);
  const pdf = onePagePdf();
  GLib.file_set_contents(scan, pdf);
  const note = GLib.build_filenamev([folder, 'notes.txt']);
  GLib.file_set_contents(note, 'Milk, bread\n');
  const nearby = await Nearby.start(NEARBY, scratch('send', 'Nearby'));
  const arrives = receiving(nearby);
  try {
    await checkRefusals(note);
    const caller = await Caller.start({'Scan.pdf': scan}, 'an app with a scan opens');
    try {
      await checkSending(caller, scan, arrives);
      await checkRateLimit(caller);
    } finally {
      await caller.stop();
    }
    const page = GLib.build_filenamev([folder, 'Page.png']);
    savePicture(page);
    await checkFlatbed(sheet, choice, arrives, NEARBY, page);
    await checkSandboxed(sheet, pdf);
    await checkHeft(choice, scan);
  } finally {
    await nearby.stop();
  }
}
