import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {VpnSecrets} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, labelled, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, type} from '../lib/input.js';
import {fixture, firstLine, scratch, spawn} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('VPN');
const ALLOW_INTERACTION = NM.SecretAgentGetSecretsFlags.ALLOW_INTERACTION | NM.SecretAgentGetSecretsFlags.USER_REQUESTED;
const SIGN_IN_TIMEOUT = 10000;
const AUTH_DIALOG = `#!/bin/sh
for argument; do [ "$argument" = --external-ui-mode ] && external=1; done
[ -n "$external" ] || exit 1
while read -r line; do [ "$line" = DONE ] && break; done
cat <<'KEYFILE'
[VPN Plugin UI]
Version=2
Description=Enter the code from your authenticator app for “Office”.
Title=Authenticate VPN

[password]
Value=
Label=Password:
IsSecret=true
ShouldAsk=true

[challenge]
Value=
Label=Code:
IsSecret=false
ShouldAsk=true

[username]
Value=alice
Label=Username:
IsSecret=false
ShouldAsk=false
KEYFILE
`;

const vpnDialog = () => shownStyled('kestrel-vpn-dialog');
const entries = dialog => descendants(dialog).filter(actor => actor instanceof St.Entry && actor.mapped);

function connection(id, service, data) {
  const vpn = new NM.SettingVpn({service_type: service});
  for (const [key, value] of Object.entries(data)) vpn.add_data_item(key, value);
  const result = NM.SimpleConnection.new();
  result.add_setting(new NM.SettingConnection({id, uuid: GLib.uuid_string_random(), type: 'vpn'}));
  result.add_setting(vpn);
  return result;
}

class FakeAgent {
  constructor(plugin) {
    this.plugin = plugin;
    this.secrets = {};
    this.response = new Promise(resolve => (this._respond = resolve));
  }

  search_vpn_plugin() {
    return Promise.resolve(this.plugin);
  }

  add_vpn_secret(_request, key, value) {
    this.secrets[key] = value;
  }

  respond(_request, response) {
    this._respond(response);
  }
}

async function openedDialog(label) {
  await waitUntil(vpnDialog, label);
  await settled();
  return vpnDialog();
}

async function typeInto(entry, text) {
  await waitUntil(() => entry.clutter_text.has_key_focus(), 'the field takes the keyboard');
  type(text);
}

const dialogClosed = () => eventually(() => !vpnDialog(), 'the VPN dialog closes');

async function checkAuthDialog(folder) {
  const program = `${folder}/auth-dialog`;
  GLib.file_set_contents(program, AUTH_DIALOG);
  GLib.chmod(program, 0o755);
  GLib.file_set_contents(`${folder}/check.name`, `[VPN Connection]\nname=check\nservice=org.freedesktop.NetworkManager.check\nprogram=/bin/false\n\n[GNOME]\nauth-dialog=${program}\nsupports-external-ui-mode=true\n`);
  const agent = new FakeAgent(NM.VpnPluginInfo.new_from_file(`${folder}/check.name`));
  new VpnSecrets(agent, 'office', connection('Office', 'org.freedesktop.NetworkManager.check', {}), [], ALLOW_INTERACTION, () => {});
  const dialog = await openedDialog('the external auth dialog opens');
  require(labelled('Sign in to Office', dialog) && labelled('Enter the code from your authenticator app for “Office”.', dialog) &&
    entries(dialog).length === 2, 'a plugin’s external auth dialog is asked in Kestrel');
  const [password, code] = entries(dialog);
  await typeInto(password, 'hunter2');
  await capture('vpn-secrets');
  code.grab_key_focus();
  await typeInto(code, '123456');
  press(Clutter.KEY_Return);
  require(await agent.response === Shell.NetworkAgentResponse.CONFIRMED &&
    agent.secrets.password === 'hunter2' && agent.secrets.challenge === '123456' && agent.secrets.username === 'alice',
  'the plugin gets what was typed and what it already knew');
  await dialogClosed();
}

async function checkFlags() {
  const agent = new FakeAgent(null);
  new VpnSecrets(agent, 'tunnel', connection('Tunnel', 'org.freedesktop.NetworkManager.ssh', {'password-flags': '2', 'remote': 'example.com'}),
    [], ALLOW_INTERACTION, () => {});
  const dialog = await openedDialog('the secrets dialog opens');
  require(entries(dialog).length === 1 && labelled('Password', dialog), 'a plugin without an external auth dialog asks for its unsaved secrets');
  await typeInto(entries(dialog)[0], 'swordfish');
  press(Clutter.KEY_Return);
  require(await agent.response === Shell.NetworkAgentResponse.CONFIRMED && agent.secrets.password === 'swordfish', 'the secret goes to the plugin');
  await dialogClosed();
}

async function startGateway(folder) {
  const certificate = spawn(['openssl', 'req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256', '-nodes', '-days', '1',
    '-keyout', `${folder}/key.pem`, '-out', `${folder}/cert.pem`, '-subj', '/CN=vpn.check.test'], {flags: Gio.SubprocessFlags.STDERR_SILENCE});
  await certificate.exited;
  const gateway = spawn(['python3', fixture('services', 'anyconnect.py'), `${folder}/cert.pem`, `${folder}/key.pem`],
    {flags: Gio.SubprocessFlags.STDOUT_PIPE});
  return `https://127.0.0.1:${await firstLine(gateway)}/`;
}

async function checkOpenConnect(folder) {
  const gateway = await startGateway(folder);
  const agent = new FakeAgent(null);
  new VpnSecrets(agent, 'work', connection('Work', 'org.freedesktop.NetworkManager.openconnect', {gateway, protocol: 'anyconnect'}),
    [], ALLOW_INTERACTION, () => {});
  const dialog = await openedDialog('OpenConnect opens its dialog');
  require(labelled('Connect Anyway', dialog), 'OpenConnect asks before trusting an unknown certificate');
  await capture('vpn-certificate');
  click(labelled('Connect Anyway', dialog));
  await eventually(() => entries(dialog).length === 2 && labelled('Use your Example account.', dialog),
    'the gateway’s sign-in form is shown in Kestrel', SIGN_IN_TIMEOUT);
  await typeInto(entries(dialog)[0], 'alice');
  press(Clutter.KEY_Tab);
  await typeInto(entries(dialog)[1], 'wrong');
  press(Clutter.KEY_Return);
  await eventually(() => labelled('Login failed.', dialog) && entries(dialog)[0].text === 'alice',
    'a refused sign-in asks again with the gateway’s reason', SIGN_IN_TIMEOUT);
  await capture('vpn-openconnect');
  entries(dialog)[1].grab_key_focus();
  await typeInto(entries(dialog)[1], 'hunter2');
  press(Clutter.KEY_Return);
  require(await agent.response === Shell.NetworkAgentResponse.CONFIRMED && agent.secrets.cookie?.includes('webvpn=check-cookie') &&
    agent.secrets.gateway === gateway && agent.secrets.gwcert?.startsWith('pin-sha256:'),
  'OpenConnect hands the session cookie, gateway and certificate to NetworkManager');
  await eventually(() => !vpnDialog(), 'the dialog closes once signed in');
}

export async function run() {
  const folder = scratch('vpn-checks');
  GLib.mkdir_with_parents(folder, 0o700);
  try {
    await checkAuthDialog(folder);
    await checkFlags();
    await checkOpenConnect(folder);
  } finally {
    await spawn(['rm', '-rf', folder]).exited;
  }
}
