import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {checks} from '../lib/check.js';
import {drag, press, type} from '../lib/input.js';
import {changes, withApp} from './lib/apps.js';
import {exists, removeTree, write} from './lib/files.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkNetwork} from './rover/network.js';

const {require, eventually} = checks('Luft app');
const DRAG = {steps: 24, interval: 30, hover: 300};
const AT = {note: [338, 140], inbox: [330, 104], search: [142, 32]};
const SEARCH = {x: 12, y: 14, width: 236, height: 36};
const CUT = [40, 23];
const FOLDER = GLib.build_filenamev([GLib.get_home_dir(), 'Drag check']);

const clipboard = () => new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));

async function open(app, path) {
  await changes(app, 'Ctrl+L lets Rover take an address', () => press(Clutter.KEY_Control_L, Clutter.KEY_l));
  type(path);
  await changes(app, `Rover opens ${path}`, () => press(Clutter.KEY_Return));
}

async function checkDrag(app) {
  write(GLib.build_filenamev([FOLDER, 'Note.txt']), 'Pack the charger\n');
  GLib.mkdir_with_parents(GLib.build_filenamev([FOLDER, 'Inbox']), 0o755);
  await open(app, FOLDER);
  await drag(app.at(AT.note), app.at(AT.inbox), DRAG);
  await eventually(() => exists(GLib.build_filenamev([FOLDER, 'Inbox', 'Note.txt'])), 'Rover moves a file dropped on a folder');
  require(!exists(GLib.build_filenamev([FOLDER, 'Note.txt'])), 'dragging a file onto a folder in Rover moves it there');
}

async function checkTextMenu(app) {
  app.click(AT.search);
  await changes(app, 'Rover shows what is typed into its search', () => type('inbox'), SEARCH);
  await changes(app, 'Ctrl+A selects the search text', () => press(Clutter.KEY_Control_L, Clutter.KEY_a), SEARCH);
  await changes(app, "right-clicking the search opens the text field's own menu", () => app.click(AT.search, Clutter.BUTTON_SECONDARY));
  (await app.frame()).save('rover-text-menu-dark');
  const [x, y] = AT.search;
  app.click([x + CUT[0], y + CUT[1]]);
  await eventually(async () => await clipboard() === 'inbox', "a text field's own menu cuts the selected text");
}

export async function run() {
  try {
    await withPalette(async palette => {
      await withApp('rover', [], async app => {
        await checkPalette(app, palette, {accent: true});
        await showDark(app, palette);
        await checkDrag(app);
        await checkTextMenu(app);
      });
      const rclone = GLib.find_program_in_path('rclone');
      if (rclone) await checkNetwork(rclone);
      else console.log('Kestrel Luft app check: rover network locations skipped without rclone');
    });
  } finally {
    if (exists(FOLDER)) removeTree(FOLDER);
  }
}
