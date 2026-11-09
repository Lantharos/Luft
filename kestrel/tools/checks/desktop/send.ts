import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, shown, shownStyled, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press} from '../lib/input/input.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {withScheme} from '../apps/lib/palette.js';
import {install, installBuilt, listed, request} from '../extensions/lib/extensions.js';
import {certificate, PHONE, Phone} from './pigeon/phone.js';
import {Caller} from './send/caller.js';
import {onePagePdf, savePicture} from './send/files.js';
import {checkFlatbed} from './send/flatbed.js';
import {checkHeft} from './send/heft.js';
import {checkSandboxed} from './send/sandboxed.js';

const {require, eventually} = checks('Send sheet');
const FILES = 'com.example.Files';
const PIGEON = 'com.lantharos.Pigeon';
const LOCALSEND_PORT = 53317;
const PHONE_PORT = 53399;
const PHONE_FOUND_MS = 20000;
const SHEETS_A_MINUTE = 5;
const SENT = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'sent']);

interface Chosen {
  key: string;
  paths: string[];
  choice: string | null;
}

const fixture = () => (globalThis as {fileActionsFixture?: {chosen: Chosen[]; opened: number}}).fileActionsFixture!;
const sheet = () => shownStyled('kestrel-send-sheet');
const choice = (name: string) => {
  const open = sheet();
  const found = open && named(name, open);
  return found?.mapped && found.reactive ? found : null;
};
const bannerSays = (text: string) => styled('notification-banner', Main.uiGroup).filter(shown).some(banner => showsText(text, banner));
const read = (path: string) => GLib.file_get_contents(path)[1];
const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, index) => byte === b[index]);

/** Whether LocalSend's port is free here: on a computer running Pigeon itself, a stand-in phone would reach the real one. */
function localSendPortFree(): boolean {
  const socket = Gio.Socket.new(Gio.SocketFamily.IPV4, Gio.SocketType.STREAM, Gio.SocketProtocol.TCP);
  try {
    socket.bind(Gio.InetSocketAddress.new_from_string('0.0.0.0', LOCALSEND_PORT)!, false);
    return true;
  } catch {
    return false;
  } finally {
    socket.close();
  }
}

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

/** Sends to the stand-in extension's device, which turns up once people look again, as Pigeon's do. */
async function checkSending(caller: Caller, scan: string) {
  const opened = fixture().opened;
  await caller.send();
  const open = await eventually(sheet, 'the app in front opens the Send sheet for its file');
  require(showsText('Send “Scan.pdf”', open) && showsText('Share with', open), 'naming the file, with the extensions that send files');
  require(!choice('Nobody here') && showsText('Nobody here', open), 'a placeholder shows and can\'t be chosen');
  require(fixture().opened === opened + 1, 'the extension hears the sheet opened, to look for devices');
  await caller.send();
  require((await caller.next('a second sheet is answered')).includes('already open'), 'one sheet opens at a time');
  click(choice('Look again')!);
  await eventually(() => choice('Pixel 8'), 'Look again keeps the sheet open and shows what turned up');
  await settled();
  await capture('send-sheet-dark');
  await withScheme('light', async () => {
    await settled();
    await capture('send-sheet-light');
  });
  click(choice('Pixel 8')!);
  await eventually(() => !sheet(), 'choosing the device closes the sheet');
  require(await caller.next('the app hears the sheet closed') === 'sent', 'and the app hears it closed');
  const chosen = fixture().chosen.at(-1)!;
  require(chosen.key === 'share' && chosen.choice === 'Pixel 8' && chosen.paths.length === 1, 'the extension gets the device chosen');
  const [copy] = chosen.paths;
  require(copy!.startsWith(SENT) && GLib.path_get_basename(copy!) === 'Scan.pdf' && same(read(copy!), read(scan)),
    'with a copy of the file under its own name, in Kestrel\'s folder of sent files');
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

/** Sends through Pigeon to its stand-in phone, with the same flow as from Rover. */
async function checkPigeon(scan: string, folder: string) {
  if (!localSendPortFree()) {
    console.log('Kestrel Send sheet: Pigeon skipped while LocalSend\'s port is taken, such as by Pigeon on this computer');
    return;
  }
  await installBuilt(PIGEON);
  const phone = new Phone(PHONE_PORT, certificate(folder));
  const caller = await Caller.start({'Scan.pdf': scan}, 'an app with a scan opens again');
  try {
    await eventually(async () => (await listed(PIGEON))?.state === 'running', 'Pigeon runs once installed');
    phone.stayNearby();
    await caller.send();
    await eventually(sheet, 'the sheet opens with Pigeon on');
    click(await eventually(() => choice(PHONE), 'it lists the phone Pigeon found nearby', PHONE_FOUND_MS));
    require(await caller.next('the sheet closes') === 'sent', 'choosing the phone closes the sheet');
    await eventually(() => [...phone.uploads.values()].some(upload => same(upload, read(scan))), 'the file reaches the phone whole, through Pigeon');
    await eventually(() => bannerSays(`Sent a file to ${PHONE}`), 'and Pigeon says it went');
  } finally {
    await caller.stop();
    phone.stop();
    await request('Remove', PIGEON);
  }
}

export async function run() {
  const folder = scratch('send');
  GLib.mkdir_with_parents(folder, 0o700);
  const scan = GLib.build_filenamev([folder, 'Scan.pdf']);
  const pdf = onePagePdf();
  GLib.file_set_contents(scan, pdf);
  const note = GLib.build_filenamev([folder, 'notes.txt']);
  GLib.file_set_contents(note, 'Milk, bread\n');
  install('files', FILES);
  await request('Reload', FILES);
  try {
    await eventually(() => fixture()?.opened === 0, 'an extension that sends files runs');
    await checkRefusals(note);
    const caller = await Caller.start({'Scan.pdf': scan}, 'an app with a scan opens');
    try {
      await checkSending(caller, scan);
      await checkRateLimit(caller);
    } finally {
      await caller.stop();
    }
    const page = GLib.build_filenamev([folder, 'Page.png']);
    savePicture(page);
    await checkFlatbed(sheet, choice, () => fixture().chosen.flatMap(chosen => chosen.paths).find(path => path.endsWith('/Receipt.pdf')) ?? null, page);
    await checkSandboxed(sheet, pdf);
    await checkHeft(choice, scan);
  } finally {
    await request('Remove', FILES);
  }
  await checkPigeon(scan, folder);
}
