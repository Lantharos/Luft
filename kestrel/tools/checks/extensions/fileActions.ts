import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press} from '../lib/input/input.js';
import {scratch} from '../lib/processes.js';
import {settled} from '../lib/wait.js';
import {changes, withApp} from '../apps/lib/apps.js';
import {saveEveryLook} from '../apps/lib/corners.js';
import {write} from '../apps/lib/files.js';
import {install, request} from './lib/extensions.js';

const {require, eventually} = checks('file actions');
const FILES = 'com.example.Files';
const FOLDER = {text: 'Trips'};
const NOTE = {text: 'Notes.txt'};

interface Chosen {
  key: string;
  paths: string[];
  choice: string | null;
}

interface Fixture {
  chosen: Chosen[];
  opened: number;
  hide(): void;
}

const fixture = () => (globalThis as {fileActionsFixture?: Fixture}).fileActionsFixture!;
const choose = async (app: LuftApp, name: string) => app.click(await app.find({role: 'menuitem', name}));
const last = () => fixture().chosen.at(-1);
const fileId = (path: string) => Gio.File.new_for_path(path).query_info('id::file', Gio.FileQueryInfoFlags.NONE, null).get_attribute_string('id::file');
const chosenOn = (path: string) => last()!.paths.length === 1 && fileId(last()!.paths[0]!) === fileId(path);

async function checkOnlyRover() {
  const refused = await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/FileActions', 'com.lantharos.Kestrel.FileActions', 'List', null, '(aa{sv})')
    .then(() => null, (error: Error) => error.message);
  require(refused?.includes('Only Rover') ?? false, 'programs other than Rover get no file actions');
}

async function checkPlainActions(app: LuftApp, folder: string, note: string) {
  await changes(app, 'right-clicking a text file opens its menu', async () => app.click(await app.find(NOTE), Clutter.BUTTON_SECONDARY));
  await saveEveryLook(app, 'file-actions-text-menu');
  await changes(app, 'choosing an added action closes the menu', () => choose(app, 'Count words'));
  await eventually(() => last()?.key === 'words' && chosenOn(note), 'Count words gets the text file it was chosen on');

  await changes(app, 'right-clicking a folder opens its menu', async () => app.click(await app.find(FOLDER), Clutter.BUTTON_SECONDARY));
  await changes(app, 'choosing the folder action closes the menu', () => choose(app, 'Tidy up'));
  await eventually(() => last()?.key === 'tidy' && chosenOn(folder), 'an action for folders shows on folders, without the one for text');
}

async function checkChoices(app: LuftApp, note: string) {
  await changes(app, 'right-clicking the text file again opens its menu', async () => app.click(await app.find(NOTE), Clutter.BUTTON_SECONDARY));
  const opened = fixture().opened;
  await changes(app, 'an action with choices opens them in the menu', () => choose(app, 'Share with'));
  await eventually(() => fixture().opened === opened + 1, 'and tells the extension it opened');
  await changes(app, 'Look again keeps the menu open and shows what turned up', () => choose(app, 'Look again'));
  require(last()?.choice === 'again', 'Look again reaches the extension');
  await saveEveryLook(app, 'file-actions-choices-found');
  await changes(app, 'choosing a found entry closes the menu', () => choose(app, 'Pixel 8'));
  await eventually(() => last()?.choice === 'Pixel 8' && chosenOn(note), 'the extension gets the choice and the file');
}

const offers = async (app: LuftApp, name: string) => (await app.all({role: 'menuitem', name})).length > 0;

async function checkHidden(app: LuftApp) {
  fixture().hide();
  await settled();
  await changes(app, 'right-clicking the text file once more opens its menu', async () => app.click(await app.find(NOTE), Clutter.BUTTON_SECONDARY));
  await app.find({role: 'menuitem', name: 'Count words'});
  require(!await offers(app, 'Share with'), 'a hidden action leaves the menu');
  press(Clutter.KEY_Escape);
  await request('Disable', FILES);
  await settled();
  await changes(app, 'right-clicking with the extension off opens its menu', async () => app.click(await app.find(NOTE), Clutter.BUTTON_SECONDARY));
  await app.find({role: 'menuitem', name: 'Rename'});
  require(!await offers(app, 'Count words'), 'turning the extension off takes its actions out of the menu');
  press(Clutter.KEY_Escape);
}

export async function run() {
  const root = scratch('file-actions');
  const folder = GLib.build_filenamev([root, 'Trips']);
  const note = GLib.build_filenamev([root, 'Notes.txt']);
  GLib.mkdir_with_parents(folder, 0o755);
  write(note, 'Pack the charger\n');
  install('files', FILES);
  await request('Reload', FILES);
  try {
    await eventually(() => fixture()?.opened === 0, 'an extension with file-actions runs');
    await checkOnlyRover();
    await withApp('rover', [root], async app => {
      await checkPlainActions(app, folder, note);
      await checkChoices(app, note);
      await checkHidden(app);
    });
  } finally {
    await request('Remove', FILES);
  }
}
