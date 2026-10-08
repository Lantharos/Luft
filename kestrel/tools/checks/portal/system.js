import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {labelled, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property, subscribe} from '../lib/dbus.js';
import {click} from '../lib/input.js';
import {BACKEND, call, PORTAL_PATH, portalDialog, requestHandle, sessionHandle} from '../lib/portal.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('portal');
const IDLE = 8;
const PREFER_LIGHT = 2;

async function openedDialog(label) {
  await eventually(() => portalDialog(), label);
  await settled();
  return portalDialog();
}

function wallpaperFile() {
  const path = scratch('portal-wallpaper.png');
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, 1280, 720);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(0.12, 0.2, 0.16);
  context.paint();
  surface.writeToPNG(path);
  return Gio.File.new_for_path(path);
}

async function checkAppearance() {
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  const read = async () => (await call('Settings', 'ReadAll', new GLib.Variant('(as)', [['org.freedesktop.appearance']]), '(a{sa{sv}})'))
    .recursiveUnpack()[0]['org.freedesktop.appearance'];
  const accent = (await read())['accent-color'];
  require(accent?.length === 3 && accent.every(channel => channel >= 0 && channel <= 1), 'apps get the wallpaper accent color');

  const changes = [];
  const unsubscribe = subscribe({iface: 'org.freedesktop.impl.portal.Settings', member: 'SettingChanged', path: PORTAL_PATH},
    (_signal, parameters) => changes.push(parameters));
  try {
    interfaceSettings.set_string('color-scheme', 'prefer-light');
    await eventually(async () => changes.some(([, key, value]) => key === 'color-scheme' && value === PREFER_LIGHT) &&
      (await read())['color-scheme'] === PREFER_LIGHT, 'apps follow the light and dark style');
  } finally {
    interfaceSettings.set_string('color-scheme', colorScheme);
    unsubscribe();
  }
}

async function checkScreenshot() {
  const [response, results] = (await call('Screenshot', 'Screenshot',
    new GLib.Variant('(ossa{sv})', [requestHandle(), 'org.gnome.TextEditor', '', {}]), '(ua{sv})')).recursiveUnpack();
  const file = results.uri ? Gio.File.new_for_uri(results.uri) : null;
  require(response === 0 && !!file?.query_exists(null), 'apps can take a screenshot');
  file.delete(null);
}

async function checkAccount() {
  const shared = call('Account', 'GetUserInformation', new GLib.Variant('(ossa{sv})', [requestHandle(), 'discord', '', {
    reason: new GLib.Variant('s', 'Your name and picture are shown to the people you talk to.'),
  }]), '(ua{sv})');
  const dialog = await openedDialog('apps ask before they get your name and picture');
  await capture('portal-account');
  click(labelled('Share', dialog));
  const [response, results] = (await shared).recursiveUnpack();
  require(response === 0 && results.id === GLib.get_user_name() && 'name' in results && 'image' in results, 'apps get your name and picture once you share them');
}

async function checkUsb() {
  const device = (id, model, vendor) => [id, {properties: new GLib.Variant('a{sv}', {
    ID_MODEL_FROM_DATABASE: new GLib.Variant('s', model), ID_VENDOR_FROM_DATABASE: new GLib.Variant('s', vendor),
  })}, {writable: new GLib.Variant('b', true)}];
  const acquired = call('Usb', 'AcquireDevices', new GLib.Variant('(ossa(sa{sv}a{sv})a{sv})', [requestHandle(), '', 'net.sourceforge.gscan2pdf', [
    device('dev-1', 'CanoScan LiDE 400', 'Canon, Inc.'),
    device('dev-2', 'USB2.0 Hub', 'Genesys Logic, Inc.'),
  ], {}]), '(ua{sv})');
  const dialog = await openedDialog('apps ask before they get USB devices');
  await capture('portal-usb');
  const hub = styled('kestrel-portal-row', dialog)[1];
  const selected = hub.checked;
  click(hub);
  await eventually(() => hub.checked !== selected, 'devices can be left out');
  click(labelled('Allow', dialog));
  const [response, results] = (await acquired).recursiveUnpack();
  require(response === 0 && results.devices.length === 1 && results.devices[0][0] === 'dev-1', 'apps only get the devices you leave selected');
}

