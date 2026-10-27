import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';
import {CONTROL_XML, NETWORK_MANAGER_XML} from './interfaces.js';
import {Wifi, type Network, type NetworkManagerHost} from './wifi.js';

const ROOT = '/org/freedesktop';
const MANAGER = '/org/freedesktop/NetworkManager';
const WIRED_DEVICE = `${MANAGER}/Devices/1`;
const WIRED_CONNECTION = `${MANAGER}/Settings/1`;
const ACTIVE = `${MANAGER}/ActiveConnection/1`;
const UUID = '4b0c6f0e-3a51-4c0d-9a63-6f1d5a0e2b7c';
const ETHERNET = 1;
const DEVICE_ACTIVATED = 100;
const GLOBAL_CONNECTED = 70;
const ACTIVATED = 2;
const FULL = 4;
const CHECK_URI = 'http://fedoraproject.org/static/hotspot.txt';

export const NETWORK_MANAGER_NAME = 'org.freedesktop.NetworkManager';

const variant = (signature: string, value: unknown) => new GLib.Variant(signature, value);

function wiredSettings() {
  return {
    'connection': {id: variant('s', 'Wired connection 1'), uuid: variant('s', UUID), type: variant('s', '802-3-ethernet')},
    '802-3-ethernet': {},
    'ipv4': {method: variant('s', 'auto')},
    'ipv6': {method: variant('s', 'auto')},
  };
}

export function publishNetworkManager(publish: Publish, calls: string[]) {
  const info = Gio.DBusNodeInfo.new_for_xml(NETWORK_MANAGER_XML);
  const server = Gio.DBusObjectManagerServer.new(ROOT);
  const object = (path: string, interfaces: [string, object][]) => {
    const skeleton = Gio.DBusObjectSkeleton.new(path);
    const exported = interfaces.map(([name, implementation]) => {
      const wrapped = Gio.DBusExportedObject.wrapJSObject(info.lookup_interface(`org.freedesktop.NetworkManager${name}`)!, implementation);
      skeleton.add_interface(wrapped);
      return wrapped;
    });
    server.export(skeleton);
    return exported;
  };

  let connectivity = FULL;
  let checkUri = CHECK_URI;
  let checks = 0;
  const devices = [WIRED_DEVICE];
  const connections = [WIRED_CONNECTION];
  const [manager] = object(MANAGER, [
    ['', {
      Version: '1.54.0',
      State: GLOBAL_CONNECTED,
      get Connectivity() {
        return connectivity;
      },
      ConnectivityCheckAvailable: true,
      ConnectivityCheckEnabled: true,
      get ConnectivityCheckUri() {
        return checkUri;
      },
      NetworkingEnabled: true,
      WirelessEnabled: true,
      WirelessHardwareEnabled: true,
      get Devices() {
        return devices;
      },
      get AllDevices() {
        return devices;
      },
      ActiveConnections: [ACTIVE],
      PrimaryConnection: ACTIVE,
      PrimaryConnectionType: '802-3-ethernet',
      CheckConnectivity() {
        checks++;
        return connectivity;
      },
      ActivateConnection: (connection: string, _device: string, _specific: string) => wifi.activate(connection),
      AddAndActivateConnection: (_settings: object, _device: string, accessPoint: string) => wifi.addAndActivate(accessPoint),
    }],
  ]);
  object(`${MANAGER}/AgentManager`, [['.AgentManager', {
    Register: (identifier: string) => calls.push(`network Register ${identifier}`),
    RegisterWithCapabilities: (identifier: string) => calls.push(`network Register ${identifier}`),
    Unregister: () => calls.push('network Unregister'),
  }]]);
  const [settings] = object(`${MANAGER}/Settings`, [['.Settings', {
    get Connections() {
      return connections;
    },
    CanModify: true,
  }]]);
  object(WIRED_CONNECTION, [['.Settings.Connection', {Unsaved: false, GetSettings: () => wiredSettings()}]]);
  object(ACTIVE, [['.Connection.Active', {
    Connection: WIRED_CONNECTION, SpecificObject: '/', Id: 'Wired connection 1', Uuid: UUID, Type: '802-3-ethernet', Devices: [WIRED_DEVICE],
    State: ACTIVATED, Default: true,
  }]]);
  object(WIRED_DEVICE, [
    ['.Device', {Interface: 'enp5s0', DeviceType: ETHERNET, Managed: true, Real: true, State: DEVICE_ACTIVATED, StateReason: [DEVICE_ACTIVATED, 0],
      ActiveConnection: ACTIVE, AvailableConnections: [WIRED_CONNECTION]}],
    ['.Device.Wired', {HwAddress: '52:54:00:4C:55:01', Speed: 1000, Carrier: true}],
  ]);
  server.set_connection(Gio.DBus.system);

  const changed = (exported: Gio.DBusExportedObject, name: string, signal: string, list: string[], path: string) => {
    exported.emit_property_changed(name, variant('ao', list));
    exported.emit_signal(signal, variant('(o)', [path]));
  };
  const host: NetworkManagerHost = {
    object,
    remove: path => server.unexport(path),
    addDevice(path) {
      devices.push(path);
      manager.emit_property_changed('AllDevices', variant('ao', devices));
      changed(manager, 'Devices', 'DeviceAdded', devices, path);
    },
    removeDevice(path) {
      devices.splice(devices.indexOf(path), 1);
      manager.emit_property_changed('AllDevices', variant('ao', devices));
      changed(manager, 'Devices', 'DeviceRemoved', devices, path);
    },
    addConnection(path) {
      connections.push(path);
      changed(settings, 'Connections', 'NewConnection', connections, path);
    },
    removeConnection(path) {
      connections.splice(connections.indexOf(path), 1);
      changed(settings, 'Connections', 'ConnectionRemoved', connections, path);
    },
  };
  const wifi = new Wifi(host);

  publish(CONTROL_XML, {
    SetConnectivity(state: number) {
      connectivity = state;
      manager.emit_property_changed('Connectivity', variant('u', state));
    },
    SetConnectivityCheckUri(uri: string) {
      checkUri = uri;
      manager.emit_property_changed('ConnectivityCheckUri', variant('s', uri));
    },
    Checks: () => checks,
    AddWifi: (networks: Network[]) => wifi.add(networks),
    RemoveWifi: () => wifi.remove(),
    AskSecrets: (name: string) => wifi.askOnItsOwn(name),
    TakeSecretRequests: () => wifi.takeSecretRequests(),
    AnswerSecrets: (id: number, joined: boolean) => wifi.answerSecrets(id, joined),
    Forgotten: () => wifi.forgotten,
  }, '/com/lantharos/KestrelChecks/NetworkManager');
}
