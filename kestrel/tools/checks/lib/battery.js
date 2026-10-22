import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call} from './dbus.js';

const TYPES = {IsPresent: 'b', OnBattery: 'b', State: 'u', Percentage: 'd', TimeToEmpty: 'x', TimeToFull: 'x', EnergyRate: 'd',
  ChargeThresholdSupported: 'b', ChargeThresholdEnabled: 'b', ChargeStartThreshold: 'u', ChargeEndThreshold: 'u'};

export const UPOWER_STATE = {charging: 1, discharging: 2, full: 4, pendingCharge: 5};

function control(method, parameters = null) {
  return call('org.freedesktop.UPower', '/com/lantharos/KestrelChecks/Battery', 'com.lantharos.KestrelChecks.Battery', method, parameters, null, {connection: Gio.DBus.system});
}

export function setBattery(values) {
  const entries = Object.entries(values).map(([name, value]) => [name, new GLib.Variant(TYPES[name], value)]);
  return control('Set', new GLib.Variant('(a{sv})', [Object.fromEntries(entries)]));
}

export const resetBattery = () => control('Reset');
