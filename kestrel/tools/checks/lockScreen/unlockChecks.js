import Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {checker, descendants} from '../portal/backend.js';

const require = checker('unlock');
const AUTHENTICATOR = ['com.lantharos.KestrelChecks.Authenticator', '/com/lantharos/KestrelChecks/Authenticator', 'com.lantharos.KestrelChecks.Authenticator'];
const PASSWORD = 'correct horse';
const INSTRUCTION = 'Place your finger on the fingerprint reader';
const WRONG_PASSWORD = 'That password didn’t work';

function authenticator(method, value) {
  return Gio.DBus.session.call(...AUTHENTICATOR, method, new GLib.Variant('(b)', [value]), null, Gio.DBusCallFlags.NONE, -1, null);
}

function hint() {
  return descendants(global.stage).find(actor => actor.has_style_class_name?.('login-dialog-hint') && actor.mapped)?.text ?? null;
}

function shown(text) {
  return descendants(global.stage).some(actor => actor.text === text && actor.mapped && actor.opacity > 0);
}

async function drawn(capture) {
  const path = GLib.build_filenamev([GLib.get_tmp_dir(), `kestrel-relock-${GLib.get_monotonic_time()}.png`]);
  await capture(path);
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file(path);
  GLib.unlink(path);
  const pixels = pixbuf.get_pixels();
  const middle = Math.floor(pixbuf.get_height() / 2) * pixbuf.get_rowstride() + Math.floor(pixbuf.get_width() / 2) * pixbuf.get_n_channels();
  return !pixbuf.get_has_alpha() || pixels[middle + 3] === 255;
}

export async function checkUnlock({pause, capture, output, pointer, keyboard}) {
  const press = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => press(character.charCodeAt(0)));
  const lockAndWake = async () => {
    Main.screenShield.lock(true);
    await pause(1200);
    pointer.notify_relative_motion(GLib.get_monotonic_time(), 30, 30);
    await pause(1200);
    press(Clutter.KEY_space);
    await pause(1200);
  };
  const tryWrongPassword = async () => {
    type('wrong horse');
    press(Clutter.KEY_Return);
    await pause(900);
  };

  await authenticator('SetFingerprint', true);
  try {
    await lockAndWake();
    require(hint() === INSTRUCTION, 'the unlock prompt listens for a finger next to the password field');
    await capture(`${output}/unlock-fingerprint.png`);
    await tryWrongPassword();
    require(Main.screenShield.locked && hint() === INSTRUCTION, 'a wrong password leaves the fingerprint reader listening');
    await authenticator('Touch', false);
    await pause(300);
    require(hint() === 'Fingerprint not recognized', 'an unknown finger says so');
    await authenticator('Touch', true);
    await pause(1200);
    require(!Main.screenShield.locked, 'a recognized finger unlocks the session');
  } finally {
    await authenticator('SetFingerprint', false);
  }

  await lockAndWake();
  require(await drawn(capture), 'the lock screen shows again after unlocking with a finger');
  require(hint() === null, 'without enrolled fingers the unlock prompt only asks for the password');
  await tryWrongPassword();
  require(Main.screenShield.locked && shown(WRONG_PASSWORD), 'a wrong password keeps the session locked');
  type(PASSWORD);
  press(Clutter.KEY_Return);
  await pause(1200);
  require(!Main.screenShield.locked, 'the password unlocks the session');
}
