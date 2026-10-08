import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {scratch} from '../lib/processes.js';
import {changes, withApp} from './lib/apps.js';
import {checkPalette, withPalette} from './lib/palette.js';

const {require, eventually} = checks('Luft app');
const MENU_AT = [220, 220];
const MENU = {x: 220, y: 220, width: 200, height: 330};
const MENU_ITEM = {copy: 0, paste: 1, selectAll: 2};
const MENU_PADDING = 4;
const MENU_ITEM_HEIGHT = 38;
const FIRST_LINE = {x: 0, y: 50, width: 300, height: 22};
const PROMPT_LINE = {x: 0, y: 86, width: 300, height: 22};
const DIALOG = {x: 200, y: 190, width: 560, height: 240};
const PRINTED = 'tern-copy-check';
const MENU_PASTE = 'menu-paste';
const CANCELLED = 'cancelled\nwith escape\n';
const CONFIRMED = 'alpha\nbravo\n';

const promptScript = result => `printf '${PRINTED}\\n'
read -r typed
printf '[sudo] password for luft: '
stty -echo
read -r first
read -r second
stty echo
printf '%s\\n%s\\n%s\\n' "$typed" "$first" "$second" > '${result}'
sleep 60`;

const clipboard = St.Clipboard.get_default();
const readClipboard = () => new Promise(resolve => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));
const readResult = path => GLib.file_test(path, GLib.FileTest.EXISTS) && new TextDecoder().decode(GLib.file_get_contents(path)[1]);
const copy = text => clipboard.set_text(St.ClipboardType.CLIPBOARD, text);

const openMenu = app => changes(app, 'right-clicking tern opens its menu', () => app.click(MENU_AT, Clutter.BUTTON_SECONDARY), MENU);

function pick(app, item) {
  const [x, y] = MENU_AT;
  return changes(app, `choosing ${item} closes the menu`, () => app.click([x + 40, y + MENU_PADDING + MENU_ITEM_HEIGHT * (MENU_ITEM[item] + 0.5)]), MENU);
}

async function checkMenu(app) {
  await openMenu(app);
  await changes(app, 'Select all highlights the printed text', () => pick(app, 'selectAll'), FIRST_LINE);
  (await app.frame()).save('tern-select-all');
  await openMenu(app);
  await pick(app, 'copy');
  await eventually(async () => (await readClipboard())?.includes(PRINTED), 'tern selects everything and copies it from the context menu');
  await changes(app, 'clicking clears the selection', () => app.click(MENU_AT), FIRST_LINE);
}

async function checkPasting(app, result) {
  copy(MENU_PASTE);
  await openMenu(app);
  (await app.frame()).save('tern-menu');
  await pick(app, 'paste');
  await changes(app, 'the script asks for a password', () => press(Clutter.KEY_Return), PROMPT_LINE);

  copy(CANCELLED);
  await changes(app, 'pasting several lines at a password prompt asks first', () => press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_V), DIALOG);
  (await app.frame()).save('tern-paste-dialog');
  await changes(app, 'Escape cancels the paste dialog', () => press(Clutter.KEY_Escape), DIALOG);

  copy(CONFIRMED);
  await openMenu(app);
  await changes(app, 'pasting several lines from the menu asks too', () => pick(app, 'paste'), DIALOG);
  press(Clutter.KEY_Return);

  await eventually(() => readResult(result), 'the password prompt receives the paste');
  const [typed, first, second] = readResult(result).split('\n');
  require(typed === MENU_PASTE, 'tern pastes from the context menu');
  require(first === 'alpha' && second === 'bravo', 'Enter confirms the paste dialog at a password prompt, after Escape cancelled the one before');
}

export async function run() {
  const result = scratch('tern-paste-check.txt');
  GLib.unlink(result);
  try {
    await withPalette(palette => withApp('tern', ['-e', 'sh', '-c', promptScript(result)], async app => {
      await checkPalette(app, palette, {tolerance: 40});
      await checkMenu(app);
      await checkPasting(app, result);
    }));
  } finally {
    GLib.unlink(result);
  }
}
