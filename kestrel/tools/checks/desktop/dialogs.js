import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press, rightClick} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {nextFrame, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('dialog');
const MOUNT = ['org.gtk.MountOperationHandler', '/org/gtk/MountOperationHandler', 'org.Gtk.MountOperationHandler'];
const END_SESSION = ['org.gnome.Shell', '/org/gnome/SessionManager/EndSessionDialog', 'org.gnome.SessionManager.EndSessionDialog'];
const LOGOUT = 0;
const COUNTDOWN = 60;

async function checkLockMode(panel, start) {
  Main.sessionMode.pushMode('unlock-dialog');
  try {
    await eventually(() => !panel.visible && !start.visible, 'lock mode hides the taskbar and Start');
    global.display.emit('overlay-key');
    await nextFrame();
    require(!start.visible, 'Super cannot open Start while locked');
  } finally {
    Main.sessionMode.popMode('unlock-dialog');
  }
  await eventually(() => panel.visible, 'the taskbar returns after leaving lock mode');
  for (const name of ['polkitAgent', 'networkAgent', 'automountManager'])
    require(!!Main.componentManager._allComponents[name], `the ${name} component is loaded`);
}

async function checkHeadset(start) {
  toggleSurface('start');
  await eventually(() => shown(start), 'Start opens');
  const {HEADPHONES, HEADSET, MICROPHONE} = Shell.MixerHeadset;
  Shell.Mixer.get_default().emit('headset-changed', HEADPHONES | HEADSET | MICROPHONE);
  await eventually(() => !start.visible && Main.modalCount > 0, 'plugging in a headset asks what it is, dismissing Start');
  await capture('audio-device-dialog');
  press(Clutter.KEY_Escape);
  await eventually(() => Main.modalCount === 0, 'Escape cancels the audio device question');
}

async function checkVolumePassword() {
  const request = call(...MOUNT, 'AskPassword', new GLib.Variant('(sssssu)',
    ['kestrel-check', 'Unlock encrypted volume', 'drive-harddisk-symbolic', '', '', Gio.AskPasswordFlags.NEED_PASSWORD]));
  const entry = await waitUntil(() => descendants(global.stage).find(actor => actor instanceof St.PasswordEntry && actor.mapped),
    'the encrypted volume password dialog opens');
  require(Main.modalCount > 0, 'the encrypted volume password dialog is modal');
  await capture('volume-password-dialog');
  const [x, y] = entry.get_transformed_position();
  rightClick([x + 40, y + entry.height / 2]);
  await eventually(() => entry.menu.isOpen, 'right-clicking a password field offers to show the text');
  await capture('password-menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !entry.menu.isOpen, 'Escape closes the password field menu');
  press(Clutter.KEY_Escape);
  await request;
  await call(...MOUNT, 'Close');
  await eventually(() => Main.modalCount === 0, 'the password dialog cancels cleanly');
}

async function checkEndSession() {
  await call(...END_SESSION, 'Open', new GLib.Variant('(uuuao)', [LOGOUT, 0, COUNTDOWN, []]));
  await eventually(() => Main.modalCount > 0, 'the log out confirmation opens');
  await capture('end-session-dialog');
  await call(...END_SESSION, 'Close');
  await eventually(() => Main.modalCount === 0, 'the log out confirmation closes');
}

export async function run() {
  const panel = named('kestrel-panel');
  const start = named('kestrel-start');
  await checkLockMode(panel, start);
  await checkHeadset(start);
  await checkVolumePassword();
  await checkEndSession();
}
