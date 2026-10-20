import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, labelled, named, shown, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, press} from '../lib/input.js';
import {LuftApp} from '../lib/luftApp.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {darkened, lock, unlock} from '../lockScreen/lib/shield.js';
import {fold, tap} from './lib/touch.js';

const {require, eventually} = checks('on-screen keyboard');
const ROVER_SEARCH = [142, 32];

const keyboard = () => Main.keyboard.keyboardActor;
const settledKeyboard = () => !keyboard()?.get_transition('translation-y') && !keyboard()?.get_transition('opacity');
const keyboardShown = () => Main.keyboard.visible && settledKeyboard();
const keyboardHidden = () => !Main.keyboard.visible && settledKeyboard();
const keyboardTop = () => keyboard().get_transformed_extents().get_y();
const bottomOf = actor => actor.get_transformed_extents().get_y() + actor.get_transformed_extents().get_height();
const caret = () => Main.inputMethod.caret;
const password = () => shownStyled('login-dialog-prompt-entry');
const screenCenter = () => {
  const {x, y, width, height} = Main.layoutManager.primaryMonitor;
  return [x + width / 2, y + height / 2];
};
const layer = actor => Main.layoutManager.uiGroup.get_children().indexOf(actor);
const keyboardLayer = () => layer(Main.layoutManager.keyboardBox.get_parent());
const coversPoint = ([x, y]) => keyboard().contains(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y));
const intoCaret = ({x, y, height}) => [x + 8, y + height / 2];

async function tapsOpen(label, point) {
  await tap(point);
  await eventually(keyboardShown, `tapping ${label} shows the on-screen keyboard`);
}

async function hide(label, act) {
  await act();
  await eventually(keyboardHidden, `the on-screen keyboard hides when ${label}`);
}

async function checkGtk() {
  const app = gjs('clients/window.js', ['--form']);
  try {
    await waitForWindow('Kestrel window check');
    await settled();
    await eventually(caret, 'the GTK field reports where its caret is');
    const field = caret();
    await tapsOpen('a GTK 4 field', intoCaret(field));
    require(field.y + field.height <= keyboardTop(), 'the GTK field stays above the keyboard');
    await capture('tablet-keyboard-gtk');
    await hide('focus moves from the GTK field to a button', () => press(Clutter.KEY_Tab));
  } finally {
    await stop(app);
  }
}

async function checkToolkit(window, start, clientType) {
  const before = new Set(global.get_window_actors().map(actor => actor.meta_window));
  const process = start();
  try {
    const opened = await waitForWindow(candidate => !before.has(candidate) && /^Kestrel (window check|entry)/.test(candidate.get_title() ?? ''),
      `${window} opens with a text field`);
    require(opened.get_client_type() === clientType, `${window} runs as the expected kind of client`);
    await settled();
    await eventually(caret, `the field in ${window} reports where its caret is`);
    await tapsOpen(`the field in ${window}`, intoCaret(caret()));
    await hide(`${window} closes`, () => stop(process));
  } finally {
    await stop(process);
  }
}

async function checkSabine() {
  const rover = new LuftApp('rover');
  try {
    await rover.open();
    await settled();
    await tapsOpen('the search field of a Sabine app', rover.at(ROVER_SEARCH));
    await capture('tablet-keyboard-sabine');
    await hide('the Sabine app closes', () => rover.close());
  } finally {
    await rover.close();
  }
}

async function checkStart() {
  toggleSurface('start');
  const start = named('kestrel-start');
  await eventually(() => shown(start), 'Start opens');
  const search = descendants(start).find(actor => actor instanceof St.Entry);
  await tapsOpen('the search in Start', centerOf(search));
  await settled();

  require(coversPoint(centerOf(keyboard())), 'the on-screen keyboard sits above Start');
  require(bottomOf(search) <= keyboardTop(), 'the Start search stays visible above the keyboard');
  require(bottomOf(start) <= keyboardTop(), 'Start makes room for the keyboard');
  await tap(centerOf(labelled('q', keyboard())));
  await eventually(() => search.get_text() === 'q', 'typing on the on-screen keyboard writes into the Start search');
  require(search.clutter_text.has_key_focus() && keyboardShown(), 'the Start search keeps focus while the keyboard types');
  await capture('tablet-keyboard-start');

  await hide('Start closes', () => toggleSurface('start'));
  await eventually(() => !shown(start), 'Start closes');
}

async function checkLayers() {
  for (const [surface, label] of [['quick', 'Quick Settings'], ['notifications', 'the notification center']]) {
    toggleSurface(surface);
    await settled();
    require(layer(named('kestrel-surfaces')) < keyboardLayer(), `the on-screen keyboard stays above ${label}`);
    toggleSurface(surface);
    await settled();
  }
  require(layer(Main.layoutManager.modalDialogGroup) < keyboardLayer() && layer(Main.layoutManager.screenShieldGroup) < keyboardLayer(),
    'the on-screen keyboard stays above system dialogs and the lock screen');
}

async function checkLockScreen() {
  await lock();
  try {
    await tap(screenCenter());
    await eventually(() => !darkened(), 'a tap wakes the lock screen');
    await settled();
    await tap(screenCenter());
    await eventually(() => password()?.clutter_text.has_key_focus(), 'a tap on the lock screen asks for the password');
    await eventually(keyboardShown, 'the password field brings up the on-screen keyboard');
    require(coversPoint(centerOf(keyboard())), 'the on-screen keyboard sits above the lock screen');
    await eventually(() => bottomOf(password()) <= keyboardTop(), 'the password field moves above the keyboard');
    await capture('tablet-keyboard-lock-screen');
  } finally {
    await unlock();
  }
  await eventually(keyboardHidden, 'the on-screen keyboard hides once the screen unlocks');
}

export async function run() {
  await settled();
  await fold(true);
  try {
    await checkGtk();
    await checkToolkit('a GTK 3 window', () => gjs('clients/entries/gtk3Entry.js'), Meta.WindowClientType.WAYLAND);
    await checkToolkit('an Xwayland window', () => gjs('clients/window.js', ['--entry'], {env: {GDK_BACKEND: 'x11', GTK_IM_MODULE: 'ibus'}}),
      Meta.WindowClientType.X11);
    await checkStart();
    await checkLayers();
    await checkLockScreen();
    await checkSabine();
  } finally {
    await fold(false);
  }
}
