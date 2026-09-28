import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const MANAGER = 'org.gnome.SessionManager';
const MANAGER_PATH = '/org/gnome/SessionManager';
const IDLE = 8;
const IDLE_STATUS = 3;

function call(path, iface, method, parameters, replyType) {
  return Gio.DBus.session.call(MANAGER, path, iface, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

async function presenceStatus() {
  const reply = await call(`${MANAGER_PATH}/Presence`, 'org.freedesktop.DBus.Properties', 'Get',
    new GLib.Variant('(ss)', [`${MANAGER}.Presence`, 'status']), '(v)');
  return reply.recursiveUnpack()[0];
}

export async function checkSessionManager({pause, pointer}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel session check failed: ${label}`);
    console.log(`Kestrel session check: ${label}`);
  };
  const events = [];
  const subscription = Gio.DBus.session.signal_subscribe(MANAGER, MANAGER, null, MANAGER_PATH, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, signal) => events.push(signal));
  const inhibited = async () => (await call(MANAGER_PATH, MANAGER, 'IsInhibited', new GLib.Variant('(u)', [IDLE]), '(b)')).deep_unpack()[0];

  const [running] = (await call(MANAGER_PATH, MANAGER, 'IsSessionRunning', null, '(b)')).deep_unpack();
  const [name] = (await call(MANAGER_PATH, 'org.freedesktop.DBus.Properties', 'Get',
    new GLib.Variant('(ss)', [MANAGER, 'SessionName']), '(v)')).recursiveUnpack();
  require(running && name === 'kestrel', 'Kestrel runs the session itself');

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_SESSION_CLIENT_SCRIPT'), '--inhibit', '--register'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1200);
    require(await inhibited() && events.includes('InhibitorAdded') && events.includes('ClientAdded'), 'apps can keep the session awake and register with it');
    const started = GLib.get_monotonic_time();
    await call(MANAGER_PATH, MANAGER, 'Logout', new GLib.Variant('(u)', [1]), null);
    while (!events.includes('SessionOver') && GLib.get_monotonic_time() - started < 3_000_000) await pause(50);
    require(events.includes('SessionOver') && GLib.get_monotonic_time() - started < 900_000, 'logging out asks running apps first and moves on once they answer');
  } finally {
    app.force_exit();
  }
  await pause(600);
  require(!await inhibited() && events.includes('InhibitorRemoved') && events.includes('ClientRemoved'), 'apps that quit release the session');

  await call(MANAGER_PATH, MANAGER, 'Logout', new GLib.Variant('(u)', [0]), null);
  await pause(600);
  require(Main.modalCount > 0, 'logging out asks for confirmation');
  await Gio.DBus.session.call(Gio.DBus.session.get_unique_name(), `${MANAGER_PATH}/EndSessionDialog`, `${MANAGER}.EndSessionDialog`, 'Close',
    null, null, Gio.DBusCallFlags.NONE, -1, null);
  await pause(600);
  require(Main.modalCount === 0, 'cancelling keeps the session running');

  const sessionSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  const screensaver = new Gio.Settings({schema_id: 'org.gnome.desktop.screensaver'});
  const lockEnabled = screensaver.get_boolean('lock-enabled');
  screensaver.set_boolean('lock-enabled', false);
  sessionSettings.set_uint('idle-delay', 1);
  try {
    await pause(1800);
    require(await presenceStatus() === IDLE_STATUS, 'the session goes idle when nobody is using it');
    pointer.notify_relative_motion(GLib.get_monotonic_time(), 5, 5);
    await pause(600);
    require(await presenceStatus() === 0, 'using the computer again wakes the session');
  } finally {
    sessionSettings.reset('idle-delay');
    screensaver.set_boolean('lock-enabled', lockEnabled);
    Gio.DBus.session.signal_unsubscribe(subscription);
  }
  await pause(800);
}
