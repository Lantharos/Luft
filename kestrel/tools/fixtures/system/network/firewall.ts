import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const FIREWALL = `<node><interface name="com.lantharos.Firewall1">
  <property name="Unclassified" type="a(os)" access="read"/>
  <property name="HomeInterfaces" type="as" access="read"/>
  <property name="OpenPorts" type="a(qss)" access="read"/>
  <property name="Apps" type="a(sssu)" access="read"/>
  <property name="Waiting" type="a(ssu)" access="read"/>
  <method name="SetNetworkType"><arg name="network" type="o" direction="in"/><arg name="kind" type="s" direction="in"/></method>
  <method name="OpenPort"><arg name="port" type="q" direction="in"/><arg name="protocol" type="s" direction="in"/><arg name="networks" type="s" direction="in"/></method>
  <method name="ClosePort"><arg name="port" type="q" direction="in"/><arg name="protocol" type="s" direction="in"/></method>
  <method name="SetAppAccess"><arg name="kind" type="s" direction="in"/><arg name="id" type="s" direction="in"/><arg name="access" type="s" direction="in"/></method>
  <method name="ForgetApp"><arg name="kind" type="s" direction="in"/><arg name="id" type="s" direction="in"/></method>
  <method name="SetPostOpen"><arg name="open" type="b" direction="in"/></method>
  <method name="SetExtensionPorts"><arg name="ports" type="a(qs)" direction="in"/></method>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Firewall">
  <method name="Join"><arg name="network" type="o" direction="in"/><arg name="name" type="s" direction="in"/></method>
  <method name="Listen"><arg name="kind" type="s" direction="in"/><arg name="id" type="s" direction="in"/></method>
  <method name="Withdraw"><arg name="kind" type="s" direction="in"/><arg name="id" type="s" direction="in"/></method>
</interface></node>`;

export const FIREWALL_NAME = 'com.lantharos.Firewall1';
const HOME_INTERFACES = ['post0'];

type Classify = (connection: string, kind: string) => void;

export function publishFirewall(publish: Publish, calls: string[], classify: Classify, unclassified: [string, string][] = []) {
  const uid = new Gio.Credentials().get_unix_user();
  const ports: [number, string, string][] = [[22, 'tcp', 'home']];
  const apps: [string, string, string, number][] = [['app', 'steam', 'home', uid], ['app', 'com.obsproject.Studio', 'anywhere', uid], ['program', 'node', 'home', uid], ['program', 'flatbed', 'home', uid], ['app', 'discord', 'blocked', uid]];
  const waiting: [string, string, number][] = [];
  const firewall = publish(FIREWALL, {
    get Unclassified() {
      return unclassified;
    },
    get HomeInterfaces() {
      return HOME_INTERFACES;
    },
    get OpenPorts() {
      return ports;
    },
    get Apps() {
      return apps;
    },
    get Waiting() {
      return waiting;
    },
    SetNetworkType(connection: string, kind: string) {
      calls.push(`SetNetworkType ${connection} ${kind}`);
      reclassified(unclassified.filter(([path]) => path !== connection));
      classify(connection, kind);
    },
    OpenPort(port: number, protocol: string, networks: string) {
      calls.push(`OpenPort ${port}/${protocol} ${networks}`);
      const open = ports.find(([number, kind]) => number === port && kind === protocol);
      if (open) open[2] = networks;
      else ports.push([port, protocol, networks]);
    },
    ClosePort(port: number, protocol: string) {
      calls.push(`ClosePort ${port}/${protocol}`);
      ports.splice(ports.findIndex(([open, kind]) => open === port && kind === protocol), 1);
    },
    SetAppAccess(kind: string, id: string, access: string) {
      calls.push(`SetAppAccess ${kind} ${id} ${access}`);
      const known = apps.find(([knownKind, knownId]) => knownKind === kind && knownId === id);
      if (known) known[2] = access;
      else apps.push([kind, id, access, uid]);
      firewall.emit_property_changed('Apps', new GLib.Variant('a(sssu)', apps));
      withdraw(kind, id);
    },
    ForgetApp(kind: string, id: string) {
      calls.push(`ForgetApp ${kind} ${id}`);
      apps.splice(apps.findIndex(([knownKind, knownId]) => knownKind === kind && knownId === id), 1);
      firewall.emit_property_changed('Apps', new GLib.Variant('a(sssu)', apps));
    },
    SetPostOpen(open: boolean) {
      calls.push(`SetPostOpen ${open}`);
    },
    SetExtensionPorts(listen: [number, string][]) {
      calls.push(`SetExtensionPorts ${listen.map(([port, protocol]) => `${port}/${protocol}`).join(',')}`);
    },
  }, '/com/lantharos/Firewall1');
  const withdraw = (kind: string, id: string) => {
    waiting.splice(0, waiting.length, ...waiting.filter(([waitingKind, waitingId]) => waitingKind !== kind || waitingId !== id));
    firewall.emit_property_changed('Waiting', new GLib.Variant('a(ssu)', waiting));
  };
  const reclassified = (networks: [string, string][]) => {
    unclassified.splice(0, unclassified.length, ...networks);
    firewall.emit_property_changed('Unclassified', new GLib.Variant('a(os)', unclassified));
  };
  publish(CONTROL, {
    Join: (network: string, name: string) => reclassified([...unclassified, [network, name]]),
    Listen: (kind: string, id: string) => {
      waiting.push([kind, id, uid]);
      firewall.emit_property_changed('Waiting', new GLib.Variant('a(ssu)', waiting));
    },
    Withdraw: withdraw,
  }, '/com/lantharos/KestrelChecks/Firewall');
}
