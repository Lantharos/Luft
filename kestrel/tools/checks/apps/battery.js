import {resetBattery, setBattery, UPOWER_STATE} from '../lib/battery.js';
import {checks} from '../lib/check.js';
import {callLog} from '../system/lib/systemCalls.js';
import {withApp} from './lib/apps.js';
import {useScheme} from './lib/palette.js';
import {show} from './settings/navigation.js';

const {eventually} = checks('Luft app');
const ABSURD_ESTIMATE = 1041 * 3600 + 46 * 60;
const SECTION = {x: 280, y: 0, width: 1000, height: 520};

const PLUGGED = {IsPresent: true, OnBattery: false, EnergyRate: 0.02, TimeToFull: 0, TimeToEmpty: ABSURD_ESTIMATE};
const STATES = [
  ['full', {...PLUGGED, Percentage: 99, State: UPOWER_STATE.full}],
  ['plugged', {...PLUGGED, Percentage: 99, State: UPOWER_STATE.discharging}],
  ['charging', {...PLUGGED, Percentage: 46, State: UPOWER_STATE.charging, EnergyRate: 31, TimeToFull: 2700}],
  ['discharging', {IsPresent: true, OnBattery: true, Percentage: 64, State: UPOWER_STATE.discharging, EnergyRate: 8.5, TimeToEmpty: 12600}],
  ['absurd-estimate', {IsPresent: true, OnBattery: true, Percentage: 64, State: UPOWER_STATE.discharging, EnergyRate: 0.02, TimeToEmpty: ABSURD_ESTIMATE}],
];

async function showState(app, name, values) {
  const before = await app.frame(app.area(SECTION));
  await setBattery(values);
  await app.changes(before, `the battery section follows UPower when the battery is ${name.replace('-', ' ')}`, app.area(SECTION));
  (await app.settle(() => true)).save(`settings-battery-${name}`);
}

const LIMIT_SWITCH = [959, 354];

async function checkLimit(app) {
  await showState(app, 'limit-by-firmware', {ChargeThresholdSupported: true, ChargeThresholdEnabled: false, ChargeStartThreshold: 0, ChargeEndThreshold: 0});
  await showState(app, 'limit', {ChargeStartThreshold: 75, ChargeEndThreshold: 80});
  const calls = callLog();
  calls();
  app.click(LIMIT_SWITCH);
  await eventually(() => calls().includes('EnableChargeThreshold true'), 'the charge limit switch asks UPower to limit charging');
  (await app.settle(() => true)).save('settings-battery-limit-on');
}

export async function run() {
  useScheme('light');
  try {
    await setBattery(STATES[0][1]);
    await withApp('settings', [], async app => {
      await show(app, 'power');
      (await app.settle(() => true)).save('settings-battery-full');
      for (const [name, values] of STATES.slice(1)) await showState(app, name, values);
      await checkLimit(app);
    });
  } finally {
    await resetBattery();
  }
}
