import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const [mode, title, hint = ''] = ARGV;
const SIGTERM = 15;
const PING_SECONDS = 0.3;
const CALL_SECONDS = 10;
const CALL_RINGING_MS = 1000;
const STEP_MS = 50;
const LINGER_MS = 1000;

const pause = ms => new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => resolve()));
const play = seconds => Gio.Subprocess.new(['timeout', `${seconds}`, 'pacat', '--playback', '/dev/zero'], Gio.SubprocessFlags.NONE);

function hints() {
  const [name, value] = hint.split('=');
  const extra = {
    'suppress-sound': () => new GLib.Variant('b', true),
    'sound-name': () => new GLib.Variant('s', value),
  }[name];
  return {'desktop-entry': new GLib.Variant('s', 'discord'), ...extra && {[name]: extra()}};
}

function notify() {
  Gio.DBus.session.call_sync('org.freedesktop.Notifications', '/org/freedesktop/Notifications',
    'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', ['Discord', 0, '', title, 'Are you joining?', [], hints(), -1]),
    null, Gio.DBusCallFlags.NONE, -1, null);
}

const steps = {
  async ping() {
    const player = play(PING_SECONDS);
    await pause(STEP_MS);
    notify();
    return player;
  },
  async late() {
    notify();
    await pause(STEP_MS);
    return play(PING_SECONDS);
  },
  async call() {
    const player = play(CALL_SECONDS);
    await pause(CALL_RINGING_MS);
    notify();
    return player;
  },
  async quiet() {
    notify();
    return null;
  },
};

const player = await steps[mode]();
await pause(LINGER_MS);
player?.send_signal(SIGTERM);
