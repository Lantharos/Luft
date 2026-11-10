import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {resetBattery, setBattery, UPOWER_STATE} from '../../../lib/battery.js';
import {scroll, type Point} from '../../../lib/input/input.js';
import {call} from '../../../lib/dbus.js';
import {callLog, takeCalls} from '../../../system/lib/systemCalls.js';
import {show} from '../navigation.js';

const {eventually} = checks('Luft app');
const ON_BATTERY = {IsPresent: true, OnBattery: true, State: UPOWER_STATE.discharging, Percentage: 64, TimeToEmpty: 4 * 60 * 60};
const CONTENT: Point = [650, 400];
const SWITCH_WITH_DELAY: Point = [959, 509];
const SWITCH_WITHOUT_DELAY: Point = [959, 573];
const DAY = 24 * 60 * 60;

async function toggle(app: LuftApp, calls: () => string[], point: Point, seconds: number, label: string) {
  const before = await app.frame();
  app.click(point);
  await eventually(() => calls().includes(`SetPowerOffAfter ${seconds}`), label);
  return app.changes(before, `${label} on the page`);
}

export async function checkLongSleep(app: LuftApp) {
  await call('com.lantharos.Sleep1', '/com/lantharos/Sleep1', 'com.lantharos.Sleep1', 'SetPowerOffAfter', new GLib.Variant('(u)', [DAY]), null, {connection: Gio.DBus.system});
  takeCalls();
  const calls = callLog();
  await setBattery(ON_BATTERY);
  try {
    await show(app, 'power');
    for (let step = 0; step < 10; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(CONTENT));
    (await app.settle(() => true)).save('settings-power-long-sleep-dark');
    (await toggle(app, calls, SWITCH_WITH_DELAY, 0, 'turning off shutting down after a long sleep keeps the computer asleep')).save('settings-power-long-sleep-off-dark');
    (await toggle(app, calls, SWITCH_WITHOUT_DELAY, DAY, 'turning it back on shuts down after a day')).save('settings-power-long-sleep-back-dark');
  } finally {
    await resetBattery();
  }
}
