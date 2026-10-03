import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {LuftApp, sleep, waitFor} from './luftApp.js';

const KEY_LEFTCTRL = 29;
const KEY_LEFTSHIFT = 42;
const KEY_V = 47;
const KEY_ENTER = 28;
const KEY_ESC = 1;
const STEP = 600;
const MENU_AT = [220, 220];
const MENU_ITEM = {copy: 0, paste: 1, selectAll: 2};
const MENU_PADDING = 4;
const MENU_ITEM_HEIGHT = 38;
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

class TernDriver {
  constructor(app, {pointer, output}) {
    this.app = app;
    this.pointer = pointer;
    this.output = output;
    this.keyboard = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  }

  async click(x, y, button = Clutter.BUTTON_PRIMARY) {
    const frame = this.app.window.get_frame_rect();
    this.pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
    this.pointer.notify_button(GLib.get_monotonic_time(), button, Clutter.ButtonState.PRESSED);
    this.pointer.notify_button(GLib.get_monotonic_time(), button, Clutter.ButtonState.RELEASED);
    await sleep(STEP);
  }

  openMenu() {
    return this.click(...MENU_AT, Clutter.BUTTON_SECONDARY);
  }

  pick(item) {
    const [x, y] = MENU_AT;
    return this.click(x + 40, y + MENU_PADDING + MENU_ITEM_HEIGHT * (MENU_ITEM[item] + 0.5));
  }

  async menu(item) {
    await this.openMenu();
    await this.pick(item);
  }

  async keys(...codes) {
    for (const code of codes) this.keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.PRESSED);
    for (const code of codes.reverse()) this.keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.RELEASED);
    await sleep(STEP);
  }

  async shoot(name) {
    (await this.app.settle(() => true)).save(`${this.output}/tern-${name}.png`);
  }
}

export async function checkTern({require, output, pointer}) {
  const result = GLib.build_filenamev([GLib.get_user_cache_dir(), 'tern-paste-check.txt']);
  GLib.unlink(result);
  const app = new LuftApp('tern', ['-e', 'sh', '-c', promptScript(result)]);
  try {
    await app.open();
    await sleep(1500);
    const driver = new TernDriver(app, {pointer, output});

    await driver.menu('selectAll');
    await driver.shoot('select-all');
    await driver.menu('copy');
    require((await readClipboard()).includes(PRINTED), 'tern selects everything and copies it from the context menu');

    await driver.click(...MENU_AT);
    clipboard.set_text(St.ClipboardType.CLIPBOARD, MENU_PASTE);
    await driver.openMenu();
    await driver.shoot('menu');
    await driver.pick('paste');
    await driver.keys(KEY_ENTER);

    clipboard.set_text(St.ClipboardType.CLIPBOARD, CANCELLED);
    await driver.keys(KEY_LEFTCTRL, KEY_LEFTSHIFT, KEY_V);
    await driver.shoot('paste-dialog');
    await driver.keys(KEY_ESC);

    clipboard.set_text(St.ClipboardType.CLIPBOARD, CONFIRMED);
    await driver.menu('paste');
    await driver.keys(KEY_ENTER);

    await waitFor(() => readResult(result), 5000, () => 'the password prompt never received the paste');
    const [typed, first, second] = readResult(result).split('\n');
    require(typed === MENU_PASTE, 'tern pastes from the context menu');
    require(first === 'alpha' && second === 'bravo', 'Enter confirms the paste dialog at a password prompt, after Escape cancelled the one before');
  } finally {
    GLib.unlink(result);
    await app.close();
  }
}
