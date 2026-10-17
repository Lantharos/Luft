import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const XML = `<node>
<interface name="org.freedesktop.NetworkManager">
  <property name="Version" type="s" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="Connectivity" type="u" access="read"/>
  <property name="ConnectivityCheckAvailable" type="b" access="read"/>
  <property name="ConnectivityCheckEnabled" type="b" access="read"/>
  <property name="NetworkingEnabled" type="b" access="read"/>
  <property name="WirelessEnabled" type="b" access="readwrite"/>
  <property name="WirelessHardwareEnabled" type="b" access="read"/>
  <property name="Devices" type="ao" access="read"/>
  <property name="AllDevices" type="ao" access="read"/>
  <property name="ActiveConnections" type="ao" access="read"/>
  <property name="PrimaryConnection" type="o" access="read"/>
  <property name="PrimaryConnectionType" type="s" access="read"/>
  <method name="CheckConnectivity"><arg type="u" direction="out"/></method>
</interface>
<interface name="org.freedesktop.NetworkManager.AgentManager">
  <method name="Register"><arg type="s" direction="in"/></method>
  <method name="RegisterWithCapabilities"><arg type="s" direction="in"/><arg type="u" direction="in"/></method>
  <method name="Unregister"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Settings">
  <property name="Connections" type="ao" access="read"/>
  <property name="CanModify" type="b" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Settings.Connection">
  <property name="Unsaved" type="b" access="read"/>
  <method name="GetSettings"><arg type="a{sa{sv}}" direction="out"/></method>
</interface>
<interface name="org.freedesktop.NetworkManager.Connection.Active">
  <property name="Connection" type="o" access="read"/>
  <property name="Id" type="s" access="read"/>
  <property name="Uuid" type="s" access="read"/>
  <property name="Type" type="s" access="read"/>
  <property name="Devices" type="ao" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="Default" type="b" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Device">
  <property name="Interface" type="s" access="read"/>
  <property name="DeviceType" type="u" access="read"/>
  <property name="Managed" type="b" access="read"/>
  <property name="Real" type="b" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="StateReason" type="(uu)" access="read"/>
  <property name="ActiveConnection" type="o" access="read"/>
  <property name="AvailableConnections" type="ao" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Device.Wired">
  <property name="HwAddress" type="s" access="read"/>
  <property name="Speed" type="u" access="read"/>
  <property name="Carrier" type="b" access="read"/>
</interface>
</node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.NetworkManager">
  <method name="SetConnectivity"><arg type="u" direction="in"/></method>
  <method name="Checks"><arg type="u" direction="out"/></method>
</interface></node>`;

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

export const NETWORK_MANAGER_NAME = 'org.freedesktop.NetworkManager';

const variant = (signature, value) => new GLib.Variant(signature, value);

function wiredSettings() {
  return {
    'connection': {id: variant('s', 'Wired connection 1'), uuid: variant('s', UUID), type: variant('s', '802-3-ethernet')},
    '802-3-ethernet': {},
    'ipv4': {method: variant('s', 'auto')},
    'ipv6': {method: variant('s', 'auto')},
  };
}

export function publishNetworkManager(publish, calls) {
  const info = Gio.DBusNodeInfo.new_for_xml(XML);
  const server = Gio.DBusObjectManagerServer.new(ROOT);
  const object = (path, interfaces) => {
    const skeleton = Gio.DBusObjectSkeleton.new(path);
    const exported = interfaces.map(([name, implementation]) => {
      const wrapped = Gio.DBusExportedObject.wrapJSObject(info.lookup_interface(`org.freedesktop.NetworkManager${name}`), implementation);
      skeleton.add_interface(wrapped);
      return wrapped;
    });
    server.export(skeleton);
    return exported;
  };

  let connectivity = FULL;
  let checks = 0;
  const [manager] = object(MANAGER, [
    ['', {
      Version: '1.54.0',
      State: GLOBAL_CONNECTED,
      get Connectivity() {
        return connectivity;
      },
      ConnectivityCheckAvailable: true,
      ConnectivityCheckEnabled: true,
      NetworkingEnabled: true,
      WirelessEnabled: true,
      WirelessHardwareEnabled: true,
      Devices: [WIRED_DEVICE],
      AllDevices: [WIRED_DEVICE],
      ActiveConnections: [ACTIVE],
      PrimaryConnection: ACTIVE,
      PrimaryConnectionType: '802-3-ethernet',
      CheckConnectivity() {
        checks++;
        return connectivity;
      },
    }],
    ['.AgentManager', {
      Register: identifier => calls.push(`network Register ${identifier}`),
      RegisterWithCapabilities: identifier => calls.push(`network Register ${identifier}`),
      Unregister: () => calls.push('network Unregister'),
    }],
  ]);
  object(`${MANAGER}/Settings`, [['.Settings', {Connections: [WIRED_CONNECTION], CanModify: true}]]);
  object(WIRED_CONNECTION, [['.Settings.Connection', {Unsaved: false, GetSettings: () => wiredSettings()}]]);
  object(ACTIVE, [['.Connection.Active', {
    Connection: WIRED_CONNECTION, Id: 'Wired connection 1', Uuid: UUID, Type: '802-3-ethernet', Devices: [WIRED_DEVICE], State: ACTIVATED, Default: true,
  }]]);
  object(WIRED_DEVICE, [
    ['.Device', {Interface: 'enp5s0', DeviceType: ETHERNET, Managed: true, Real: true, State: DEVICE_ACTIVATED, StateReason: [DEVICE_ACTIVATED, 0],
      ActiveConnection: ACTIVE, AvailableConnections: [WIRED_CONNECTION]}],
    ['.Device.Wired', {HwAddress: '52:54:00:4C:55:01', Speed: 1000, Carrier: true}],
  ]);
  server.set_connection(Gio.DBus.system);

  publish(CONTROL, {
    SetConnectivity(state) {
      connectivity = state;
      manager.emit_property_changed('Connectivity', variant('u', state));
    },
    Checks: () => checks,
  }, '/com/lantharos/KestrelChecks/NetworkManager');
}
