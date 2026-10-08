import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {call, property, subscribe} from '../lib/dbus.js';
import {moveBy} from '../lib/input.js';
import {stop} from '../lib/processes.js';
import {startSessionClient} from './lib/sessionClient.js';

const {require, eventually} = checks('session');
const MANAGER = 'org.gnome.SessionManager';
const MANAGER_PATH = '/org/gnome/SessionManager';
const IDLE = 8;
const AVAILABLE = 0;
const IDLE_STATUS = 3;
const NO_CONFIRMATION = 1;
const CLIENT_QUERY_TIMEOUT = 1000;

const manager = (method, parameters = null, replyType = null) => call(MANAGER, MANAGER_PATH, MANAGER, method, parameters, replyType);
const inhibited = async () => (await manager('IsInhibited', new GLib.Variant('(u)', [IDLE]), '(b)')).deepUnpack()[0];
const presence = () => property(MANAGER, `${MANAGER_PATH}/Presence`, `${MANAGER}.Presence`, 'status');

async function checkClients(seen) {
  const app = await startSessionClient('--inhibit', '--register');
  require(await inhibited(), 'apps can keep the session awake');
  await eventually(() => seen.has('InhibitorAdded') && seen.has('ClientAdded'), 'apps can register with the session');

  const loggingOut = GLib.get_monotonic_time();
  await manager('Logout', new GLib.Variant('(u)', [NO_CONFIRMATION]));
  await eventually(() => seen.has('SessionOver'), 'logging out ends the session');
  require(seen.get('SessionOver') - loggingOut < CLIENT_QUERY_TIMEOUT * 1000, 'logging out asks running apps first and moves on once they answer');

  await stop(app);
  await eventually(async () => !await inhibited() && seen.has('InhibitorRemoved') && seen.has('ClientRemoved'), 'apps that quit release the session');

  const player = await startSessionClient('--screensaver');
  require(await inhibited(), 'apps using the freedesktop screen saver interface keep the session awake');
  await stop(player);
  await eventually(async () => !await inhibited(), 'the screen saver request ends with the app');
}

async function checkConfirmation() {
  await manager('Logout', new GLib.Variant('(u)', [0]));
  await eventually(() => Main.modalCount > 0, 'logging out asks for confirmation');
  await call(Gio.DBus.session.get_unique_name(), `${MANAGER_PATH}/EndSessionDialog`, `${MANAGER}.EndSessionDialog`, 'Close');
  await eventually(() => Main.modalCount === 0, 'cancelling keeps the session running');
}

async function checkIdle() {
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  const screensaver = new Gio.Settings({schema_id: 'org.gnome.desktop.screensaver'});
  const lockEnabled = screensaver.get_boolean('lock-enabled');
  screensaver.set_boolean('lock-enabled', false);
  try {
    moveBy(5, 5);
    session.set_uint('idle-delay', 1);
    await eventually(async () => await presence() === IDLE_STATUS, 'the session goes idle when nobody is using it', 3000);
    moveBy(5, 5);
    await eventually(async () => await presence() === AVAILABLE, 'using the computer again wakes the session');
  } finally {
    session.reset('idle-delay');
    screensaver.set_boolean('lock-enabled', lockEnabled);
  }
}

export async function run() {
  const [running] = (await manager('IsSessionRunning', null, '(b)')).deepUnpack();
  require(running && await property(MANAGER, MANAGER_PATH, MANAGER, 'SessionName') === 'kestrel', 'Kestrel runs the session itself');

  const seen = new Map();
  const unsubscribe = subscribe({sender: MANAGER, iface: MANAGER, path: MANAGER_PATH}, signal => seen.set(signal, GLib.get_monotonic_time()));
  try {
    await checkClients(seen);
  } finally {
    unsubscribe();
  }
  await checkConfirmation();
  await checkIdle();
}
