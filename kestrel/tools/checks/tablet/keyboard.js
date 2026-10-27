import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import {toggleSurface, Main, getInputSourceManager} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, labelled, named, shown, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {inputMethodSettled} from '../lib/input/inputMethod.js';
import {centerOf, hold, press, release} from '../lib/input/input.js';
import {LuftApp} from '../lib/apps/luftApp.js';
import {fixture, gjs, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {darkened, lock, unlock} from '../lockScreen/lib/shield.js';
import {fold, tap} from './lib/touch.js';

const {require, eventually} = checks('on-screen keyboard');
const ROVER_SEARCH = [142, 32];
const BROWSER_OPEN_TIMEOUT = 60000;
const WORD = 'luft';
const SERBIAN = new GLib.Variant('a(ss)', [['xkb', 'rs+latin'], ['xkb', 'rs']]);

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
  const app = gjs('clients/windows/window.js', ['--form']);
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

async function typeOnKeyboard(word) {
  for (const letter of word) {
    await tap(centerOf(labelled(letter, keyboard())));
    await settled();
  }
}

async function checkChromium(label, argv, clientType, env = {}) {
  const page = `file://${fixture('pages', 'entry.html')}`;
  const process = spawn([...argv, page], {env: {TMPDIR: scratch(), ...env}});
  try {
    const window = await waitForWindow(candidate => candidate.get_title()?.startsWith('Kestrel field'), `${label} opens the page`, BROWSER_OPEN_TIMEOUT);
    require(window.get_client_type() === clientType, `${label} runs as the expected kind of client`);
    window.maximize();
    await settled();
    await tapsOpen(`a field in ${label}`, centerOf(window.get_compositor_private()));
    await typeOnKeyboard(WORD);
    await eventually(() => window.get_title().startsWith(`Kestrel typed: ${WORD}`), `typing on the on-screen keyboard writes into the field in ${label}`);
    await capture(`tablet-keyboard-${label.replace(/\W+/g, '-').toLowerCase()}`);
    await hide(`${label} closes`, () => stop(process));
  } finally {
    await stop(process);
  }
}

async function checkChromiumApps() {
  const chromium = ['--no-first-run', '--no-default-browser-check', '--password-store=basic'];
  const helium = GLib.getenv('KESTREL_HELIUM');
  if (helium) {
    await checkChromium('Helium', [helium, `--user-data-dir=${scratch('kestrel-helium')}`, ...chromium], Meta.WindowClientType.WAYLAND, {APPIMAGE_EXTRACT_AND_RUN: '1'});
    await checkChromium('Helium on Xwayland', [helium, `--user-data-dir=${scratch('kestrel-helium-x11')}`, '--ozone-platform=x11', ...chromium], Meta.WindowClientType.X11, {APPIMAGE_EXTRACT_AND_RUN: '1'});
  } else {
    console.log('Kestrel on-screen keyboard: Helium skipped without KESTREL_HELIUM');
  }
  const electron = GLib.getenv('KESTREL_ELECTRON');
  if (electron) {
    await checkChromium('Electron', [electron, `--user-data-dir=${scratch('kestrel-electron')}`], Meta.WindowClientType.WAYLAND);
    await checkChromium('Electron on Xwayland', [electron, `--user-data-dir=${scratch('kestrel-electron-x11')}`, '--ozone-platform=x11'], Meta.WindowClientType.X11);
  } else {
    console.log('Kestrel on-screen keyboard: Electron skipped without KESTREL_ELECTRON');
  }
}

const showsLatin = () => labelled('q', keyboard()) && !labelled('љ', keyboard());
const showsCyrillic = () => labelled('љ', keyboard()) && !labelled('q', keyboard());

function switchInputSource() {
  hold(Clutter.KEY_Super_L);
  press(Clutter.KEY_space);
  release(Clutter.KEY_Super_L);
}

async function checkLayouts() {
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const saved = {sources: settings.get_value('sources'), mru: settings.get_value('mru-sources')};
  await eventually(inputMethodSettled, 'IBus has settled and can switch input sources', 15000);
  try {
    settings.set_value('mru-sources', SERBIAN);
    settings.set_value('sources', SERBIAN);
    const manager = getInputSourceManager();
    const latin = await waitUntil(() => Object.values(manager.inputSources).find(source => source.id === 'rs+latin'), 'Kestrel offers Serbian Latin');
    if (manager.currentSource !== latin) latin.activate(true);
    await eventually(showsLatin, 'the on-screen keyboard shows Latin letters while Serbian Latin is the input source');
    switchInputSource();
    await eventually(showsCyrillic, 'the on-screen keyboard switches to Cyrillic with the input source');
    switchInputSource();
    await eventually(showsLatin, 'the on-screen keyboard switches back to Latin with the input source');
  } finally {
    settings.set_value('sources', saved.sources);
    settings.set_value('mru-sources', saved.mru);
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
    await checkToolkit('an Xwayland window', () => gjs('clients/windows/window.js', ['--entry'], {env: {GDK_BACKEND: 'x11', GTK_IM_MODULE: 'ibus'}}),
      Meta.WindowClientType.X11);
    await checkStart();
    await checkLayers();
    await checkLockScreen();
    await checkSabine();
    await checkLayouts();
    await checkChromiumApps();
  } finally {
    await fold(false);
  }
}
