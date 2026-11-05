import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {call} from '../lib/dbus.js';
import {existing, firstStyled, labelled, named, shown, showsText} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, moveBy, press} from '../lib/input/input.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {closeStart, openStart} from '../start/search/results.js';
import {lockAndWake, lock, unlock} from '../lockScreen/lib/shield.js';
import {prepareForSleep, screenOn} from '../lockScreen/lib/sleep.js';
import {takeCalls} from './lib/systemCalls.js';

const {require, eventually} = checks('power button');
const TITLE = 'What Should This Computer Do?';
const CHOICES = ['Cancel', 'Log Out', 'Suspend', 'Restart', 'Power Off'];
const END_CALLS = ['Suspend', 'Hibernate', 'PowerOff', 'Reboot'];
const LONGER_THAN_A_COUNTDOWN_TICK = 2500;
const SCREEN_BLANK_DELAY = 3;

const asking = () => shown(Main.endSessionDialog) && showsText(TITLE, Main.endSessionDialog);
const lockMenu = () => firstStyled('kestrel-lock-menu');
const ended = () => takeCalls().filter(name => END_CALLS.includes(name));
const pressButton = () => press(Clutter.KEY_PowerOff);

function controlLogin(method: string, value: GLib.Variant) {
  return call('org.freedesktop.login1', '/com/lantharos/KestrelChecks/Login', 'com.lantharos.KestrelChecks.Login', method, value, null, {connection: Gio.DBus.system});
}

async function asked(where: string) {
  pressButton();
  await eventually(asking, `the power button asks ${where}`);
  await eventually(() => Main.modalCount > 0 && CHOICES.every(label => labelled(label, Main.endSessionDialog)), `the question offers every choice ${where}`);
}

async function dismissed() {
  press(Clutter.KEY_Escape);
  await eventually(() => !shown(Main.endSessionDialog), 'Escape cancels the question');
}

async function checkQuestion() {
  await asked('on the desktop');
  await capture('power-button-question');
  await pause(LONGER_THAN_A_COUNTDOWN_TICK);
  require(asking() && !ended().length, 'the question waits for an answer and decides nothing by itself');
  pressButton();
  await pause(500);
  require(asking() && !ended().length, 'pressing the button again keeps the same question up');
  await dismissed();
  await pause(LONGER_THAN_A_COUNTDOWN_TICK);
  require(!ended().length, 'cancelling ends nothing');
  await asked('after being cancelled');
  await settled();
  click(labelled('Suspend', Main.endSessionDialog)!);
  await eventually(() => !shown(Main.endSessionDialog) && takeCalls().includes('Suspend'), 'choosing Suspend suspends the computer');
}

async function checkOverSurfaces() {
  await openStart();
  await asked('with Start open');
  await dismissed();
  await closeStart();
}

async function checkFullscreenApp() {
  const app = gjs('clients/windows/gtk4Window.js', ['Stage', '#223344', 'keeps-shortcuts']);
  const window = await waitForWindow('Stage');
  await eventually(() => labelled('Allow'), 'the app asks to keep every shortcut');
  await settled();
  click(labelled('Allow')!);
  const [device] = global.stage.context.get_backend().get_default_seat().list_devices();
  await eventually(() => window.is_fullscreen() && window.shortcuts_inhibited(device), 'the fullscreen app keeps every shortcut');
  try {
    await asked('over a fullscreen app that keeps every shortcut');
    await dismissed();
  } finally {
    await stop(app);
  }
}

async function checkLocked() {
  await lockAndWake();
  pressButton();
  await eventually(() => {
    const menu = lockMenu();
    return shown(menu) && ['Suspend', 'Restart…', 'Power off…'].every(item => named(item, menu));
  }, 'the power button opens the power menu on the lock screen');
  await capture('power-button-locked');
  press(Clutter.KEY_Escape);
  await eventually(() => !shown(lockMenu()), 'Escape closes the power menu on the lock screen');
  require(Main.screenShield.locked && !ended().length, 'the power menu changes nothing by itself');
  pressButton();
  await eventually(() => shown(lockMenu()), 'the power button opens the power menu again');
  await settled();
  click(existing('Power off…', lockMenu()!));
  await eventually(() => shown(Main.endSessionDialog), 'powering off from the lock screen asks first');
  await capture('power-button-locked-confirmation');
  await dismissed();
  await unlock();
}

async function checkScreenOff() {
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  session.set_uint('idle-delay', SCREEN_BLANK_DELAY);
  try {
    await eventually(async () => !await screenOn(), 'the screen turns off when nobody uses the computer', (SCREEN_BLANK_DELAY + 40) * 1000);
    await lock();
    await pause(500);
    pressButton();
    await eventually(screenOn, 'the power button turns the screen back on');
    await pause(1000);
    require(!shown(lockMenu()) && !shown(Main.endSessionDialog) && !ended().length, 'waking the screen with the power button is all that press does');
  } finally {
    session.reset('idle-delay');
    moveBy(4, 4);
    if (Main.screenShield.locked) await unlock();
  }
}

async function checkRestart() {
  await asked('before restarting');
  click(labelled('Restart', Main.endSessionDialog)!);
  await eventually(() => takeCalls().includes('Reboot'), 'choosing Restart restarts the computer');
}

async function checkSleepingChoice(power: Gio.Settings) {
  power.set_string('power-button-action', 'suspend');
  pressButton();
  await eventually(() => takeCalls().includes('Suspend'), 'the power button suspends when that was chosen');
  await controlLogin('SetSleepRefused', new GLib.Variant('(b)', [true]));
  await asked('when the computer refuses to suspend');
  await dismissed();
  await controlLogin('SetSleepRefused', new GLib.Variant('(b)', [false]));
  power.set_string('power-button-action', 'nothing');
  pressButton();
  await pause(1000);
  require(!asking() && !ended().length, 'the power button does nothing when that was chosen');
}

async function checkWakePress() {
  await prepareForSleep(true);
  await prepareForSleep(false);
  await eventually(() => Main.screenShield.locked, 'the screen locks before sleeping');
  pressButton();
  await pause(1000);
  require(!shown(lockMenu()) && !asking() && !ended().length, 'the press that wakes the computer asks nothing');
  await unlock();
}

export async function run() {
  const power = new Gio.Settings({schema_id: 'com.lantharos.kestrel.power'});
  require(power.get_string('power-button-action') === 'interactive', 'a fresh install asks what the power button should do');
  takeCalls();
  await checkQuestion();
  await checkOverSurfaces();
  await checkFullscreenApp();
  await checkLocked();
  await checkScreenOff();
  await checkWakePress();
  await pause(3000);
  try {
    await checkSleepingChoice(power);
  } finally {
    power.reset('power-button-action');
  }
  await pause(500);
  await checkRestart();
}
