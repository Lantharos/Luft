import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

const XML = `<node>
<interface name="org.freedesktop.NetworkManager">
  <property name="WirelessEnabled" type="b" access="readwrite"/>
  <property name="WirelessHardwareEnabled" type="b" access="read"/>
  <property name="Connectivity" type="u" access="read"/>
  <method name="AddAndActivateConnection">
    <arg type="a{sa{sv}}" direction="in"/><arg type="o" direction="in"/><arg type="o" direction="in"/>
    <arg type="o" direction="out"/><arg type="o" direction="out"/>
  </method>
</interface>
<interface name="org.freedesktop.NetworkManager.Settings">
  <property name="Connections" type="ao" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Device">
  <property name="DeviceType" type="u" access="read"/>
  <property name="Managed" type="b" access="read"/>
  <property name="Real" type="b" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="Interface" type="s" access="read"/>
</interface>
<interface name="org.freedesktop.NetworkManager.Device.Wireless">
  <property name="AccessPoints" type="ao" access="read"/>
  <property name="ActiveAccessPoint" type="o" access="read"/>
  <method name="RequestScan"><arg type="a{sv}" direction="in"/></method>
</interface>
<interface name="org.freedesktop.NetworkManager.AccessPoint">
  <property name="Ssid" type="ay" access="read"/>
  <property name="Strength" type="y" access="read"/>
  <property name="Flags" type="u" access="read"/>
  <property name="WpaFlags" type="u" access="read"/>
  <property name="RsnFlags" type="u" access="read"/>
</interface>
</node>`;

const ROOT = '/org/freedesktop';
const DEVICE = '/org/freedesktop/NetworkManager/Devices/2';
const WIFI = 2;
const DISCONNECTED = 30;
const PSK = 0x100;
const PRIVACY = 1;
const NETWORKS: [string, number, boolean][] = [['Lindenstraße 12', 88, true], ['Café Morgenrot', 64, false], ['FRITZ!Box 7590 QX', 51, true], ['Vodafone Hotspot', 32, false]];

export const NETWORK_MANAGER_NAME = 'org.freedesktop.NetworkManager';

export function publishNetworkManager(calls: string[]) {
  const info = Gio.DBusNodeInfo.new_for_xml(XML);
  const server = Gio.DBusObjectManagerServer.new(ROOT);
  const object = (path: string, interfaces: [string, object][]) => {
    const skeleton = Gio.DBusObjectSkeleton.new(path);
    for (const [name, implementation] of interfaces)
      skeleton.add_interface(Gio.DBusExportedObject.wrapJSObject(info.lookup_interface(`org.freedesktop.NetworkManager${name}`)!, implementation));
    server.export(skeleton);
  };
  const points = NETWORKS.map(([ssid, strength, locked], index) => {
    const path = `/org/freedesktop/NetworkManager/AccessPoint/${index + 1}`;
    object(path, [['.AccessPoint', {
      Ssid: [...new TextEncoder().encode(ssid)],
      Strength: strength,
      Flags: locked ? PRIVACY : 0,
      WpaFlags: 0,
      RsnFlags: locked ? PSK : 0,
    }]]);
    return path;
  });
  object('/org/freedesktop/NetworkManager', [['', {
    WirelessEnabled: true,
    WirelessHardwareEnabled: true,
    Connectivity: 1,
    AddAndActivateConnection: (_settings: Record<string, Record<string, GLib.Variant>>, device: string) => {
      calls.push('network AddAndActivateConnection');
      return ['/org/freedesktop/NetworkManager/Settings/1', device];
    },
  }]]);
  object('/org/freedesktop/NetworkManager/Settings', [['.Settings', {Connections: []}]]);
  object(DEVICE, [
    ['.Device', {DeviceType: WIFI, Managed: true, Real: true, State: DISCONNECTED, Interface: 'wlan0'}],
    ['.Device.Wireless', {AccessPoints: points, ActiveAccessPoint: '/', RequestScan: () => {}}],
  ]);
  server.set_connection(Gio.DBus.system);
}
