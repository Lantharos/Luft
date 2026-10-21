import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {firstStyled, labelled, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {subscribe} from '../lib/dbus.js';
import {click, hold, press, release} from '../lib/input/input.js';
import {call, PORTAL_PATH, portalDialog, sessionHandle} from '../lib/access/portal.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('shortcut');
const SHORTCUTS = 'GlobalShortcuts';
const REQUEST = '/org/freedesktop/portal/desktop/request/kestrel/shortcuts';
const SUCCESS = 0;
const CANCELLED = 1;

function triggers([response, results]) {
  if (response !== SUCCESS) throw new Error(`The shortcuts request ended with ${response}`);
  return Object.fromEntries(results.shortcuts.map(([id, options]) => [id, options.trigger_description ?? null]));
}

async function session(appId) {
  const handle = sessionHandle();
  await call(SHORTCUTS, 'CreateSession', new GLib.Variant('(oosa{sv})', [REQUEST, handle, appId, {}]), '(ua{sv})');
  return handle;
}

async function request(handle, requested) {
  const reply = await call(SHORTCUTS, 'BindShortcuts', new GLib.Variant('(ooa(sa{sv})sa{sv})', [REQUEST, handle, requested.map(([id, description, trigger]) =>
    [id, {description: new GLib.Variant('s', description), preferred_trigger: new GLib.Variant('s', trigger)}]), '', {}]), '(ua{sv})');
  return reply.recursiveUnpack();
}

async function bind(handle, requested) {
  return triggers(await request(handle, requested));
}

async function answer(reply, button, listed) {
  await eventually(() => portalDialog(), 'binding new shortcuts asks first');
  await settled();
  require(listed.every(text => labelled(text, portalDialog())), 'the request lists each new shortcut');
  click(labelled(button, portalDialog()));
  return reply;
}

async function checkBinding() {
  const steam = await session('steam');
  const [declined] = await answer(request(steam, [['overlay', 'Show the overlay', 'CTRL+ALT+o']]), 'Cancel', ['Show the overlay', 'Ctrl+Alt+O']);
  require(declined === CANCELLED, 'apps get no shortcuts when the request is turned down');
  await call('Session', 'Close', null, null, steam);

  const discord = await session('discord');
  const voice = triggers(await answer(request(discord, [
    ['mute', 'Toggle mute', 'CTRL+ALT+m'],
    ['deafen', 'Toggle deafen', 'LOGO+v'],
    ['talk', 'Push to talk', 'a'],
    ['copy', 'Copy the call link', 'CTRL+c'],
    ['next', 'Next channel', 'ALT+Down'],
  ]), 'Allow', ['Toggle mute', 'Ctrl+Alt+M']));
  require(voice.mute === 'Ctrl+Alt+M', 'free preferred shortcuts are given once allowed');
  require(voice.deafen === null, 'shortcuts the shell already uses are left unassigned');
  require(voice.talk === null, 'shortcuts that would swallow typing are left unassigned');
  require(voice.copy === null && voice.next === null, 'shortcuts apps use for editing and moving around are left unassigned');
  const obs = await session('com.obsproject.Studio');
  require((await bind(obs, [['mute', 'Mute desktop audio', 'CTRL+ALT+m']])).mute === null, 'apps cannot take shortcuts another app holds');
  const discordAgain = await session('discord');
  require((await bind(discordAgain, [['mute', 'Toggle mute', 'CTRL+ALT+x']])).mute === 'Ctrl+Alt+M', 'apps keep what they were given before without asking again');
  return {discord, obs, discordAgain};
}

async function checkTrigger(signals, discordHandles) {
  const reached = name => signals.some(([signal, handle, id]) => signal === name && id === 'mute' && discordHandles.includes(handle));
  hold(Clutter.KEY_Control_L, Clutter.KEY_Alt_L, Clutter.KEY_m);
  await eventually(() => reached('Activated'), 'pressing a shortcut reaches the app');
  release(Clutter.KEY_Control_L, Clutter.KEY_Alt_L, Clutter.KEY_m);
  await eventually(() => reached('Deactivated'), 'releasing it reaches the app too');
}

async function checkDialog(signals, {discord, discordAgain}) {
  await call(SHORTCUTS, 'ConfigureShortcuts', new GLib.Variant('(osa{sv})', [discordAgain, '', {}]), null);
  const keys = () => styled('kestrel-shortcut-key', firstStyled('kestrel-shortcuts-dialog'));
  await eventually(() => keys().length === 5 && keys().every(shown), 'the shortcut dialog opens');
  await settled();
  const [mute, deafen] = keys();
  require(mute.label === 'Ctrl+Alt+M' && deafen.label === 'Not set', 'the shortcut dialog lists every shortcut');
  click(deafen);
  await eventually(() => deafen.label === 'Press keys', 'choosing a shortcut starts recording it');
  press(Clutter.KEY_Super_L, Clutter.KEY_v);
  await eventually(() => deafen.label === 'Super+V is taken', 'the dialog refuses shortcuts the shell uses');
  press(Clutter.KEY_Control_L, Clutter.KEY_c);
  await eventually(() => deafen.label === 'Ctrl+C can’t be used', 'the dialog refuses shortcuts apps need for editing');
  press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_d);
  await eventually(() => deafen.label === 'Ctrl+Shift+D', 'the dialog records a new shortcut');
  await capture('shortcuts');
  click(labelled('Save', firstStyled('kestrel-shortcuts-dialog')));
  const changed = () => signals.find(([signal, handle]) => signal === 'ShortcutsChanged' && handle === discord);
  await eventually(() => changed()?.[2].find(([id]) => id === 'deafen')?.[1].trigger_description === 'Ctrl+Shift+D',
    'saved shortcuts are handed back to the app');
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  settings.reset('global-shortcuts');
  const sessions = await checkBinding();
  const signals = [];
  const unsubscribe = subscribe({iface: `org.freedesktop.impl.portal.${SHORTCUTS}`, path: PORTAL_PATH},
    (signal, parameters) => signals.push([signal, ...parameters]));
  try {
    await checkTrigger(signals, [sessions.discord, sessions.discordAgain]);
    await checkDialog(signals, sessions);
  } finally {
    unsubscribe();
    for (const handle of Object.values(sessions)) await call('Session', 'Close', null, null, handle);
    settings.reset('global-shortcuts');
  }
}
