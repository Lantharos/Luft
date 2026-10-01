import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { call, checker, clicker, descendants, labelled, portalDialog, requestHandle, sessionHandle } from './backend.js';

Gio._promisify(Gio.DBusConnection.prototype, 'call_with_unix_fd_list');

const require = checker('sharing');
const APP = 'discord';
const MONITOR = 1;
const WINDOW = 2;
const EMBEDDED_CURSOR = 2;
const PERSIST_UNTIL_REVOKED = 2;
const KEYBOARD_AND_POINTER = 3;

const u = value => new GLib.Variant('u', value);
const privacyButton = () => descendants(global.stage).find(actor => actor.name === 'kestrel-privacy');
const rows = root => descendants(root).filter(actor => actor.has_style_class_name?.('kestrel-portal-row'));
const sourceRows = () => rows(descendants(portalDialog()).find(actor => actor.has_style_class_name?.('kestrel-portal-scroll')));

function createSession(iface, session) {
  return call(iface, 'CreateSession', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, {}]), '(ua{sv})')
    .then(reply => reply.recursiveUnpack()[0]);
}

function selectSources(session, options) {
  return call('ScreenCast', 'SelectSources', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, options]), '(ua{sv})')
    .then(reply => reply.recursiveUnpack()[0]);
}

function start(iface, session, options = {}) {
  return call(iface, 'Start', new GLib.Variant('(oossa{sv})', [requestHandle(), session, APP, '', options]), '(ua{sv})');
}

function closeSession(session) {
  return Gio.DBus.session.call('org.freedesktop.impl.portal.desktop.kestrel', session, 'org.freedesktop.impl.portal.Session', 'Close',
    null, null, Gio.DBusCallFlags.NONE, -1, null);
}

function sessionClosed(session) {
  return new Promise(resolve => {
    const id = Gio.DBus.session.signal_subscribe(null, 'org.freedesktop.impl.portal.Session', 'Closed', session, null, Gio.DBusSignalFlags.NONE, () => {
      Gio.DBus.session.signal_unsubscribe(id);
      resolve(true);
    });
  });
}

function nextRemoteAccess() {
  const controller = global.backend.get_remote_access_controller();
  return new Promise(resolve => {
    const id = controller.connect('new-handle', (_controller, handle) => {
      controller.disconnect(id);
      resolve(handle);
    });
  });
}

async function checkScreenCast({pause, capture, output, click}) {
  const session = sessionHandle();
  require(await createSession('ScreenCast', session) === 0, 'apps can ask to share the screen');
  require(await selectSources(session, {
    types: u(MONITOR | WINDOW), cursor_mode: u(EMBEDDED_CURSOR), persist_mode: u(PERSIST_UNTIL_REVOKED),
  }) === 0, 'apps can ask for screens and windows');
  const started = start('ScreenCast', session);
  await pause(800);
  require(!!portalDialog(), 'sharing the screen asks which screen or window to share');
  await capture(`${output}/portal-screencast.png`);
  await click(sourceRows()[0]);
  await click(labelled(portalDialog(), 'Share'));
  const reply = await started;
  const [response, results] = reply.recursiveUnpack();
  const [[node, stream]] = results.streams;
  require(response === 0 && results.streams.length === 1 && node > 0 && stream.source_type === MONITOR && stream.size?.length === 2,
    'apps get a live stream of the screen you picked');
  await pause(300);
  require(privacyButton().visible, 'the privacy indicator shows that the screen is shared');
  await closeSession(session);
  await pause(500);
  require(!privacyButton().visible, 'closing the session stops sharing the screen');
  return reply.deepUnpack()[1].restore_data;
}

async function checkRestore({pause}, restoreData) {
  const session = sessionHandle();
  await createSession('ScreenCast', session);
  await selectSources(session, {
    types: u(MONITOR | WINDOW), persist_mode: u(PERSIST_UNTIL_REVOKED),
    restore_data: restoreData,
  });
  const handle = nextRemoteAccess();
  const [response, results] = (await start('ScreenCast', session)).recursiveUnpack();
  require(response === 0 && !portalDialog() && results.streams.length === 1 && !!results.restore_data,
    'apps that asked to remember the choice share again without asking');
  const closed = sessionClosed(session);
  (await handle).stop();
  require(await Promise.race([closed, pause(2000).then(() => false)]), 'stopping the share from the panel ends the app\'s session');
  await pause(300);
  require(!privacyButton().visible, 'the privacy indicator goes away once sharing stops');
}

async function checkRemoteDesktop({pause, capture, output, click}) {
  const session = sessionHandle();
  require(await createSession('RemoteDesktop', session) === 0, 'apps can ask to control the computer');
  await call('RemoteDesktop', 'SelectDevices', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, {types: u(KEYBOARD_AND_POINTER)}]), '(ua{sv})');
  await selectSources(session, {types: u(MONITOR)});
  await call('Clipboard', 'RequestClipboard', new GLib.Variant('(oa{sv})', [session, {}]), null);
  const started = start('RemoteDesktop', session);
  await pause(800);
  require(!!portalDialog(), 'remote control asks which devices and screens to share');
  await capture(`${output}/portal-remote-desktop.png`);
  await click(sourceRows()[0]);
  await click(labelled(portalDialog(), 'Allow'));
  const [response, results] = (await started).recursiveUnpack();
  require(response === 0 && results.devices === KEYBOARD_AND_POINTER && results.clipboard_enabled && results.streams.length === 1,
    'remote control gets the keyboard, pointer, clipboard and screen you allowed');
  const [, fds] = await Gio.DBus.session.call_with_unix_fd_list('org.freedesktop.impl.portal.desktop.kestrel', '/org/freedesktop/portal/desktop',
    'org.freedesktop.impl.portal.RemoteDesktop', 'ConnectToEIS', new GLib.Variant('(osa{sv})', [session, APP, {}]), new GLib.VariantType('(h)'),
    Gio.DBusCallFlags.NONE, -1, null, null);
  require(fds?.get_length() === 1, 'remote control apps can connect for input events');
  await closeSession(session);
  await pause(500);
  require(!privacyButton().visible, 'closing remote control stops sharing the screen');
}

async function checkInputCapture({pause, click}) {
  const session = sessionHandle();
  await call('InputCapture', 'CreateSession2', new GLib.Variant('(osa{sv})', [session, APP, {}]), '(a{sv})');
  const started = start('InputCapture', session, {capabilities: u(KEYBOARD_AND_POINTER)});
  await pause(800);
  require(!!portalDialog(), 'capturing input asks first');
  await click(labelled(portalDialog(), 'Allow'));
  const [response, results] = (await started).recursiveUnpack();
  require(response === 0 && results.capabilities === KEYBOARD_AND_POINTER, 'apps can capture the keyboard and pointer once allowed');
  const [zonesResponse, zones] = (await call('InputCapture', 'GetZones', new GLib.Variant('(oosa{sv})', [requestHandle(), session, APP, {}]), '(ua{sv})'))
    .recursiveUnpack();
  require(zonesResponse === 0 && zones.zones.length > 0, 'input capture apps see the screen edges');
  await closeSession(session);
}

export async function checkSharing({pause, capture, output, pointer}) {
  const context = {pause, capture, output, click: clicker(pointer, pause)};
  const restoreData = await checkScreenCast(context);
  await checkRestore(context, restoreData);
  await checkRemoteDesktop(context);
  await checkInputCapture(context);
}
