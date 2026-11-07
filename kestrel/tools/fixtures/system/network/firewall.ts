import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const FIREWALL = `<node><interface name="com.lantharos.Firewall1">
  <property name="Unclassified" type="a(os)" access="read"/>
  <property name="OpenPorts" type="a(qs)" access="read"/>
  <method name="SetNetworkType"><arg name="network" type="o" direction="in"/><arg name="kind" type="s" direction="in"/></method>
  <method name="OpenPort"><arg name="port" type="q" direction="in"/><arg name="protocol" type="s" direction="in"/></method>
  <method name="ClosePort"><arg name="port" type="q" direction="in"/><arg name="protocol" type="s" direction="in"/></method>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Firewall">
  <method name="Join"><arg name="network" type="o" direction="in"/><arg name="name" type="s" direction="in"/></method>
</interface></node>`;

export const FIREWALL_NAME = 'com.lantharos.Firewall1';

type Classify = (connection: string, kind: string) => void;

export function publishFirewall(publish: Publish, calls: string[], classify: Classify, unclassified: [string, string][] = []) {
  const ports: [number, string][] = [[22, 'tcp']];
  const firewall = publish(FIREWALL, {
    get Unclassified() {
      return unclassified;
    },
    get OpenPorts() {
      return ports;
    },
    SetNetworkType(connection: string, kind: string) {
      calls.push(`SetNetworkType ${connection} ${kind}`);
      reclassified(unclassified.filter(([path]) => path !== connection));
      classify(connection, kind);
    },
    OpenPort(port: number, protocol: string) {
      calls.push(`OpenPort ${port}/${protocol}`);
      ports.push([port, protocol]);
    },
    ClosePort(port: number, protocol: string) {
      calls.push(`ClosePort ${port}/${protocol}`);
      ports.splice(ports.findIndex(([open, kind]) => open === port && kind === protocol), 1);
    },
  }, '/com/lantharos/Firewall1');
  const reclassified = (networks: [string, string][]) => {
    unclassified.splice(0, unclassified.length, ...networks);
    firewall.emit_property_changed('Unclassified', new GLib.Variant('a(os)', unclassified));
  };
  publish(CONTROL, {
    Join: (network: string, name: string) => reclassified([...unclassified, [network, name]]),
  }, '/com/lantharos/KestrelChecks/Firewall');
}
