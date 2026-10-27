import GLib from 'gi://GLib';

import type {Publish} from './bus.js';

const UPOWER = `<node><interface name="org.freedesktop.UPower">
  <method name="EnumerateDevices"><arg type="ao" direction="out"/></method>
  <property name="OnBattery" type="b" access="read"/>
</interface></node>`;
const DEVICE = `<node><interface name="org.freedesktop.UPower.Device">
  <method name="EnableChargeThreshold"><arg type="b" direction="in"/></method>
  <property name="NativePath" type="s" access="read"/>
  <property name="Model" type="s" access="read"/>
  <property name="Type" type="u" access="read"/>
  <property name="PowerSupply" type="b" access="read"/>
  <property name="IsPresent" type="b" access="read"/>
  <property name="State" type="u" access="read"/>
  <property name="Percentage" type="d" access="read"/>
  <property name="TimeToEmpty" type="x" access="read"/>
  <property name="TimeToFull" type="x" access="read"/>
  <property name="EnergyRate" type="d" access="read"/>
  <property name="EnergyFull" type="d" access="read"/>
  <property name="EnergyFullDesign" type="d" access="read"/>
  <property name="ChargeCycles" type="i" access="read"/>
  <property name="WarningLevel" type="u" access="read"/>
  <property name="IconName" type="s" access="read"/>
  <property name="ChargeThresholdSupported" type="b" access="read"/>
  <property name="ChargeThresholdEnabled" type="b" access="read"/>
  <property name="ChargeStartThreshold" type="u" access="read"/>
  <property name="ChargeEndThreshold" type="u" access="read"/>
</interface></node>`;
const POWER_PROFILES = `<node><interface name="org.freedesktop.UPower.PowerProfiles">
  <method name="HoldProfile">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="u" direction="out"/>
  </method>
  <method name="ReleaseProfile"><arg type="u" direction="in"/></method>
  <property name="ActiveProfile" type="s" access="readwrite"/>
  <property name="PerformanceDegraded" type="s" access="read"/>
  <property name="Profiles" type="aa{sv}" access="read"/>
  <property name="ActiveProfileHolds" type="aa{sv}" access="read"/>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Battery">
  <method name="Set"><arg type="a{sv}" direction="in"/></method>
  <method name="Reset"/>
</interface></node>`;

const BATTERY_PATH = '/org/freedesktop/UPower/devices/battery_BAT0';
const DISPLAY_PATH = '/org/freedesktop/UPower/devices/DisplayDevice';
type Value = string | number | boolean;

const TYPES: Record<string, string> = {
  NativePath: 's', Model: 's', Type: 'u', PowerSupply: 'b', IsPresent: 'b', State: 'u', Percentage: 'd',
  TimeToEmpty: 'x', TimeToFull: 'x', EnergyRate: 'd', EnergyFull: 'd', EnergyFullDesign: 'd', ChargeCycles: 'i',
  WarningLevel: 'u', IconName: 's', ChargeThresholdSupported: 'b', ChargeThresholdEnabled: 'b',
  ChargeStartThreshold: 'u', ChargeEndThreshold: 'u',
};
const NO_BATTERY: Record<string, Value> = {
  NativePath: 'BAT0', Model: 'Fixture battery', Type: 2, PowerSupply: true, IsPresent: false, State: 0, Percentage: 0,
  TimeToEmpty: 0, TimeToFull: 0, EnergyRate: 0, EnergyFull: 52, EnergyFullDesign: 57, ChargeCycles: 0,
  WarningLevel: 1, IconName: '', ChargeThresholdSupported: false, ChargeThresholdEnabled: false,
  ChargeStartThreshold: 0, ChargeEndThreshold: 0,
};

function deviceObject(state: Record<string, Value>, extra: object = {}) {
  const object = {...extra};
  for (const name of Object.keys(TYPES))
    Object.defineProperty(object, name, {get: () => state[name], enumerable: true});
  return object;
}

export function publishUpower(publish: Publish, calls: string[]) {
  const device = {...NO_BATTERY};
  let onBattery = false;
  const display = publish(DEVICE, deviceObject(device), DISPLAY_PATH);
  const battery = publish(DEVICE, deviceObject(device, {
    EnableChargeThreshold(enabled: boolean) {
      calls.push(`EnableChargeThreshold ${enabled}`);
      if (!device.ChargeThresholdSupported) throw new Error('setting battery charge thresholds is unsupported');
      changed({ChargeThresholdEnabled: enabled});
    },
  }), BATTERY_PATH);
  const upower = publish(UPOWER, {
    EnumerateDevices: () => device.IsPresent ? [BATTERY_PATH] : [],
    get OnBattery() { return onBattery; },
  }, '/org/freedesktop/UPower');

  function changed(values: Record<string, Value>) {
    for (const [name, value] of Object.entries(values)) {
      if (name === 'OnBattery' && typeof value === 'boolean') {
        onBattery = value;
        upower.emit_property_changed(name, new GLib.Variant('b', value));
        continue;
      }
      device[name] = value;
      for (const exported of [display, battery]) exported.emit_property_changed(name, new GLib.Variant(TYPES[name], value));
    }
  }

  publish(CONTROL, {
    Set: (values: Record<string, GLib.Variant>) => changed(Object.fromEntries(Object.entries(values).map(([name, value]) => [name, value.recursiveUnpack<Value>()]))),
    Reset: () => changed({...NO_BATTERY, OnBattery: false}),
  }, '/com/lantharos/KestrelChecks/Battery');

  publishPowerProfiles(publish);
}

function publishPowerProfiles(publish: Publish) {
  let active = 'balanced';
  const profiles = publish(POWER_PROFILES, {
    HoldProfile: () => 1,
    ReleaseProfile() {},
    get ActiveProfile() { return active; },
    set ActiveProfile(profile: string) {
      active = profile;
      profiles.emit_property_changed('ActiveProfile', new GLib.Variant('s', profile));
    },
    PerformanceDegraded: '',
    Profiles: ['power-saver', 'balanced', 'performance'].map(profile =>
      ({Profile: new GLib.Variant('s', profile), Driver: new GLib.Variant('s', 'platform_profile')})),
    ActiveProfileHolds: [],
  }, '/org/freedesktop/UPower/PowerProfiles');
}
