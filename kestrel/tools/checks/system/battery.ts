import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main, MessageTray} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {resetBattery, setBattery, UPOWER_STATE, type BatteryValues} from '../lib/battery.js';
import {pause} from '../lib/wait.js';
import {callLog} from './lib/systemCalls.js';

const {require, eventually} = checks('battery');
const MINUTE = 60;
const ESTIMATE_SETTLES = 61 * 1000;
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

async function checkWarnings(calls: () => string[]) {
  await setBattery({Percentage: 40, ...DRAINING, TimeToEmpty: 3 * 60 * MINUTE});
  await pause(ESTIMATE_SETTLES);
  await setBattery({Percentage: 22, TimeToEmpty: 24 * MINUTE});
  const low = await eventually(() => notice('Battery low'), 'a fast-draining battery warns at 25 minutes left');
  require(low.body === '22% left, about 24 min.' && low.urgency !== MessageTray.Urgency.CRITICAL, 'the warning says how long the battery lasts');
  await setBattery({Percentage: 18, TimeToEmpty: 30 * MINUTE});
  await pause(1000);
  require(!notice('Battery almost empty'), 'a longer estimate doesn’t warn again');
  await setBattery({Percentage: 12, TimeToEmpty: 9 * MINUTE});
  const critical = await eventually(() => notice('Battery almost empty'), 'the critical warning comes at 10 minutes left');
  require(critical.urgency === MessageTray.Urgency.CRITICAL && !notice('Battery low'), 'the critical warning is urgent and replaces the low one');
  require(critical.body === '12% left, about 9 min. Plug in now, or the computer will suspend soon.',
    'without hibernation the warning says the computer will suspend');
  await setBattery({Percentage: 4});
  await eventually(() => calls().includes('Suspend'), 'at 4% the computer suspends');
  await setBattery(CHARGING);
  await eventually(() => !notice('Battery almost empty'), 'plugging in withdraws the warning');
}

async function checkHibernation(calls: () => string[]) {
  await canHibernate('yes');
  await setBattery({Percentage: 16, ...DRAINING});
  await setBattery({Percentage: 15});
  const low = await eventually(() => notice('Battery low'), 'the first warning comes at 15%');
  require(low.body === '15% left.', 'right after unplugging the warning leaves out the estimate');
  await setBattery({Percentage: 7});
  const critical = await eventually(() => notice('Battery almost empty'), 'the critical warning comes at 7%');
  require(critical.body === '7% left. Plug in now, or the computer will hibernate soon.', 'the warning says the computer will hibernate');
  await setBattery({Percentage: 4});
  await eventually(() => calls().includes('Hibernate'), 'at 4% the computer hibernates when it can');
  require(!calls().includes('Suspend'), 'it hibernates instead of suspending');
  await setBattery(CHARGING);
  await eventually(() => !notice('Battery almost empty'), 'plugging in withdraws the warning');
}

export const timeout = 180000;

export async function run() {
  const power = new Gio.Settings({schema_id: 'com.lantharos.kestrel.power'});
  const calls = callLog();
  try {
    await checkPowerSaver(calls);
    power.set_boolean('power-saver-profile-on-low-battery', false);
    await checkWarnings(callLog());
    await checkHibernation(callLog());
  } finally {
    power.reset('power-saver-profile-on-low-battery');
    await canHibernate('na');
    await resetBattery();
  }
}
