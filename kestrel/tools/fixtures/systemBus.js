import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {publishSecurity, SECURITY_NAMES} from './security.js';

const LOGIN = `<node><interface name="org.freedesktop.login1.Manager">
  <method name="Inhibit">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="h" direction="out"/>
  </method>
  <method name="Suspend"><arg type="b" direction="in"/></method>
  <method name="Hibernate"><arg type="b" direction="in"/></method>
  <method name="PowerOff"><arg type="b" direction="in"/></method>
  <property name="LidClosed" type="b" access="read"/>
  <signal name="PrepareForSleep"><arg type="b"/></signal>
</interface></node>`;
const UPOWER = `<node><interface name="org.freedesktop.UPower">
  <property name="OnBattery" type="b" access="read"/>
</interface></node>`;
const DEVICE = `<node><interface name="org.freedesktop.UPower.Device">
  <property name="WarningLevel" type="u" access="read"/>
</interface></node>`;
const KEYBOARD = `<node><interface name="org.freedesktop.UPower.KbdBacklight">
  <method name="GetBrightness"><arg type="i" direction="out"/></method>
  <method name="GetMaxBrightness"><arg type="i" direction="out"/></method>
  <method name="SetBrightness"><arg type="i" direction="in"/></method>
  <signal name="BrightnessChangedWithSource"><arg type="i"/><arg type="s"/></signal>
</interface></node>`;
const HOSTNAME = `<node><interface name="org.freedesktop.hostname1">
  <property name="Chassis" type="s" access="read"/>
</interface></node>`;
const SYSTEMD = `<node><interface name="org.freedesktop.systemd1.Manager">
  <property name="Virtualization" type="s" access="read"/>
</interface></node>`;
const LOCALE = `<node><interface name="org.freedesktop.locale1">
  <property name="X11Layout" type="s" access="read"/>
  <property name="X11Variant" type="s" access="read"/>
  <property name="X11Options" type="s" access="read"/>
</interface></node>`;
const CALLS = `<node><interface name="com.lantharos.KestrelChecks.Calls">
  <method name="Take"><arg type="as" direction="out"/></method>
</interface></node>`;

const calls = [];
const inhibitors = [];
const published = [];

function publish(xml, implementation, path) {
  const exported = Gio.DBusExportedObject.wrapJSObject(xml, implementation);
  exported.export(Gio.DBus.system, path);
  published.push(exported);
}

publish(LOGIN, {
  InhibitAsync([what, , , mode], invocation) {
    calls.push(`Inhibit ${what} ${mode}`);
    const held = Gio.Socket.new(Gio.SocketFamily.UNIX, Gio.SocketType.STREAM, Gio.SocketProtocol.DEFAULT);
    inhibitors.push(held);
    const descriptors = new Gio.UnixFDList();
    invocation.return_value_with_unix_fd_list(new GLib.Variant('(h)', [descriptors.append(held.get_fd())]), descriptors);
  },
  Suspend: () => calls.push('Suspend'),
  Hibernate: () => calls.push('Hibernate'),
  PowerOff: () => calls.push('PowerOff'),
  LidClosed: false,
}, '/org/freedesktop/login1');

publish(UPOWER, {OnBattery: false}, '/org/freedesktop/UPower');
publish(DEVICE, {WarningLevel: 1}, '/org/freedesktop/UPower/devices/DisplayDevice');
let backlight = 1;
publish(KEYBOARD, {
  GetBrightness: () => backlight,
  GetMaxBrightness: () => 2,
  SetBrightness: level => {
    backlight = level;
  },
}, '/org/freedesktop/UPower/KbdBacklight');
publish(HOSTNAME, {Chassis: 'laptop'}, '/org/freedesktop/hostname1');
publish(SYSTEMD, {Virtualization: ''}, '/org/freedesktop/systemd1');
publish(LOCALE, {X11Layout: 'us', X11Variant: '', X11Options: ''}, '/org/freedesktop/locale1');
publish(CALLS, {Take: () => calls.splice(0)}, '/com/lantharos/KestrelChecks');
publishSecurity(publish, calls);

for (const name of ['org.freedesktop.login1', 'org.freedesktop.UPower', 'org.freedesktop.hostname1', 'org.freedesktop.systemd1',
  'org.freedesktop.locale1', 'com.lantharos.KestrelChecks', ...SECURITY_NAMES])
  Gio.bus_own_name_on_connection(Gio.DBus.system, name, Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
