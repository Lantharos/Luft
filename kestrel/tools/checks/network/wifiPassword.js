import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, named, shown, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press, type} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {FakeWifi} from './lib/fakeWifi.js';

const {require, eventually} = checks('Wi-Fi password');
const NEVER_ENTERED = 'Harbour';
const REJECTED = 'Lighthouse';
const UNSAVED = 'Tidewater';
const TYPED = 'luft-check-passphrase';

const quick = () => named('kestrel-quick-settings');
const passwordEntry = () => descendants(global.stage).find(actor => actor instanceof St.PasswordEntry && actor.mapped);
const networkItem = name => descendants(quick()).find(actor => actor.network?.name === name);
const asking = () => passwordEntry() && Main.modalCount > 0;

async function keyringRuns() {
  const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', ['org.freedesktop.secrets']), '(b)');
  return reply.deepUnpack()[0];
}

function wifiToggle() {
  return descendants(quick()).find(actor => actor._deviceType === NM.DeviceType.WIFI);
}

function openQuickSettings() {
  if (!shown(quick()))
    toggleSurface('quick');
}

async function openNetworks(toggle) {
  openQuickSettings();
  await eventually(() => shown(quick()) && toggle.visible, 'quick settings show the Wi-Fi tile');
  await settled();
  if (!toggle.menu.isOpen)
    styled('kestrel-control-more', toggle)[0].emit('clicked', 1);
  await eventually(() => toggle.menu.isOpen && [NEVER_ENTERED, REJECTED, UNSAVED].every(name => shown(networkItem(name))),
    'the Wi-Fi menu lists the networks');
  await settled();
}

async function cancel(request) {
  press(Clutter.KEY_Escape);
  require((await request.answer).error, 'Escape cancels the request');
  await eventually(() => Main.modalCount === 0, 'the dialog closes');
}

async function checkNeverEntered(wifi, toggle) {
  await openNetworks(toggle);
  click(networkItem(NEVER_ENTERED));
  await eventually(asking, 'a saved network without a password asks for one when clicked, with no keyring to look in');
  require(showsText(`Passwords or encryption keys are required to access the wireless network “${NEVER_ENTERED}”`),
    'the dialog names the network');
  await capture('wifi-password-missing');
  type(TYPED);
  press(Clutter.KEY_Return);
  const {psk} = await wifi.requests.at(-1).answer;
  require(psk === TYPED, 'the typed password goes to NetworkManager');
  await eventually(() => Main.modalCount === 0, 'the dialog closes');
}

async function checkRejected(wifi, toggle) {
  await openNetworks(toggle);
  click(networkItem(REJECTED));
  await eventually(asking, 'a rejected saved password asks again right away when clicked');
  require(wifi.requests.at(-1).flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW, 'NetworkManager asked for a new password');
  require(showsText(`The saved password for “${REJECTED}” didn’t work. Enter it again.`), 'the dialog says the saved password didn’t work');
  require(passwordEntry().get_text() === '', 'the rejected password isn’t filled in again');
  await capture('wifi-password-rejected');
  await cancel(wifi.requests.at(-1));

  const automatic = wifi.askOnItsOwn(REJECTED);
  await eventually(asking, 'a rejected saved password asks again right away, even when the connection started on its own');
  await cancel(automatic);
}

async function checkUnsaved(wifi, toggle) {
  await openNetworks(toggle);
  click(networkItem(UNSAVED));
  await eventually(asking, 'a new network asks for its password');
  await cancel(wifi.requests.at(-1));
  await eventually(() => wifi.forgotten.includes(UNSAVED), 'a network that never connected isn’t kept as saved');
}

export async function run() {
  require(!(await keyringRuns()), 'no keyring runs, as in Try Luft');
  const wifi = new FakeWifi(Main.componentManager._allComponents.networkAgent._native,
    {[NEVER_ENTERED]: null, [REJECTED]: 'not-the-password', [UNSAVED]: undefined});
  openQuickSettings();
  await eventually(() => shown(quick()) && wifiToggle(), 'quick settings have a Wi-Fi tile');
  const toggle = wifiToggle();
  toggle._getDefaultName = () => 'Wi–Fi';
  toggle._addItem(wifi.device, toggle._createDeviceMenuItem(wifi.device));
  try {
    await checkNeverEntered(wifi, toggle);
    await checkRejected(wifi, toggle);
    await checkUnsaved(wifi, toggle);
  } finally {
    toggle._removeItem(wifi.device);
    delete toggle._getDefaultName;
    if (shown(quick()))
      toggleSurface('quick');
  }
}
