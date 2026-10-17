import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {unlock} from '../lockScreen/lib/shield.js';
import {bestTitle, closeStart, descriptionOf, entry, openStart, row, rows, search, start, titleOf, withHandler} from './search/results.js';

const {require, eventually} = checks('Start search');
const LINK_SCHEME = 'x-scheme-handler/kestrel-settings';
const END_SESSION = ['org.gnome.Shell', '/org/gnome/SessionManager/EndSessionDialog', 'org.gnome.SessionManager.EndSessionDialog'];
const CALCULATIONS = [['2*(3+18)', '= 42', '42'], ['15% of 80', '= 12', '12'], ['80 + 15%', '= 92', '92'], ['(1+2)^3', '= 27', '27'], ['sqrt(16) + 2', '= 6', '6']];
const CONVERSIONS = [['10 km to mi', '= 6.21371 mi'], ['100 f', '= 37.7778 °C'], ['5 kg in lb', '= 11.0231 lb'], ['2 h', '= 120 min'], ['1.5 gb to mb', '= 1,500 MB'], ['3 gib in gb', '= 3.22123 GB']];

const clipboard = () => new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_, text) => resolve(text)));
const tile = title => styled('kestrel-control', named('kestrel-quick-settings')).find(control => control.title === title);

async function checkKeyboard() {
  search('');
  press(Clutter.KEY_Down);
  await eventually(() => global.stage.get_key_focus() instanceof St.Button, 'Down in search focuses an app');
  press(Clutter.KEY_Tab);
  await eventually(() => start().contains(global.stage.get_key_focus()), 'Tab stays in Start');
  entry().grab_key_focus();
}

async function checkCalculator() {
  for (const [expression, title, copied] of CALCULATIONS) {
    search(expression);
    await eventually(() => bestTitle() === title, `search works out ${expression}`);
    if (expression === CALCULATIONS[0][0]) await capture('search-calculator');
    if (copied !== CALCULATIONS[1][2]) continue;
    press(Clutter.KEY_Return);
    await eventually(async () => await clipboard() === copied, 'Enter copies the result');
    await openStart();
  }
  for (const [conversion, title] of CONVERSIONS) {
    search(conversion);
    await eventually(() => bestTitle() === title, `search converts ${conversion}`);
  }
  await capture('search-units');
  search('10 km to');
  require(bestTitle() === '= 6.21371 mi', 'a conversion stays while the target unit is typed');
}

async function checkSettings() {
  search('night light');
  await eventually(() => row('setting:display'), 'a keyword finds its Settings page');
  search('fonts');
  await eventually(() => row('setting:appearance/fonts') && descriptionOf(row('setting:appearance/fonts')) === 'Appearance settings',
    'search finds Settings sections and names their page');
  await capture('search-settings');
  await withHandler(LINK_SCHEME, 'Settings Link Check', async opened => {
    row('setting:appearance/fonts').emit('clicked', 1);
    await eventually(() => opened().includes('kestrel-settings:appearance/fonts'), 'a Settings result opens its exact page');
  });
  await openStart();
}

async function activate(key) {
  if (rows()[0] === row(key)) press(Clutter.KEY_Return);
  else row(key).emit('clicked', 1);
  await eventually(() => !start().visible, 'an action closes Start');
  await openStart();
}

async function checkToggles() {
  const style = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const notifications = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
  const scheme = style.get_string('color-scheme');
  try {
    style.set_string('color-scheme', 'default');
    search('dark mode');
    await eventually(() => titleOf(rows()[0]) === 'Switch to dark style', 'natural words find the dark style action first');
    await capture('search-actions');
    await activate('action:dark-style');
    await eventually(() => style.get_string('color-scheme') === 'prefer-dark', 'the dark style action switches to dark');
    search('light mode');
    await eventually(() => row('action:dark-style') && titleOf(row('action:dark-style')) === 'Switch to light style', 'the action says what it will do');
    await activate('action:dark-style');
    await eventually(() => style.get_string('color-scheme') === 'default', 'the light style action switches back');

    search('dnd');
    await eventually(() => row('action:do-not-disturb'), 'do not disturb is found by its short name');
    await activate('action:do-not-disturb');
    await eventually(() => !notifications.get_boolean('show-banners'), 'the do not disturb action silences banners');
    search('do not disturb');
    await eventually(() => titleOf(row('action:do-not-disturb')) === 'Turn off Do Not Disturb', 'do not disturb offers to turn itself off');
    await activate('action:do-not-disturb');
    await eventually(() => notifications.get_boolean('show-banners'), 'banners come back');
  } finally {
    style.set_string('color-scheme', scheme);
    notifications.reset('show-banners');
  }
  for (const [title, query, key] of [['Night Light', 'night light', 'action:night-light'], ['Wi-Fi', 'wifi off', 'action:wifi']]) {
    search(query);
    const control = tile(title);
    if (control?.visible) await eventually(() => row(key)?.mapped, `${query} offers the ${title} toggle`);
    else require(!row(key), `${query} offers nothing without ${title}`);
  }
}

async function checkSession() {
  search('reboot');
  await eventually(() => row('action:can-restart') && titleOf(row('action:can-restart')) === 'Restart', 'reboot finds Restart');
  search('shut down');
  await eventually(() => row('action:can-power-off'), 'shut down finds Power off');

  search('lock');
  await eventually(() => row('action:can-lock-screen'), 'lock finds the lock action');
  row('action:can-lock-screen').emit('clicked', 1);
  await eventually(() => Main.screenShield.locked, 'the lock action locks the screen');
  await unlock();

  await openStart();
  const shell = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  shell.set_boolean('always-show-log-out', true);
  search('sign out');
  await eventually(() => row('action:can-logout') && titleOf(row('action:can-logout')) === 'Log out', 'sign out finds Log out');
  row('action:can-logout').emit('clicked', 1);
  try {
    await eventually(() => Main.modalCount > 0, 'logging out from search still asks first');
  } finally {
    await call(...END_SESSION, 'Close').catch(() => {});
    shell.reset('always-show-log-out');
  }
  await eventually(() => Main.modalCount === 0, 'cancelling keeps the session running');
}

async function checkStability() {
  const titles = [];
  const signal = global.stage.connect('after-paint', () => titles.push(rows().map(titleOf).join('|')));
  try {
    for (const text of ['s', 'se', 'set', 'sett', 'setti', 'settin', 'setting', 'settings']) {
      search(text);
      await eventually(() => rows().length > 0, `results show for ${text}`);
    }
  } finally {
    global.stage.disconnect(signal);
  }
  require(titles.every(title => title.length > 0), 'typing never paints an empty result list between matches');
}

export async function run() {
  await openStart();
  try {
    await checkKeyboard();
    await checkCalculator();
    await checkSettings();
    await checkToggles();
    await checkSession();
    await openStart();
    await checkStability();
  } finally {
    search('');
    closeStart();
  }
}
