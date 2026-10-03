import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

const KEY_LEFTCTRL = 29;
const KEY_LEFTSHIFT = 42;
const KEY_HOME = 102;
const KEY_END = 107;
const KEY_INSERT = 110;
const SETTLED = 4000;

const clipboard = () => new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text ?? '')));

export function tryFieldChecker({keyboard, pause, waitFor}) {
  const press = (...codes) => {
    for (const code of codes) keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.PRESSED);
    for (const code of [...codes].reverse()) keyboard.notify_key(GLib.get_monotonic_time(), code, Clutter.KeyState.RELEASED);
  };
  const copied = async () => {
    St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, '');
    press(KEY_LEFTCTRL, KEY_END);
    press(KEY_LEFTCTRL, KEY_LEFTSHIFT, KEY_HOME);
    press(KEY_LEFTCTRL, KEY_INSERT);
    await pause(150);
    return clipboard();
  };
  return async (expected, label) => {
    await pause(600);
    let text = null;
    await waitFor(async () => (text = await copied()) === expected, SETTLED, () => `Kestrel Keys check failed: ${label} (the field holds “${text}”)`);
    console.log(`Kestrel Keys check: ${label}`);
  };
}
