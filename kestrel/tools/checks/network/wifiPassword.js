import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, showsText} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';

const {require, eventually} = checks('Wi-Fi password');
const SSID = 'Harbour';
const SAVED = 'not-the-password';
const {ALLOW_INTERACTION, REQUEST_NEW} = NM.SecretAgentGetSecretsFlags;

class FakeAgent {
  constructor() {
    this.response = new Promise(resolve => (this._respond = resolve));
  }

  set_password() {}

  respond(_request, response) {
    this._respond(response);
  }
}

function savedNetwork() {
  const connection = NM.SimpleConnection.new();
  connection.add_setting(new NM.SettingConnection({id: SSID, uuid: GLib.uuid_string_random(), type: '802-11-wireless'}));
  connection.add_setting(new NM.SettingWireless({ssid: new GLib.Bytes(new TextEncoder().encode(SSID))}));
  connection.add_setting(new NM.SettingWirelessSecurity({key_mgmt: 'wpa-psk', psk: SAVED}));
  return connection;
}

const passwordEntry = () => descendants(global.stage).find(actor => actor instanceof St.PasswordEntry && actor.mapped);

export async function run() {
  const component = Main.componentManager._allComponents.networkAgent;
  const native = component._native;
  const agent = new FakeAgent();
  component._native = agent;
  try {
    component._newRequest(agent, 'rejected', savedNetwork(), '802-11-wireless-security', [], ALLOW_INTERACTION | REQUEST_NEW);
    await eventually(() => passwordEntry() && Main.modalCount > 0,
      'a rejected saved password asks again right away, even when the connection started on its own');
    require(showsText(`The saved password for “${SSID}” didn’t work. Enter it again.`), 'the dialog says the saved password didn’t work');
    require(passwordEntry().get_text() === '', 'the rejected password isn’t filled in again');
    await capture('wifi-password-rejected');
    press(Clutter.KEY_Escape);
    require(await agent.response === Shell.NetworkAgentResponse.USER_CANCELED, 'Escape cancels the request');
    await eventually(() => Main.modalCount === 0, 'the dialog closes');
  } finally {
    component._native = native;
  }
}
