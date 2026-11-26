import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {printsThroughDialog, writeDocument} from '../lib/access/printing.js';
import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {middle} from '../lib/apps/probe.js';
import {drag, press, type} from '../lib/input/input.js';
import {changes, withApp} from './lib/apps.js';
import {exists, removeTree, write} from './lib/files.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkLooks} from './rover/looks.js';
import {checkNetwork} from './rover/network.js';
import {checkPicker} from './rover/picker.js';
import {checkPlaces, withUserFolders} from './rover/places.js';
import {checkPrivileged} from './rover/privileged.js';
import {checkRename} from './rover/rename.js';
import {checkThumbnails, withThumbnailers} from './rover/thumbnails.js';

const {require, eventually} = checks('Luft app');
const DRAG = {steps: 24, interval: 30, hover: 300};
const SEARCH_FIELD = {role: 'textbox', name: 'Search current folder'};
const SEARCH = {x: 12, y: 14, width: 236, height: 36};
const FOLDER = GLib.build_filenamev([GLib.get_home_dir(), 'Drag check']);

const clipboard = () => new Promise<string | null>(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));

async function open(app: LuftApp, path: string) {
  await changes(app, 'Ctrl+L lets Rover take an address', () => press(Clutter.KEY_Control_L, Clutter.KEY_l));
  type(path);
  await changes(app, `Rover opens ${path}`, () => press(Clutter.KEY_Return));
}

async function checkDrag(app: LuftApp) {
  write(GLib.build_filenamev([FOLDER, 'Note.txt']), 'Pack the charger\n');
  GLib.mkdir_with_parents(GLib.build_filenamev([FOLDER, 'Inbox']), 0o755);
  await open(app, FOLDER);
  await drag(app.at(middle(await app.find({text: 'Note.txt'}))), app.at(middle(await app.find({text: 'Inbox'}))), DRAG);
  await eventually(() => exists(GLib.build_filenamev([FOLDER, 'Inbox', 'Note.txt'])), 'Rover moves a file dropped on a folder');
  require(!exists(GLib.build_filenamev([FOLDER, 'Note.txt'])), 'dragging a file onto a folder in Rover moves it there');
}

async function checkPrinting(app: LuftApp) {
  const folder = GLib.build_filenamev([FOLDER, 'Printing']);
  GLib.mkdir_with_parents(folder, 0o755);
  writeDocument(GLib.build_filenamev([folder, 'Itinerary.pdf']));
  await open(app, folder);
  await changes(app, 'Rover selects a PDF', async () => app.click(await app.find({text: 'Itinerary.pdf'})));
  await printsThroughDialog(eventually, 'Ctrl+P on a PDF in Rover', () => press(Clutter.KEY_Control_L, Clutter.KEY_p));
}

async function checkTextMenu(app: LuftApp) {
  app.click(await app.find(SEARCH_FIELD));
  await changes(app, 'Rover shows what is typed into its search', () => type('inbox'), SEARCH);
  await changes(app, 'Ctrl+A selects the search text', () => press(Clutter.KEY_Control_L, Clutter.KEY_a), SEARCH);
  await changes(app, "right-clicking the search opens the text field's own menu", async () => app.click(await app.find(SEARCH_FIELD), Clutter.BUTTON_SECONDARY));
  (await app.frame()).save('rover-text-menu-dark');
  app.click(await app.find({role: 'menuitem', name: 'Cut'}));
  await eventually(async () => await clipboard() === 'inbox', "a text field's own menu cuts the selected text");
}

export async function run() {
  try {
    await withPalette(async palette => {
      await withUserFolders(() => withThumbnailers(() => withApp('rover', [], async app => {
        await checkPalette(app, palette, {accent: true});
        await showDark(app, palette);
        await checkDrag(app);
        await checkRename(app, GLib.build_filenamev([FOLDER, 'Rename']), open);
        await checkPrivileged(app, GLib.build_filenamev([FOLDER, 'Locked']), open);
        await checkPrinting(app);
        await checkTextMenu(app);
        await checkPlaces(app);
        await checkLooks(app, GLib.build_filenamev([FOLDER, 'Looks']), open);
        await checkThumbnails(app, GLib.build_filenamev([FOLDER, 'Thumbnails']), open);
      })));
      await checkPicker(GLib.build_filenamev([FOLDER, 'Picker']));
      const rclone = GLib.find_program_in_path('rclone');
      if (rclone) await checkNetwork(rclone);
      else console.log('Kestrel Luft app check: rover network locations skipped without rclone');
    });
  } finally {
    if (exists(FOLDER)) removeTree(FOLDER);
  }
}
