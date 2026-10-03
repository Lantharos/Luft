import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {VpnSecrets} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {checker, clicker, descendants, labelled} from '../portal/backend.js';

const require = checker('VPN');
const REPOSITORY = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', '..', '..']);
const GATEWAY = GLib.build_filenamev([REPOSITORY, 'kestrel/tools/fixtures/services/anyconnect.py']);
const GATEWAY_PORT = 18443;
const ALLOW_INTERACTION = NM.SecretAgentGetSecretsFlags.ALLOW_INTERACTION | NM.SecretAgentGetSecretsFlags.USER_REQUESTED;
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

function vpnDialog() {
  return descendants(global.stage).find(actor => actor.has_style_class_name?.('kestrel-vpn-dialog') && actor.mapped);
}

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

async function waitForDialog(pause) {
  for (let tries = 0; tries < 100 && !vpnDialog(); tries++) await pause(100);
  await pause(400);
  return vpnDialog();
}

function entries(dialog) {
  return descendants(dialog).filter(actor => actor instanceof St.Entry && actor.mapped);
}

async function checkAuthDialog({scratch, pause, capture, output, type, press}) {
  const program = `${scratch}/auth-dialog`;
  GLib.file_set_contents(program, AUTH_DIALOG);
  GLib.chmod(program, 0o755);
  GLib.file_set_contents(`${scratch}/check.name`, `[VPN Connection]\nname=check\nservice=org.freedesktop.NetworkManager.check\nprogram=/bin/false\n\n[GNOME]\nauth-dialog=${program}\nsupports-external-ui-mode=true\n`);
  const agent = new FakeAgent(NM.VpnPluginInfo.new_from_file(`${scratch}/check.name`));
  new VpnSecrets(agent, 'office', connection('Office', 'org.freedesktop.NetworkManager.check', {}), [], ALLOW_INTERACTION, () => {});
  const dialog = await waitForDialog(pause);
  require(dialog && labelled(dialog, 'Sign in to Office') && labelled(dialog, 'Enter the code from your authenticator app for “Office”.') &&
    entries(dialog).length === 2, 'a plugin’s external auth dialog is asked in Kestrel');
  type('hunter2');
  await capture(`${output}/vpn-secrets.png`);
  entries(dialog)[1].grab_key_focus();
  type('123456');
  press(Clutter.KEY_Return);
  require(await agent.response === Shell.NetworkAgentResponse.CONFIRMED &&
    agent.secrets.password === 'hunter2' && agent.secrets.challenge === '123456' && agent.secrets.username === 'alice',
  'the plugin gets what was typed and what it already knew');
  await pause(400);
}

async function checkFlags({pause, press, type}) {
  const agent = new FakeAgent(null);
  new VpnSecrets(agent, 'tunnel', connection('Tunnel', 'org.freedesktop.NetworkManager.ssh', {'password-flags': '2', 'remote': 'example.com'}),
    [], ALLOW_INTERACTION, () => {});
  const dialog = await waitForDialog(pause);
  require(dialog && entries(dialog).length === 1 && labelled(dialog, 'Password'), 'a plugin without an external auth dialog asks for its unsaved secrets');
  type('swordfish');
  press(Clutter.KEY_Return);
  require(await agent.response === Shell.NetworkAgentResponse.CONFIRMED && agent.secrets.password === 'swordfish', 'the secret goes to the plugin');
  await pause(400);
}

async function startGateway(scratch) {
  Gio.Subprocess.new(['openssl', 'req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256', '-nodes', '-days', '1',
    '-keyout', `${scratch}/key.pem`, '-out', `${scratch}/cert.pem`, '-subj', '/CN=vpn.check.test'], Gio.SubprocessFlags.STDERR_SILENCE).wait(null);
  const gateway = Gio.Subprocess.new(['python3', GATEWAY, `${GATEWAY_PORT}`, `${scratch}/cert.pem`, `${scratch}/key.pem`], Gio.SubprocessFlags.STDOUT_PIPE);
  await new Promise(resolve => new Gio.DataInputStream({base_stream: gateway.get_stdout_pipe()}).read_line_async(GLib.PRIORITY_DEFAULT, null, resolve));
  return gateway;
}

async function checkOpenConnect({scratch, pause, capture, output, type, press, click}) {
  const gateway = await startGateway(scratch);
  try {
    const agent = new FakeAgent(null);
    new VpnSecrets(agent, 'work', connection('Work', 'org.freedesktop.NetworkManager.openconnect',
      {gateway: `https://127.0.0.1:${GATEWAY_PORT}/`, protocol: 'anyconnect'}), [], ALLOW_INTERACTION, () => {});
    const dialog = await waitForDialog(pause);
    require(dialog && labelled(dialog, 'Connect Anyway'), 'OpenConnect asks before trusting an unknown certificate');
    await capture(`${output}/vpn-certificate.png`);
    await click(labelled(dialog, 'Connect Anyway'));
    for (let tries = 0; tries < 50 && entries(dialog).length < 2; tries++) await pause(100);
    require(entries(dialog).length === 2 && labelled(dialog, 'Use your Example account.'), 'the gateway’s sign-in form is shown in Kestrel');
    type('alice');
    press(Clutter.KEY_Tab);
    type('wrong');
    press(Clutter.KEY_Return);
    for (let tries = 0; tries < 50 && !labelled(dialog, 'Login failed.'); tries++) await pause(100);
    require(labelled(dialog, 'Login failed.') && entries(dialog)[0].text === 'alice', 'a refused sign-in asks again with the gateway’s reason');
    await capture(`${output}/vpn-openconnect.png`);
    entries(dialog)[1].grab_key_focus();
    type('hunter2');
    press(Clutter.KEY_Return);
    require(await agent.response === Shell.NetworkAgentResponse.CONFIRMED && agent.secrets.cookie?.includes('webvpn=check-cookie') &&
      agent.secrets.gateway === `https://127.0.0.1:${GATEWAY_PORT}/` && agent.secrets.gwcert?.startsWith('pin-sha256:'),
    'OpenConnect hands the session cookie, gateway and certificate to NetworkManager');
    await pause(400);
    require(!vpnDialog(), 'the dialog closes once signed in');
  } finally {
    gateway.force_exit();
  }
}

export async function checkVpn({pause, capture, output, pointer, keyboard}) {
  const press = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const type = text => [...text].forEach(character => press(character.charCodeAt(0)));
  const scratch = GLib.build_filenamev([GLib.get_user_cache_dir(), 'vpn-checks']);
  GLib.mkdir_with_parents(scratch, 0o700);
  const context = {scratch, pause, capture, output, type, press, click: clicker(pointer, pause)};
  try {
    await checkAuthDialog(context);
    await checkFlags(context);
    await checkOpenConnect(context);
  } finally {
    Gio.Subprocess.new(['rm', '-rf', scratch], Gio.SubprocessFlags.NONE).wait(null);
  }
}