async function checkWallpaper() {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const original = ['picture-uri', 'picture-uri-dark', 'picture-options'].map(key => [key, background.get_string(key)]);
  const uri = wallpaperFile().get_uri();
  const set = preview => call('Wallpaper', 'SetWallpaperURI', new GLib.Variant('(osssa{sv})', [requestHandle(), 'com.lantharos.magpie', '', uri, {
    'show-preview': new GLib.Variant('b', preview),
  }]), '(u)').then(reply => reply.deepUnpack()[0]);
  try {
    const declined = set(true);
    const dialog = await openedDialog('setting the wallpaper shows a preview first');
    await capture('portal-wallpaper');
    click(labelled('Cancel', dialog));
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

async function checkLockdown() {
  const lockdown = new Gio.Settings({schema_id: 'org.gnome.desktop.lockdown'});
  try {
    lockdown.set_boolean('disable-printing', true);
    await eventually(async () => await property(BACKEND, PORTAL_PATH, 'org.freedesktop.impl.portal.Lockdown', 'disable-printing') === true,
      'apps see when printing is turned off');
  } finally {
    lockdown.reset('disable-printing');
  }
}

async function checkInhibit() {
  const inhibited = () => Gio.DBus.session.call('org.gnome.SessionManager', '/org/gnome/SessionManager', 'org.gnome.SessionManager', 'IsInhibited',
    new GLib.Variant('(u)', [IDLE]), new GLib.VariantType('(b)'), Gio.DBusCallFlags.NONE, -1, null).then(reply => reply.deepUnpack()[0]);
  const handle = requestHandle();
  await call('Inhibit', 'Inhibit', new GLib.Variant('(ossua{sv})', [handle, 'org.gnome.Totem', '', IDLE, {reason: new GLib.Variant('s', 'Playing a film')}]), null);
  await eventually(inhibited, 'apps can keep the screen from going idle');
  await call('Request', 'Close', null, null, handle);
  await eventually(async () => !await inhibited(), 'the screen can go idle again once the app lets go');

  const states = [];
  const unsubscribe = subscribe({iface: 'org.freedesktop.impl.portal.Inhibit', member: 'StateChanged', path: PORTAL_PATH},
    (_signal, parameters) => states.push(parameters));
  const session = sessionHandle();
  try {
    const [response] = (await call('Inhibit', 'CreateMonitor', new GLib.Variant('(ooss)', [requestHandle(), session, 'org.gnome.TextEditor', '']), '(u)')).deepUnpack();
    require(response === 0, 'apps can watch the session state');
    await eventually(() => states.some(([path, state]) => path === session && state['session-state'] === 1 && state['screensaver-active'] === false),
      'apps can follow whether the session is ending');
  } finally {
    unsubscribe();
    await call('Session', 'Close', null, null, session);
  }
}

async function checkSharedSettings() {
  const [all] = (await call('Settings', 'ReadAll', new GLib.Variant('(as)', [['org.gnome.desktop.*', 'org.gnome.fontconfig']]), '(a{sa{sv}})')).recursiveUnpack();
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  require(all['org.gnome.desktop.interface']?.['cursor-theme'] === interfaceSettings.get_string('cursor-theme')
    && 'button-layout' in (all['org.gnome.desktop.wm.preferences'] ?? {}) && typeof all['org.gnome.fontconfig']?.serial === 'number',
  'sandboxed apps read fonts, cursor and window button settings');
}

export async function run() {
  await checkAppearance();
  await checkScreenshot();
  await checkAccount();
  await checkUsb();
  await checkWallpaper();
  await checkLockdown();
  await checkInhibit();
  await checkSharedSettings();
}
