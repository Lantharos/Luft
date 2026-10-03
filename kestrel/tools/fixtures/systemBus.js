import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {publishSecurity, SECURITY_NAMES} from './security.js';
import {publishUdisks} from './udisks/service.js';

const LOGIN = `<node><interface name="org.freedesktop.login1.Manager">
  <method name="Inhibit">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="h" direction="out"/>
  </method>
  <method name="Suspend"><arg type="b" direction="in"/></method>
  <method name="Hibernate"><arg type="b" direction="in"/></method>
  <method name="PowerOff"><arg type="b" direction="in"/></method>
  <method name="GetUser"><arg type="u" direction="in"/><arg type="o" direction="out"/></method>
  <property name="LidClosed" type="b" access="read"/>
  <signal name="PrepareForSleep"><arg type="b"/></signal>
</interface></node>`;
const LOGIN_USER = `<node><interface name="org.freedesktop.login1.User">
  <property name="Display" type="(so)" access="read"/>
</interface></node>`;
const LOGIN_SESSION = `<node><interface name="org.freedesktop.login1.Session">
  <property name="Active" type="b" access="read"/>
</interface></node>`;
const WATCHDOG = `<node><interface name="com.lantharos.Kestrel.Watchdog1">
  <method name="Report"><arg type="t" direction="in"/><arg type="u" direction="in"/></method>
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
  return exported;
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
  GetUser: () => '/org/freedesktop/login1/user/self',
  LidClosed: false,
}, '/org/freedesktop/login1');
publish(LOGIN_USER, {Display: ['c1', '/org/freedesktop/login1/session/c1']}, '/org/freedesktop/login1/user/self');
publish(LOGIN_SESSION, {Active: true}, '/org/freedesktop/login1/session/c1');
publish(WATCHDOG, {Report: (_stalledMs, compositor) => calls.push(`Report ${compositor}`)}, '/com/lantharos/Kestrel/Watchdog1');

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
publishSecurity(publish, calls, publishUdisks(calls));

for (const name of ['org.freedesktop.login1', 'org.freedesktop.UPower', 'org.freedesktop.hostname1', 'org.freedesktop.systemd1',
  'org.freedesktop.locale1', 'com.lantharos.Kestrel.Watchdog1', 'com.lantharos.KestrelChecks', 'org.freedesktop.UDisks2', ...SECURITY_NAMES])
  Gio.bus_own_name_on_connection(Gio.DBus.system, name, Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
