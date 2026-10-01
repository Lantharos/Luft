import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { BACKEND, PORTAL_PATH, call, checker, clicker, descendants, labelled, portalDialog, requestHandle, sessionHandle } from './backend.js';

const require = checker('portal');
const WALLPAPER = '/usr/share/backgrounds/fedora-workstation/flight_dark.webp';

async function checkAccount({pause, capture, output, click}) {
  const shared = call('Account', 'GetUserInformation', new GLib.Variant('(ossa{sv})', [requestHandle(), 'discord', '', {
    reason: new GLib.Variant('s', 'Your name and picture are shown to the people you talk to.'),
  }]), '(ua{sv})');
  await pause(600);
  await capture(`${output}/portal-account.png`);
  await click(labelled(portalDialog(), 'Share'));
  const [response, results] = (await shared).recursiveUnpack();
  require(response === 0 && results.id === GLib.get_user_name() && 'name' in results && 'image' in results, 'apps get your name and picture once you share them');
}

async function checkUsb({pause, capture, output, click}) {
  const device = (id, model, vendor) => [id, {properties: new GLib.Variant('a{sv}', {
    ID_MODEL_FROM_DATABASE: new GLib.Variant('s', model), ID_VENDOR_FROM_DATABASE: new GLib.Variant('s', vendor),
  })}, {writable: new GLib.Variant('b', true)}];
  const acquired = call('Usb', 'AcquireDevices', new GLib.Variant('(ossa(sa{sv}a{sv})a{sv})', [requestHandle(), '', 'net.sourceforge.gscan2pdf', [
    device('dev-1', 'CanoScan LiDE 400', 'Canon, Inc.'),
    device('dev-2', 'USB2.0 Hub', 'Genesys Logic, Inc.'),
  ], {}]), '(ua{sv})');
  await pause(600);
  await capture(`${output}/portal-usb.png`);
  const rows = descendants(portalDialog()).filter(actor => actor.has_style_class_name?.('kestrel-portal-row'));
  await click(rows[1]);
  await click(labelled(portalDialog(), 'Allow'));
  const [response, results] = (await acquired).recursiveUnpack();
  require(response === 0 && results.devices.length === 1 && results.devices[0][0] === 'dev-1', 'apps only get the devices you leave selected');
}

async function checkWallpaper({pause, capture, output, click}) {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const original = ['picture-uri', 'picture-uri-dark', 'picture-options'].map(key => [key, background.get_string(key)]);
  const uri = Gio.File.new_for_path(WALLPAPER).get_uri();
  const set = preview => call('Wallpaper', 'SetWallpaperURI', new GLib.Variant('(osssa{sv})', [requestHandle(), 'com.lantharos.magpie', '', uri, {
    'show-preview': new GLib.Variant('b', preview),
  }]), '(u)').then(reply => reply.deepUnpack()[0]);
  try {
    const declined = set(true);
    await pause(1200);
    await capture(`${output}/portal-wallpaper.png`);
    await click(labelled(portalDialog(), 'Cancel'));
    require(await declined === 1 && background.get_string('picture-uri') === original[0][1], 'the wallpaper only changes once you agree');
    require(await set(false) === 0, 'apps can set the wallpaper');
    const stored = background.get_string('picture-uri');
    require(stored.startsWith(Gio.File.new_for_path(GLib.get_user_data_dir()).get_uri()) && background.get_string('picture-uri-dark') === stored,
      'the new wallpaper is kept in your own folder for light and dark style');
    Gio.File.new_for_uri(stored).delete(null);
  } finally {
    for (const [key, value] of original) background.set_string(key, value);
  }
}

async function checkLockdown({pause}) {
  const lockdown = new Gio.Settings({schema_id: 'org.gnome.desktop.lockdown'});
  const read = () => Gio.DBus.session.call(BACKEND, PORTAL_PATH, 'org.freedesktop.DBus.Properties', 'Get',
    new GLib.Variant('(ss)', ['org.freedesktop.impl.portal.Lockdown', 'disable-printing']), new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null)
    .then(reply => reply.recursiveUnpack()[0]);
  try {
    lockdown.set_boolean('disable-printing', true);
    await pause(200);
    require(await read() === true, 'apps see when printing is turned off');
  } finally {
    lockdown.reset('disable-printing');
  }
}

async function checkInhibit({pause}) {
  const inhibited = () => Gio.DBus.session.call('org.gnome.SessionManager', '/org/gnome/SessionManager', 'org.gnome.SessionManager', 'IsInhibited',
    new GLib.Variant('(u)', [8]), new GLib.VariantType('(b)'), Gio.DBusCallFlags.NONE, -1, null).then(reply => reply.deepUnpack()[0]);
  const handle = requestHandle();
  await call('Inhibit', 'Inhibit', new GLib.Variant('(ossua{sv})', [handle, 'org.gnome.Totem', '', 8, {reason: new GLib.Variant('s', 'Playing a film')}]), null);
  await pause(300);
  require(await inhibited(), 'apps can keep the screen from going idle');
  await call('Request', 'Close', null, null, handle);
  await pause(300);
  require(!await inhibited(), 'the screen can go idle again once the app lets go');

  const states = [];
  const subscription = Gio.DBus.session.signal_subscribe(BACKEND, 'org.freedesktop.impl.portal.Inhibit', 'StateChanged', PORTAL_PATH, null,
    Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => states.push(parameters.recursiveUnpack()));
  const session = sessionHandle();
  const [response] = (await call('Inhibit', 'CreateMonitor', new GLib.Variant('(ooss)', [requestHandle(), session, 'org.gnome.TextEditor', '']), '(u)')).deepUnpack();
  await pause(300);
  Gio.DBus.session.signal_unsubscribe(subscription);
  require(response === 0 && states.some(([path, state]) => path === session && state['session-state'] === 1 && state['screensaver-active'] === false),
    'apps can follow whether the session is ending');
  await call('Session', 'Close', null, null, session);
}

async function checkSharedSettings() {
  const [all] = (await call('Settings', 'ReadAll', new GLib.Variant('(as)', [['org.gnome.desktop.*', 'org.gnome.fontconfig']]), '(a{sa{sv}})')).recursiveUnpack();
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  require(all['org.gnome.desktop.interface']?.['cursor-theme'] === interfaceSettings.get_string('cursor-theme')
    && 'button-layout' in (all['org.gnome.desktop.wm.preferences'] ?? {}) && typeof all['org.gnome.fontconfig']?.serial === 'number',
  'sandboxed apps read fonts, cursor and window button settings');
}

export async function checkSystemPortals({pause, capture, output, pointer}) {
  const click = clicker(pointer, pause);
  await checkAccount({pause, capture, output, click});
  await checkUsb({pause, capture, output, click});
  await checkWallpaper({pause, capture, output, click});
  await checkLockdown({pause});
  await checkInhibit({pause});
  await checkSharedSettings();
}
