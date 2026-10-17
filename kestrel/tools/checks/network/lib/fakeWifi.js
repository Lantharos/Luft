import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import NM from 'gi://NM';

const SECURITY = '802-11-wireless-security';
const {ALLOW_INTERACTION, USER_REQUESTED, REQUEST_NEW} = NM.SecretAgentGetSecretsFlags;
const PSK = NM['80211ApSecurityFlags'].KEY_MGMT_PSK | NM['80211ApSecurityFlags'].PAIR_CCMP | NM['80211ApSecurityFlags'].GROUP_CCMP;
const CAPABILITIES = NM.DeviceWifiCapabilities.CIPHER_CCMP | NM.DeviceWifiCapabilities.WPA | NM.DeviceWifiCapabilities.RSN;
const uint = name => GObject.ParamSpec.uint(name, null, null, GObject.ParamFlags.READWRITE, 0, GLib.MAXUINT32, 0);
const object = name => GObject.ParamSpec.object(name, null, null, GObject.ParamFlags.READWRITE, GObject.Object);
const ssidBytes = name => new GLib.Bytes(new TextEncoder().encode(name));

const AccessPoint = GObject.registerClass({
  Properties: {
    'ssid': GObject.ParamSpec.boxed('ssid', null, null, GObject.ParamFlags.READWRITE, GLib.Bytes),
    'strength': uint('strength'),
    'mode': uint('mode'),
    'flags': uint('flags'),
    'wpa-flags': uint('wpa-flags'),
    'rsn-flags': uint('rsn-flags'),
  },
}, class AccessPoint extends GObject.Object {
  constructor(name, index) {
    super({ssid: ssidBytes(name), strength: 90 - index * 10, mode: NM['80211Mode'].INFRA, flags: NM['80211ApFlags'].PRIVACY, rsn_flags: PSK});
    this._path = `/org/freedesktop/NetworkManager/AccessPoint/${index + 1}`;
  }

  get_ssid() {
    return this.ssid;
  }

  get_path() {
    return this._path;
  }

  connection_valid(connection) {
    return connection.get_setting_wireless()?.get_ssid()?.equal(this.ssid) ?? false;
  }
});

const ActiveConnection = GObject.registerClass({
  Properties: {'state': uint('state')},
}, class ActiveConnection extends GObject.Object {
  constructor(connection) {
    super({state: NM.ActiveConnectionState.ACTIVATING});
    this.connection = connection;
  }
});

const Device = GObject.registerClass({
  Properties: {
    'active-access-point': object('active-access-point'),
    'active-connection': object('active-connection'),
    'available-connections': GObject.ParamSpec.jsobject('available-connections', null, null, GObject.ParamFlags.READWRITE),
    'wireless-capabilities': uint('wireless-capabilities'),
    'mode': uint('mode'),
    'state': uint('state'),
  },
  Signals: {
    'access-point-added': {param_types: [GObject.Object]},
    'access-point-removed': {param_types: [GObject.Object]},
    'state-changed': {param_types: [GObject.TYPE_UINT, GObject.TYPE_UINT, GObject.TYPE_UINT]},
  },
}, class Device extends GObject.Object {
  constructor(client, points, connections) {
    super({available_connections: connections, wireless_capabilities: CAPABILITIES, mode: NM['80211Mode'].INFRA, state: NM.DeviceState.DISCONNECTED});
    this.client = client;
    this._points = points;
    this._scans = 0;
  }

  get lastScan() {
    return this._scans++;
  }

  get_access_points() {
    return this._points;
  }

  get_available_connections() {
    return this.available_connections;
  }

  request_scan_async() {
    return Promise.resolve(true);
  }
});

function savedConnection(name, psk) {
  const connection = NM.SimpleConnection.new();
  connection.add_setting(new NM.SettingConnection({id: name, uuid: GLib.uuid_string_random(), type: '802-11-wireless'}));
  connection.add_setting(new NM.SettingWireless({ssid: ssidBytes(name)}));
  connection.add_setting(new NM.SettingWirelessSecurity({key_mgmt: 'wpa-psk', psk}));
  return connection;
}

export class FakeWifi {
  constructor(agent, networks) {
    this._agent = agent;
    this.requests = [];
    this.forgotten = [];
    const points = Object.keys(networks).map((name, index) => new AccessPoint(name, index));
    const saved = Object.entries(networks).filter(([, psk]) => psk !== undefined).map(([name, psk]) => savedConnection(name, psk));
    this.device = new Device(this, points, saved);
  }

  activate_connection_async(connection) {
    const psk = connection.get_setting_wireless_security().psk;
    this._askAgent(connection, ALLOW_INTERACTION | USER_REQUESTED | (psk ? REQUEST_NEW : 0));
  }

  add_and_activate_connection_async(partial, _device, apPath) {
    const ap = this.device.get_access_points().find(point => point.get_path() === apPath);
    const connection = savedConnection(NM.utils_ssid_to_utf8(ap.ssid.get_data()), null);
    connection.delete_async = () => this.forgotten.push(connection.get_id());
    const active = new ActiveConnection(connection);
    this._askAgent(connection, ALLOW_INTERACTION | USER_REQUESTED, active);
    return Promise.resolve(active);
  }

  askOnItsOwn(name) {
    const connection = this.device.available_connections.find(saved => saved.get_id() === name);
    return this._askAgent(connection, ALLOW_INTERACTION | REQUEST_NEW);
  }

  _askAgent(connection, flags, active = null) {
    const request = {name: connection.get_id(), flags};
    request.answer = new Promise(resolve => {
      this._agent.vfunc_get_secrets(connection, `/org/freedesktop/NetworkManager/Settings/${this.requests.length + 1}`, SECURITY, [], flags,
        (_agent, _connection, secrets, error) => {
          const psk = secrets?.recursiveUnpack()[SECURITY]?.psk ?? null;
          if (active)
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
              active.state = psk ? NM.ActiveConnectionState.ACTIVATED : NM.ActiveConnectionState.DEACTIVATED;
              return GLib.SOURCE_REMOVE;
            });
          resolve({psk, error});
        });
    });
    this.requests.push(request);
    return request;
  }
}
