import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {captureScreenshot} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press} from '../lib/input/input.js';
import {gjs, spawn} from '../lib/processes.js';
import {pause} from '../lib/wait.js';

const {require, eventually} = checks('sounds');
const QUIET_MS = 600;
const LOW = 0;
const PING_SECONDS = 0.3;
const MEASURED_STARTS = 200;

const player = Shell.SoundPlayer.get_default();
const sound = new Gio.Settings({schema_id: 'org.gnome.desktop.sound'});
const notifications = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
const lockdown = new Gio.Settings({schema_id: 'org.gnome.desktop.lockdown'});
const discord = new Gio.Settings({
  schema_id: 'com.lantharos.kestrel.notifications.application',
  path: '/com/lantharos/kestrel/notifications/application/discord/',
});
const heard: string[] = [];

function notify(title: string, hints: Record<string, GLib.Variant> = {}) {
  return call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', ['Chatter', 0, '', title, 'Lunch at one?', [], {
      'x-shell-sender': new GLib.Variant('s', Gio.DBus.session.get_unique_name()!),
      'x-shell-sender-pid': new GLib.Variant('u', 7),
      ...hints,
    }, -1]), '(u)');
}

function chatter(mode: string, hint?: string) {
  return gjs('clients/apps/chatter.js', [mode, 'Ana', ...hint ? [hint] : []]).exited;
}

async function pingFromProcessNamed(name: string) {
  spawn(['timeout', `${PING_SECONDS}`, 'pacat', `--client-name=${name}`, '--playback', '/dev/zero']);
  await chatter('quiet');
}

async function latencyOf(label: string, action: () => Promise<unknown>) {
  heard.length = 0;
  const start = GLib.get_monotonic_time();
  await action();
  await eventually(() => heard.length > 0, label);
  return (GLib.get_monotonic_time() - start) / 1000;
}

function costOfPlaybackStarts() {
  const mixer = Shell.Mixer.get_default();
  const pid = new Gio.Credentials().get_unix_pid();
  const start = GLib.get_monotonic_time();
  for (let i = 0; i < MEASURED_STARTS; i++) mixer.emit('playback-started', pid, null, null, null);
  return (GLib.get_monotonic_time() - start) / MEASURED_STARTS;
}

async function plays(name: string, label: string, action: () => unknown) {
  heard.length = 0;
  await action();
  await eventually(() => heard.includes(name), label);
}

async function quiet(label: string, action: () => unknown) {
  heard.length = 0;
  await action();
  await pause(QUIET_MS);
  require(heard.length === 0, label);
}

async function takeScreenshot() {
  const [content] = await new Shell.Screenshot().screenshot_stage_to_content();
  if (content instanceof Clutter.TextureContent) await captureScreenshot(content.get_texture(), null, 1, null);
}

function ringBell() {
  return gjs('clients/apps/bell.js').exited;
}

export async function run() {
  const played = player.connect('played', (_player, name) => heard.push(name));
  const output = require(Shell.Mixer.get_default().output, 'sounds have an output to play on');
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

    await plays('message-new-instant', 'an app that plays nothing itself gets Luft’s sound', () => chatter('quiet'));
    await quiet('an app that pings as it notifies keeps Luft’s sound out', () => chatter('ping'));
    await quiet('and so does one that pings right after', () => chatter('late'));
    await plays('message-new-instant', 'a call that was already playing doesn’t count as the app’s own sound',
      () => chatter('call'));
    await quiet('a ping from a process named after the app counts as its own', () => pingFromProcessNamed('Discord'));
    await quiet('an app asking for silence gets none', () => chatter('quiet', 'suppress-sound'));

    discord.set_string('sound', 'luft');
    await plays('message-new-instant', 'choosing Luft’s sound plays it over the app’s own', () => chatter('ping'));
    await plays('message-new-instant', 'and over a request for silence', () => chatter('quiet', 'suppress-sound'));
    discord.set_string('sound', 'app');
    await quiet('choosing the app’s own leaves Luft’s sound out', () => chatter('quiet'));
    await plays('message-new-email', 'but plays the sound the app asks for',
      () => chatter('quiet', 'sound-name=message-new-email'));
    discord.set_string('sound', 'none');
    await quiet('choosing none plays nothing', () => chatter('quiet', 'sound-name=message-new-email'));

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

    const unknown = await latencyOf('a sender Kestrel can’t place hears Luft’s sound right away',
      () => notify('Maya', {'x-shell-sender-pid': new GLib.Variant('u', 0)}));
    const watched = await latencyOf('a known sender hears it once its own sound had time to start', () => notify('Maya'));
    console.log(`Kestrel sounds check: ${player.get_cached_bytes()} bytes of decoded sounds kept`);
    console.log(`Kestrel sounds check: Luft’s sound after ${unknown.toFixed(1)} ms for an unknown sender, ${watched.toFixed(1)} ms when waiting for the app’s own`);
    console.log(`Kestrel sounds check: ${costOfPlaybackStarts().toFixed(1)} µs to note a stream starting`);
  } finally {
    player.disconnect(played);
    discord.reset('sound');
    notifications.reset('show-banners');
    sound.reset('event-sounds');
    lockdown.reset('disable-save-to-disk');
    output.set_muted(false);
    output.set_volume(volume);
  }
}
