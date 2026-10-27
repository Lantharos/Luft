import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import St from 'gi://St';

import {existing, firstStyled, labelled, ofType, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {subscribe} from '../lib/dbus.js';
import {click} from '../lib/input/input.js';
import {BACKEND, call, PORTAL_PATH, portalDialog, requestHandle, sessionHandle} from '../lib/access/portal.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');

const {require, eventually} = checks('sharing');
const APP = 'discord';
const MONITOR = 1;
const WINDOW = 2;
const EMBEDDED_CURSOR = 2;
const PERSIST_UNTIL_REVOKED = 2;
const KEYBOARD_AND_POINTER = 3;

type Streams = [number, {source_type: number; size?: number[]}][];

const u = (value: number) => new GLib.Variant('u', value);
const privacyButton = () => existing('kestrel-privacy');

async function pickFirstSource(accept: string) {
  await settled();
  const dialog = ofType(portalDialog(), St.Widget);
  const source = ofType(styled('kestrel-portal-row', ofType(firstStyled('kestrel-portal-scroll', dialog), St.Widget))[0], St.Button);
  click(source);
  await eventually(() => source.checked, 'the first source can be picked');
  click(ofType(labelled(accept, dialog), Clutter.Actor));
}

function createSession(iface: string, session: string) {
  return call(iface, 'CreateSession', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, {}]), '(ua{sv})')
    .then(reply => reply.recursiveUnpack()[0]);
}

function selectSources(session: string, options: Record<string, GLib.Variant>) {
  return call('ScreenCast', 'SelectSources', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, options]), '(ua{sv})')
    .then(reply => reply.recursiveUnpack()[0]);
}

function start(iface: string, session: string, options: Record<string, GLib.Variant> = {}) {
  return call(iface, 'Start', new GLib.Variant('(oossa{sv})', [requestHandle(), session, APP, '', options]), '(ua{sv})');
}

const closeSession = (session: string) => call('Session', 'Close', null, null, session);


function nextRemoteAccess() {
  const controller = global.backend.get_remote_access_controller();
  return new Promise<Meta.RemoteAccessHandle>(resolve => {
    const id = controller.connect('new-handle', (_controller, handle) => {
      controller.disconnect(id);
      resolve(handle);
    });
  });
}

async function checkScreenCast() {
  const session = sessionHandle();
  require(await createSession('ScreenCast', session) === 0, 'apps can ask to share the screen');
  require(await selectSources(session, {
    types: u(MONITOR | WINDOW), cursor_mode: u(EMBEDDED_CURSOR), persist_mode: u(PERSIST_UNTIL_REVOKED),
  }) === 0, 'apps can ask for screens and windows');
  const started = start('ScreenCast', session);
  await eventually(() => portalDialog(), 'sharing the screen asks which screen or window to share');
  await capture('portal-screencast');
  await pickFirstSource('Share');
  const reply = await started;
  const [response, results] = reply.recursiveUnpack<[number, {streams: Streams}]>();
  const [[node, stream]] = results.streams;
  require(response === 0 && results.streams.length === 1 && node > 0 && stream.source_type === MONITOR && stream.size?.length === 2,
    'apps get a live stream of the screen you picked');
  await eventually(() => privacyButton().visible, 'the privacy indicator shows that the screen is shared');
  await closeSession(session);
  await eventually(() => !privacyButton().visible, 'closing the session stops sharing the screen');
  return reply.deepUnpack()[1].restore_data;
}

async function checkRestore(restoreData: GLib.Variant) {
  const session = sessionHandle();
  await createSession('ScreenCast', session);
  await selectSources(session, {types: u(MONITOR | WINDOW), persist_mode: u(PERSIST_UNTIL_REVOKED), restore_data: restoreData});
  const handle = nextRemoteAccess();
  const [response, results] = (await start('ScreenCast', session)).recursiveUnpack<[number, {streams: Streams; restore_data?: unknown}]>();
  require(response === 0 && !portalDialog() && results.streams.length === 1 && !!results.restore_data,
    'apps that asked to remember the choice share again without asking');
  let closed = false;
  const unsubscribe = subscribe({iface: 'org.freedesktop.impl.portal.Session', member: 'Closed', path: session}, () => (closed = true));
  try {
    (await handle).stop();
    await eventually(() => closed, 'stopping the share from the panel ends the app\'s session');
  } finally {
    unsubscribe();
  }
  await eventually(() => !privacyButton().visible, 'the privacy indicator goes away once sharing stops');
}

async function checkRemoteDesktop() {
  const session = sessionHandle();
  require(await createSession('RemoteDesktop', session) === 0, 'apps can ask to control the computer');
  await call('RemoteDesktop', 'SelectDevices', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, {types: u(KEYBOARD_AND_POINTER)}]), '(ua{sv})');
  await selectSources(session, {types: u(MONITOR)});
  await call('Clipboard', 'RequestClipboard', new GLib.Variant('(oa{sv})', [session, {}]), null);
  const started = start('RemoteDesktop', session);
  await eventually(() => portalDialog(), 'remote control asks which devices and screens to share');
  await capture('portal-remote-desktop');
  await pickFirstSource('Allow');
  const [response, results] = (await started).recursiveUnpack<[number, {devices: number; clipboard_enabled: boolean; streams: Streams}]>();
  require(response === 0 && results.devices === KEYBOARD_AND_POINTER && results.clipboard_enabled && results.streams.length === 1,
    'remote control gets the keyboard, pointer, clipboard and screen you allowed');
  const [, fds] = await Gio.DBus.session.call_with_unix_fd_list(BACKEND, PORTAL_PATH, 'org.freedesktop.impl.portal.RemoteDesktop', 'ConnectToEIS',
    new GLib.Variant('(osa{sv})', [session, APP, {}]), new GLib.VariantType('(h)'), Gio.DBusCallFlags.NONE, -1, null, null);
  require(fds?.get_length() === 1, 'remote control apps can connect for input events');
  await closeSession(session);
  await eventually(() => !privacyButton().visible, 'closing remote control stops sharing the screen');
}

async function checkInputCapture() {
  const session = sessionHandle();
  await call('InputCapture', 'CreateSession2', new GLib.Variant('(osa{sv})', [session, APP, {}]), '(a{sv})');
  const started = start('InputCapture', session, {capabilities: u(KEYBOARD_AND_POINTER)});
  await eventually(() => portalDialog(), 'capturing input asks first');
  await settled();
  click(ofType(labelled('Allow', ofType(portalDialog(), St.Widget)), Clutter.Actor));
  const [response, results] = (await started).recursiveUnpack<[number, {capabilities: number}]>();
  require(response === 0 && results.capabilities === KEYBOARD_AND_POINTER, 'apps can capture the keyboard and pointer once allowed');
  const [zonesResponse, zones] = (await call('InputCapture', 'GetZones', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, {}]), '(ua{sv})'))
    .recursiveUnpack<[number, {zones: unknown[]}]>();
  require(zonesResponse === 0 && zones.zones.length > 0, 'input capture apps see the screen edges');
  await closeSession(session);
}

export async function run() {
  const restoreData = await checkScreenCast();
  await checkRestore(restoreData);
  await checkRemoteDesktop();
  await checkInputCapture();
}
