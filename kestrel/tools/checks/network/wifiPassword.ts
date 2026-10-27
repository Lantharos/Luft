import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import {Main, NetworkAgent, NMWirelessNetworkItem, NMWirelessToggle, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named, ofType, shown, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press, type} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {control} from './lib/networkManager.js';

const {require, eventually} = checks('Wi-Fi password');
const NEVER_ENTERED = 'Harbour';
const REJECTED = 'Lighthouse';
const UNSAVED = 'Tidewater';
const TYPED = 'luft-check-passphrase';
const SECURITY = '802-11-wireless-security';

interface Answer {
  psk: string;
  failed: boolean;
}

interface SecretRequest {
  flags: number;
  answer: Promise<Answer>;
}

const quick = () => named('kestrel-quick-settings')!;
const passwordEntry = () => descendants(global.stage).filter((actor): actor is St.PasswordEntry => actor instanceof St.PasswordEntry)
  .find(entry => entry.mapped);
const networkItem = (name: string) => descendants(quick()).filter((actor): actor is NMWirelessNetworkItem => actor instanceof NMWirelessNetworkItem)
  .find(item => item.network.name === name);
const wifiToggle = () => descendants(quick()).find((actor): actor is NMWirelessToggle => actor instanceof NMWirelessToggle);
const asking = () => passwordEntry() && Main.modalCount > 0;

async function keyringRuns() {
  const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', ['org.freedesktop.secrets']), '(b)');
  return reply.deepUnpack()[0];
}

function networkAgent() {
  const component = Main.componentManager.allComponents.networkAgent;
  return component instanceof NetworkAgent && component.native;
}

function handOver(agent: Shell.NetworkAgent, request: GLib.Variant): SecretRequest {
  const [id, flags] = [request.get_child_value(0).get_uint32(), request.get_child_value(3).get_uint32()];
  const connection = NM.SimpleConnection.new_from_dbus(request.get_child_value(1));
  const answer = new Promise<Answer>(resolve => agent.vfunc_get_secrets(connection, request.get_child_value(2).get_string()[0], SECURITY, [], flags,
    (_agent, _connection, secrets, error) =>
      resolve({psk: secrets?.recursiveUnpack<Record<string, Record<string, string>>>()[SECURITY]?.psk ?? '', failed: !!error})));
  return {
    flags,
    answer: answer.then(async result => {
      await control('AnswerSecrets', new GLib.Variant('(ub)', [id, !!result.psk]));
      return result;
    }),
  };
}

async function forwardRequest(agent: Shell.NetworkAgent) {
  const request = await eventually(async () => {
    const requests = (await control('TakeSecretRequests', null, '(a(ua{sa{sv}}ou))')).get_child_value(0);
    return requests.n_children() > 0 && requests.get_child_value(0);
  }, 'NetworkManager asks Kestrel for the password');
  return handOver(agent, request);
}

function openQuickSettings() {
  if (!shown(quick()))
    toggleSurface('quick');
}

async function openNetworks(toggle: NMWirelessToggle) {
  openQuickSettings();
  await eventually(() => shown(quick()) && toggle.visible, 'quick settings show the Wi-Fi tile');
  await settled();
  if (!toggle.menu.isOpen)
    ofType(styled('kestrel-control-more', toggle)[0], St.Button).emit('clicked', 1);
  await eventually(() => toggle.menu.isOpen && [NEVER_ENTERED, REJECTED, UNSAVED].every(name => shown(networkItem(name))),
    'the Wi-Fi menu lists the networks');
  await settled();
}

async function cancel(request: SecretRequest) {
  press(Clutter.KEY_Escape);
  require((await request.answer).failed, 'Escape cancels the request');
  await eventually(() => Main.modalCount === 0, 'the dialog closes');
}

async function checkNeverEntered(agent: Shell.NetworkAgent, toggle: NMWirelessToggle) {
  await openNetworks(toggle);
  click(networkItem(NEVER_ENTERED)!);
  const request = await forwardRequest(agent);
  await eventually(asking, 'a saved network without a password asks for one when clicked, with no keyring to look in');
  require(showsText(`Passwords or encryption keys are required to access the wireless network “${NEVER_ENTERED}”`),
    'the dialog names the network');
  await capture('wifi-password-missing');
  type(TYPED);
  press(Clutter.KEY_Return);
  require((await request.answer).psk === TYPED, 'the typed password goes to NetworkManager');
  await eventually(() => Main.modalCount === 0, 'the dialog closes');
}

async function checkRejected(agent: Shell.NetworkAgent, toggle: NMWirelessToggle) {
  await openNetworks(toggle);
  click(networkItem(REJECTED)!);
  const request = await forwardRequest(agent);
  await eventually(asking, 'a rejected saved password asks again right away when clicked');
  require(request.flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW, 'NetworkManager asked for a new password');
  require(showsText(`The saved password for “${REJECTED}” didn’t work. Enter it again.`), 'the dialog says the saved password didn’t work');
  require(passwordEntry()!.get_text() === '', 'the rejected password isn’t filled in again');
  await capture('wifi-password-rejected');
  await cancel(request);

  await control('AskSecrets', new GLib.Variant('(s)', [REJECTED]));
  const automatic = await forwardRequest(agent);
  await eventually(asking, 'a rejected saved password asks again right away, even when the connection started on its own');
  await cancel(automatic);
}

async function checkUnsaved(agent: Shell.NetworkAgent, toggle: NMWirelessToggle) {
  await openNetworks(toggle);
  click(networkItem(UNSAVED)!);
  const request = await forwardRequest(agent);
  await eventually(asking, 'a new network asks for its password');
  await cancel(request);
  await eventually(async () => (await control('Forgotten', null, '(as)')).deepUnpack()[0].includes(UNSAVED),
    'a network that never connected isn’t kept as saved');
}

export async function run() {
  require(!(await keyringRuns()), 'no keyring runs, as in Try Luft');
  const agent = require(networkAgent(), 'Kestrel runs its network agent');
  await control('AddWifi', new GLib.Variant('(a(sbs))', [[[NEVER_ENTERED, true, ''], [REJECTED, true, 'not-the-password'], [UNSAVED, false, '']]]));
  try {
    openQuickSettings();
    const toggle = await eventually(() => shown(quick()) && wifiToggle(), 'quick settings have a Wi-Fi tile');
    await checkNeverEntered(agent, toggle);
    await checkRejected(agent, toggle);
    await checkUnsaved(agent, toggle);
  } finally {
    await control('RemoveWifi');
    if (shown(quick()))
      toggleSurface('quick');
  }
}
