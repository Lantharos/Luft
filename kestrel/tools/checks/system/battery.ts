import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main, MessageTray} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {resetBattery, setBattery, UPOWER_STATE, type BatteryValues} from '../lib/battery.js';
import {pause} from '../lib/wait.js';
import {callLog} from './lib/systemCalls.js';

const {require, eventually} = checks('battery');
const DRAINING: BatteryValues = {IsPresent: true, OnBattery: true, State: UPOWER_STATE.discharging, TimeToEmpty: 0};
const CHARGING: BatteryValues = {OnBattery: false, State: UPOWER_STATE.charging};

const notifications = () => Main.messageTray.getSources().flatMap(source => source.notifications);
const notice = (title: string) => notifications().find(notification => notification.title === title);

function canHibernate(answer: string) {
  return call('org.freedesktop.login1', '/com/lantharos/KestrelChecks/Login', 'com.lantharos.KestrelChecks.Login', 'SetCanHibernate',
    new GLib.Variant('(s)', [answer]), null, {connection: Gio.DBus.system});
}

async function checkPowerSaver(calls: () => string[]) {
  await setBattery({Percentage: 45, ...DRAINING});
  await setBattery({Percentage: 31});
  await pause(1000);
  require(!calls().includes('HoldProfile power-saver') && !notice('Power saver is on'), 'the power saver waits for 30%');
  await setBattery({Percentage: 30});
  await eventually(() => calls().includes('HoldProfile power-saver'), 'the power saver turns on at 30%');
  const told = await eventually(() => notice('Power saver is on'), 'a quiet notice says the power saver is on');
  require(told.urgency !== MessageTray.Urgency.CRITICAL && told.body === 'It makes the battery last until you plug in.', 'the notice isn’t urgent');
  const turnOff = told.actions.find(action => action.label === 'Turn off');
  require(turnOff, 'the notice can turn the power saver off');
  turnOff!.activate();
  await eventually(() => calls().includes('ReleaseProfile'), 'turning it off releases the power saver');
  const released = calls().length;
  await setBattery({Percentage: 25});
  await pause(1000);
  require(!calls().slice(released).includes('HoldProfile power-saver'), 'the power saver stays off for the rest of the discharge');
  await setBattery(CHARGING);
  await setBattery({Percentage: 25, ...DRAINING});
  await eventually(() => calls().slice(released).includes('HoldProfile power-saver'), 'a new discharge turns the power saver on again');
  await setBattery(CHARGING);
  await eventually(() => calls().slice(released).includes('ReleaseProfile') && !notice('Power saver is on'),
    'plugging in at 25% gives the power mode back');
}

async function checkEnding(calls: () => string[], hibernates: boolean) {
  const [ending, called] = hibernates ? ['hibernate', 'Hibernate'] : ['go to sleep', 'Suspend'];
  await canHibernate(hibernates ? 'yes' : 'na');
  await setBattery({Percentage: 16, ...DRAINING});
  await setBattery({Percentage: 15});
  const low = await eventually(() => notice('Battery low'), 'the first warning comes at 15%');
  require(low.body === '15% left.' && low.urgency !== MessageTray.Urgency.CRITICAL, 'right after unplugging the warning leaves out the estimate and isn’t urgent');
  await setBattery({Percentage: 7});
  const critical = await eventually(() => notice('Battery almost empty'), 'the critical warning comes at 7%');
  require(critical.urgency === MessageTray.Urgency.CRITICAL && !notice('Battery low'), 'the critical warning is urgent and replaces the low one');
  require(critical.body === `7% left. Plug in now, or the computer will ${ending} soon.`, `the warning says the computer will ${ending}`);
  await setBattery({Percentage: 4});
  await eventually(() => calls().includes(called), `at 4% the computer ${hibernates ? 'hibernates when it can' : 'suspends'}`);
  if (hibernates) require(!calls().includes('Suspend'), 'it hibernates instead of suspending');
  await setBattery(CHARGING);
  await eventually(() => !notice('Battery almost empty'), 'plugging in withdraws the warning');
}

export async function run() {
  const power = new Gio.Settings({schema_id: 'com.lantharos.kestrel.power'});
  const calls = callLog();
  try {
    await checkPowerSaver(calls);
    power.set_boolean('power-saver-profile-on-low-battery', false);
    await checkEnding(callLog(), false);
    await checkEnding(callLog(), true);
  } finally {
    power.reset('power-saver-profile-on-low-battery');
    await canHibernate('na');
    await resetBattery();
  }
}
