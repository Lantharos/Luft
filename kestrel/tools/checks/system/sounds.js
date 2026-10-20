import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {captureScreenshot} from 'resource:///com/lantharos/kestrel/ui/screenshot.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press} from '../lib/input.js';
import {gjs} from '../lib/processes.js';
import {pause} from '../lib/wait.js';

const {require, eventually} = checks('sounds');
const QUIET_MS = 600;
const LOW = 0;

const player = Shell.SoundPlayer.get_default();
const sound = new Gio.Settings({schema_id: 'org.gnome.desktop.sound'});
const notifications = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
const lockdown = new Gio.Settings({schema_id: 'org.gnome.desktop.lockdown'});
const heard = [];

function notify(title, hints = {}) {
  return call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', ['Chatter', 0, '', title, 'Lunch at one?', [], {
      'x-shell-sender': new GLib.Variant('s', Gio.DBus.session.get_unique_name()),
      'x-shell-sender-pid': new GLib.Variant('u', 7),
      ...hints,
    }, -1]), '(u)');
}

async function plays(name, label, action) {
  heard.length = 0;
  await action();
  await eventually(() => heard.includes(name), label);
}

async function quiet(label, action) {
  heard.length = 0;
  await action();
  await pause(QUIET_MS);
  require(heard.length === 0, label);
}

async function takeScreenshot() {
  const [content] = await new Shell.Screenshot().screenshot_stage_to_content();
  await captureScreenshot(content.get_texture(), null, 1, null);
}

function ringBell() {
  return gjs('clients/bell.js').exited;
}

export async function run() {
  const played = player.connect('played', (_player, name) => heard.push(name));
  const {output} = Shell.Mixer.get_default();
  const volume = output.volume;
  lockdown.set_boolean('disable-save-to-disk', true);
  try {
    await plays('message-new-instant', 'a notification plays the notification sound', () => notify('Maya'));
    await plays('dialog-information', 'a low urgency notification plays the softer sound',
      () => notify('Noor', {urgency: new GLib.Variant('y', LOW)}));
    await plays('message-new-email', 'a notification can ask for a sound by name',
      () => notify('Inbox', {'sound-name': new GLib.Variant('s', 'message-new-email')}));
    await quiet('a notification asking for silence plays nothing',
      () => notify('Sam', {'suppress-sound': new GLib.Variant('b', true)}));

    notifications.set_boolean('show-banners', false);
    await quiet('Do Not Disturb silences notification sounds', () => notify('Maya'));
    notifications.set_boolean('show-banners', true);

    output.set_volume(0.5);
    await plays('audio-volume-change', 'the volume keys tick on the output', () => press(Clutter.KEY_AudioRaiseVolume));
    output.set_muted(true);
    await quiet('a muted output stays silent when its volume changes', () => press(Clutter.KEY_AudioLowerVolume));
    output.set_muted(false);

    await plays('screen-capture', 'saving a screenshot plays the shutter', takeScreenshot);
    await plays('dialog-error', 'the bell plays the error sound', ringBell);

    sound.set_boolean('event-sounds', false);
    await quiet('turning system sounds off silences notifications', () => notify('Maya'));
    await quiet('and the volume keys', () => press(Clutter.KEY_AudioRaiseVolume));
    await quiet('and the bell', ringBell);
    sound.set_boolean('event-sounds', true);

    console.log(`Kestrel sounds check: ${player.get_cached_bytes()} bytes of decoded sounds kept`);
  } finally {
    player.disconnect(played);
    notifications.reset('show-banners');
    sound.reset('event-sounds');
    lockdown.reset('disable-save-to-disk');
    output.set_muted(false);
    output.set_volume(volume);
  }
}
