import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import type Meta from 'gi://Meta';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {centerOf, click, drag, press, type, type Point} from '../../lib/input/input.js';
import {builtFixture, fixture, outcome, scratch} from '../../lib/processes.js';
import {pause, waitUntil} from '../../lib/wait.js';
import {changes, openApp} from '../lib/apps.js';
import {install, launchLine, SABINE_BUILDER} from '../lib/appImages.js';
import {type Answer, copyInto, Receiver} from './receivers.js';

const {require} = checks('AppImage sandbox');
const FOLDER = GLib.build_filenamev([GLib.get_home_dir(), 'Handover check']);
const HANDED = 'Note.txt';
const HANDED_TEXT = 'Handed over from Rover\n';
const UNHANDED = 'Other.txt';
const ZYPAK = '/usr/lib/zypak/zypak-helper';
const URI_LIST = 'text/uri-list';
const LOAD_EXTENSION = '--load-extension=';
const LEFT = 10;
const TOP = 20;
const RECEIVER_LEFT = 640;
const MOVED_MS = 400;
const FIRST_ROW: Point = [338, 104];
const DRAG = {steps: 24, interval: 30, hover: 500};

const installedExtension = (argument: string) =>
  !argument.startsWith(LOAD_EXTENSION) || GLib.file_test(argument.slice(LOAD_EXTENSION.length), GLib.FileTest.IS_DIR);
const inFolder = (name: string) => GLib.build_filenamev([FOLDER, name]);
const ownFolder = (id: string) => GLib.build_filenamev([GLib.get_home_dir(), '.var', 'app', id]);

function writeFiles() {
  GLib.mkdir_with_parents(FOLDER, 0o755);
  GLib.file_set_contents(inFolder(HANDED), HANDED_TEXT);
  GLib.file_set_contents(inFolder(UNHANDED), 'Never handed over\n');
}

async function openFolder(rover: LuftApp) {
  rover.window.move_frame(true, LEFT, TOP);
  rover.window.activate(global.get_current_time());
  await changes(rover, 'Ctrl+L lets Rover take an address', () => press(Clutter.KEY_Control_L, Clutter.KEY_l));
  type(FOLDER);
  await changes(rover, 'Rover opens the folder to hand over from', () => press(Clutter.KEY_Return));
}

const readable = (answer: Answer) => answer.files?.length === 1 && answer.files[0]!.text === HANDED_TEXT;

function reportHanded(what: string, answer: Answer) {
  console.log(`Kestrel AppImage sandbox: ${what} was offered ${answer.offered.join(', ')} and got ${JSON.stringify(answer.files ?? answer.error)}`);
}

async function handOver(rover: LuftApp, receiver: Receiver, what: string) {
  receiver.window.move_frame(true, RECEIVER_LEFT, TOP);
  receiver.window.make_above();
  await pause(MOVED_MS);
  rover.window.activate(global.get_current_time());
  await drag(rover.at(FIRST_ROW), centerOf(receiver.window.get_compositor_private<Meta.WindowActor>()), DRAG);
  const dropped = await receiver.next(`a file dragged from Rover reaches ${what}`);
  reportHanded(`${what}, dropped on,`, dropped);
  require(dropped.how === 'drop' && readable(dropped), `a file dragged from Rover onto ${what} is readable in its sandbox`);
  const clipboard = St.Clipboard.get_default();
  clipboard.set_text(St.ClipboardType.CLIPBOARD, '');
  rover.window.activate(global.get_current_time());
  click(rover.at(FIRST_ROW));
  press(Clutter.KEY_Control_L, Clutter.KEY_c);
  await waitUntil(() => clipboard.get_mimetypes(St.ClipboardType.CLIPBOARD).includes(URI_LIST), 'Rover copies the file');
  const pasted = await receiver.paste(`a file copied in Rover is pasted into ${what}`);
  reportHanded(`${what}, pasted into,`, pasted);
  require(pasted.how === 'paste' && readable(pasted), `a file copied in Rover and pasted into ${what} is readable in its sandbox`);
}

async function checkGtk(rover: LuftApp) {
  const image = scratch('Satchel.AppImage');
  require((await outcome(['python3', SABINE_BUILDER, image, 'org.example.Satchel', 'Satchel', ''])).ok, 'an AppImage that declares no folders is built');
  const id = await install(image);
  const script = copyInto(ownFolder(id), builtFixture('clients', 'windows', 'fileReceiver.js'), 'file-receiver.js');
  const {program, rest} = launchLine(id);
  const receiver = await Receiver.gtk([program, ...rest, 'gjs', '-m', script, inFolder(UNHANDED), inFolder(HANDED)], id);
  try {
    await handOver(rover, receiver, 'a GTK 4 app');
    St.Clipboard.get_default().set_files(St.ClipboardType.CLIPBOARD, [inFolder(HANDED)]);
    const copied = await receiver.paste('a file Kestrel copies is pasted into the GTK 4 app');
    reportHanded('a GTK 4 app, pasted into from Kestrel,', copied);
    require(readable(copied), 'a file Kestrel copies, as for an extension, is readable in the app it is pasted into');
    const probed = await receiver.probe('the GTK 4 app looks for files it was never handed');
    require(probed.unhanded!.every(file => file.error), `the app still can't read a file next to the one it was handed, nor the handed one where it really is (${JSON.stringify(probed.unhanded)})`);
    require(probed.shared!.length > 0 && probed.shared!.every(names => names === HANDED),
      `the document portal shows the app only the file it was handed (${probed.shared!.join(', ')})`);
  } finally {
    await receiver.stop();
  }
}

async function checkChromium(rover: LuftApp, appImage: string) {
  const id = await install(appImage);
  const page = copyInto(ownFolder(id), fixture('pages', 'fileReceiver.html'), 'file-receiver.html');
  const {program, rest} = launchLine(id);
  const sandbox = GLib.file_test(ZYPAK, GLib.FileTest.IS_EXECUTABLE) ? [] : ['--no-sandbox'];
  const receiver = await Receiver.page([program, ...rest.filter(installedExtension), ...sandbox, '--no-first-run', '--no-default-browser-check',
    '--password-store=basic', `file://${page}`], id);
  try {
    await handOver(rover, receiver, 'a page in Chromium');
  } finally {
    await receiver.stop();
  }
}

export async function checkHandover() {
  writeFiles();
  const rover = await openApp('rover');
  try {
    await openFolder(rover);
    await checkGtk(rover);
    const helium = GLib.getenv('KESTREL_HELIUM');
    if (helium) await checkChromium(rover, helium);
    else console.log('Kestrel AppImage sandbox: files handed to Chromium skipped without KESTREL_HELIUM');
  } finally {
    await rover.close();
  }
}
