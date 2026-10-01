import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const CHECKS = 'com.lantharos.KestrelChecks';
const DIM_DELAY = 24;
const SUSPEND_DELAY = 4;
const STUCK_SECONDS = 24;
const RECOVERY_SECONDS = 7;
const POWER_KEYS = 'Inhibit handle-power-key:handle-suspend-key:handle-hibernate-key block';

function systemCalls() {
  const bus = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return () => bus.call_sync(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null,
    new GLib.VariantType('(as)'), Gio.DBusCallFlags.NONE, -1, null).deep_unpack()[0];
}

function notified(summary) {
  return Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === summary));
}

export async function checkPower({pause, pointer}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel power check failed: ${label}`);
    console.log(`Kestrel power check: ${label}`);
  };
  const waitFor = async (condition, seconds) => {
    for (let waited = 0; waited < seconds * 1000 && !condition(); waited += 200) await pause(200);
    return condition();
  };
  const wake = () => pointer.notify_relative_motion(GLib.get_monotonic_time(), 3, 3);
  const takeCalls = systemCalls();
  const power = new Gio.Settings({schema_id: 'com.lantharos.kestrel.power'});
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  const startup = takeCalls();
  require(startup.includes('Inhibit sleep delay') && startup.includes('Inhibit handle-lid-switch block'),
    'the session gets a moment to lock before sleeping and decides lid closing itself');
  require(startup.includes(POWER_KEYS), 'the desktop decides what the power keys do');

  let app = null;
  try {
    session.set_uint('idle-delay', DIM_DELAY);
    wake();
    require(await waitFor(() => Main.brightnessManager.dimming, DIM_DELAY / 2 + 4), 'the screen dims after half the screen blank delay');
    wake();
    require(await waitFor(() => !Main.brightnessManager.dimming, 2), 'using the computer brings the brightness back');

    power.set_boolean('idle-dim', false);
    power.set_string('sleep-inactive-ac-type', 'suspend');
    power.set_int('sleep-inactive-ac-timeout', SUSPEND_DELAY);
    wake();
    await pause((SUSPEND_DELAY + 2) * 1000);
    require(notified('Suspending soon'), 'a notification warns before the computer suspends');
    require(takeCalls().includes('Suspend'), 'the computer suspends after the idle time');

    app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_SESSION_CLIENT_SCRIPT'), '--inhibit'], Gio.SubprocessFlags.NONE);
    await pause(1000);
    wake();
    await pause((SUSPEND_DELAY + 2) * 1000);
    require(!takeCalls().includes('Suspend') && !notified('Suspending soon'), 'apps that keep the session awake hold off suspending');
  } finally {
    app?.force_exit();
    for (const key of ['idle-dim', 'sleep-inactive-ac-type', 'sleep-inactive-ac-timeout']) power.reset(key);
    session.reset('idle-delay');
    wake();
  }

  const [waitMs, recovering] = (await Gio.DBus.session.call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Health',
    'com.lantharos.Kestrel.Health', 'Check', null, new GLib.VariantType('(tb)'), Gio.DBusCallFlags.NONE, -1, null)).deep_unpack();
  require(waitMs === 0 && !recovering, 'Kestrel tells the watchdog that its frames reach the screen');
  takeCalls();
  GLib.usleep(STUCK_SECONDS * GLib.USEC_PER_SEC);
  await pause(RECOVERY_SECONDS * 1000);
  const afterStall = takeCalls();
  require(afterStall.includes(`Report ${new Gio.Credentials().get_unix_pid()}`), 'a stuck Kestrel is reported to the system watchdog');
  require(afterStall.includes(POWER_KEYS), 'the power keys return to the desktop once Kestrel answers again');
}
