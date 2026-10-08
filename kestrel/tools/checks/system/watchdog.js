import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {callLog, takeCalls} from './lib/systemCalls.js';

const {require, eventually} = checks('watchdog');
const STALL_LIMIT = 30 * GLib.USEC_PER_SEC;
const STALL_STEP = 100 * 1000;
const POWER_KEYS = 'Inhibit handle-power-key:handle-suspend-key:handle-hibernate-key block';

function stallUntil(reported) {
  const deadline = GLib.get_monotonic_time() + STALL_LIMIT;
  const calls = [];
  while (GLib.get_monotonic_time() < deadline && !calls.includes(reported)) {
    GLib.usleep(STALL_STEP);
    calls.push(...takeCalls());
  }
  return calls.includes(reported);
}

export async function run() {
  const [waitMs, recovering] = (await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Health', 'com.lantharos.Kestrel.Health', 'Check',
    null, '(tb)')).deepUnpack();
  require(waitMs === 0 && !recovering, 'Kestrel tells the watchdog that its frames reach the screen');

  takeCalls();
  require(stallUntil(`Report ${new Gio.Credentials().get_unix_pid()}`), 'a stuck Kestrel is reported to the system watchdog');
  const calls = callLog();
  await eventually(() => calls().includes(POWER_KEYS), 'the power keys return to the desktop once Kestrel answers again', 10000);
}
