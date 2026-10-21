import Clutter from 'gi://Clutter';

import {checks} from '../../../lib/check.js';
import {resetBattery, setBattery, UPOWER_STATE} from '../../../lib/battery.js';
import {scroll} from '../../../lib/input/input.js';
import {callLog} from '../../../system/lib/systemCalls.js';
import {show} from '../navigation.js';

const {eventually} = checks('Luft app');
const ON_BATTERY = {IsPresent: true, OnBattery: true, State: UPOWER_STATE.discharging, Percentage: 64, TimeToEmpty: 4 * 60 * 60};
const CONTENT = [650, 400];
const SWITCH_WITH_DELAY = [959, 509];
const SWITCH_WITHOUT_DELAY = [959, 573];
const DAY = 24 * 60 * 60;

async function toggle(app, calls, point, seconds, label) {
  const before = await app.frame();
  app.click(point);
  await eventually(() => calls().includes(`SetPowerOffAfter ${seconds}`), label);
  return app.changes(before, `${label} on the page`);
}

export async function checkLongSleep(app) {
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
