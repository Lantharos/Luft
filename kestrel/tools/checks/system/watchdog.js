import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {callLog, takeCalls} from './lib/systemCalls.js';

const {require, eventually} = checks('watchdog');
const STALL_LIMIT = 30 * GLib.USEC_PER_SEC;
const STALL_STEP = 100 * 1000;
const PRESS_AFTER = 2 * GLib.USEC_PER_SEC;
const RELEASE_LIMIT = 12 * GLib.USEC_PER_SEC;
const POWER_KEYS = 'handle-power-key:handle-suspend-key:handle-hibernate-key block';
const EVENT_SIZE = 24;
const EV_KEY = 1;
const KEY_POWER = 116;

function pressPowerButton() {
  const event = new Uint8Array(EVENT_SIZE);
  const fields = new DataView(event.buffer);
  fields.setUint16(16, EV_KEY, true);
  fields.setUint16(18, KEY_POWER, true);
  fields.setInt32(20, 1, true);
  const button = Gio.File.new_for_path(GLib.build_filenamev([GLib.getenv('LUFT_INPUT_ROOT'), 'dev', 'input', 'event0']));
  const stream = button.append_to(Gio.FileCreateFlags.NONE, null);
  stream.write_all(event, null);
  stream.close(null);
}

function hang() {
  const started = GLib.get_monotonic_time();
  const calls = [];
  let pressed = null;
  let released = null;
  while (GLib.get_monotonic_time() - started < STALL_LIMIT && !calls.some(name => name.startsWith('Report '))) {
    GLib.usleep(STALL_STEP);
    if (pressed === null && GLib.get_monotonic_time() - started >= PRESS_AFTER) {
      pressPowerButton();
      pressed = GLib.get_monotonic_time();
    }
    calls.push(...takeCalls());
    if (released === null && calls.includes(`Release ${POWER_KEYS}`)) released = GLib.get_monotonic_time();
  }
  return {calls, released: released === null ? null : released - pressed};
}

export async function run() {
  const [waitMs, recovering] = (await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Health', 'com.lantharos.Kestrel.Health', 'Check',
    null, '(tb)')).deepUnpack();
  require(waitMs === 0 && !recovering, 'Kestrel tells the watchdog that its frames reach the screen');

  takeCalls();
  const {calls, released} = hang();
  require(released !== null && released <= RELEASE_LIMIT,
    `the power button goes straight to the system ${released === null ? 'never' : `${(released / GLib.USEC_PER_SEC).toFixed(1)} s`} after it is pressed during a hang`);
  require(calls.includes(`Report ${new Gio.Credentials().get_unix_pid()}`), 'a stuck Kestrel is reported to the system watchdog');
  const log = callLog();
  await eventually(() => log().includes(`Inhibit ${POWER_KEYS}`), 'the power keys return to the desktop once Kestrel answers again', 10000);
}
