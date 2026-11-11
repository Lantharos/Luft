import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from './bus.js';
import {publishUpower} from './devices/upower.js';

const LOGIN = `<node><interface name="org.freedesktop.login1.Manager">
  <method name="Reboot"><arg type="b" direction="in"/></method>
  <method name="Inhibit">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="h" direction="out"/>
  </method>
  <method name="Suspend"><arg type="b" direction="in"/></method>
  <method name="Hibernate"><arg type="b" direction="in"/></method>
  <method name="PowerOff"><arg type="b" direction="in"/></method>
  <method name="SuspendWithFlags"><arg type="t" direction="in"/></method>
  <method name="HibernateWithFlags"><arg type="t" direction="in"/></method>
  <method name="PowerOffWithFlags"><arg type="t" direction="in"/></method>
  <method name="CanPowerOff"><arg type="s" direction="out"/></method>
  <method name="CanReboot"><arg type="s" direction="out"/></method>
  <method name="CanSuspend"><arg type="s" direction="out"/></method>
  <method name="CanHibernate"><arg type="s" direction="out"/></method>
  <method name="GetUser"><arg type="u" direction="in"/><arg type="o" direction="out"/></method>
  <method name="GetSession"><arg type="s" direction="in"/><arg type="o" direction="out"/></method>
  <method name="ListSessions"><arg type="a(susso)" direction="out"/></method>
  <method name="TerminateSession"><arg type="s" direction="in"/></method>
  <property name="LidClosed" type="b" access="read"/>
  <signal name="PrepareForSleep"><arg type="b"/></signal>
  <signal name="SessionNew"><arg type="s"/><arg type="o"/></signal>
  <signal name="SessionRemoved"><arg type="s"/><arg type="o"/></signal>
</interface></node>`;
const LOGIN_CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Login">
  <method name="SetLidClosed"><arg type="b" direction="in"/></method>
  <method name="PrepareForSleep"><arg type="b" direction="in"/></method>
  <method name="SetCanHibernate"><arg type="s" direction="in"/></method>
  <method name="SetSleepRefused"><arg type="b" direction="in"/></method>
  <method name="SetRestartRefused"><arg type="b" direction="in"/></method>
</interface></node>`;
const LOGIN_USER = `<node><interface name="org.freedesktop.login1.User">
  <property name="Display" type="(so)" access="read"/>
</interface></node>`;
export const LOGIN_SESSION = `<node><interface name="org.freedesktop.login1.Session">
  <property name="Id" type="s" access="read"/>
  <property name="Name" type="s" access="read"/>
  <property name="Service" type="s" access="read"/>
  <property name="State" type="s" access="read"/>
  <property name="RemoteHost" type="s" access="read"/>
  <property name="Timestamp" type="t" access="read"/>
  <property name="Active" type="b" access="read"/>
  <property name="LockedHint" type="b" access="read"/>
  <method name="SetLockedHint"><arg type="b" direction="in"/></method>
  <signal name="Lock"/>
  <signal name="Unlock"/>
</interface></node>`;
const POLKIT = `<node><interface name="org.freedesktop.PolicyKit1.Authority">
  <method name="CheckAuthorization">
    <arg type="(sa{sv})" direction="in"/><arg type="s" direction="in"/><arg type="a{ss}" direction="in"/><arg type="u" direction="in"/>
    <arg type="s" direction="in"/><arg type="(bba{ss})" direction="out"/>
  </method>
  <method name="RegisterAuthenticationAgent"><arg type="(sa{sv})" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="UnregisterAuthenticationAgent"><arg type="(sa{sv})" direction="in"/><arg type="s" direction="in"/></method>
  <property name="BackendName" type="s" access="read"/>
  <property name="BackendVersion" type="s" access="read"/>
  <property name="BackendFeatures" type="u" access="read"/>
  <signal name="Changed"/>
</interface></node>`;
const WATCHDOG = `<node><interface name="com.lantharos.Kestrel.Watchdog1">
  <method name="Report"><arg type="t" direction="in"/><arg type="u" direction="in"/></method>
</interface></node>`;
const KEYBOARD = `<node><interface name="org.freedesktop.UPower.KbdBacklight">
  <method name="GetBrightness"><arg type="i" direction="out"/></method>
  <method name="GetMaxBrightness"><arg type="i" direction="out"/></method>
  <method name="SetBrightness"><arg type="i" direction="in"/></method>
  <signal name="BrightnessChangedWithSource"><arg type="i"/><arg type="s"/></signal>
</interface></node>`;
const HOSTNAME = `<node><interface name="org.freedesktop.hostname1">
  <property name="Chassis" type="s" access="read"/>
  <property name="Hostname" type="s" access="read"/>
  <property name="StaticHostname" type="s" access="read"/>
  <property name="PrettyHostname" type="s" access="read"/>
</interface></node>`;
const SYSTEMD = `<node><interface name="org.freedesktop.systemd1.Manager">
  <property name="Virtualization" type="s" access="read"/>
</interface></node>`;
const LOCALE = `<node><interface name="org.freedesktop.locale1">
  <property name="X11Layout" type="s" access="read"/>
  <property name="X11Variant" type="s" access="read"/>
  <property name="X11Options" type="s" access="read"/>
  <method name="SetX11Keyboard">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="b" direction="in"/><arg type="b" direction="in"/>
  </method>
</interface></node>`;
const TIME = `<node><interface name="org.freedesktop.timedate1">
  <property name="Timezone" type="s" access="read"/>
  <method name="SetTimezone"><arg type="s" direction="in"/><arg type="b" direction="in"/></method>
</interface></node>`;

export const BASIC_NAMES = ['org.freedesktop.login1', 'org.freedesktop.UPower', 'org.freedesktop.UPower.PowerProfiles', 'org.freedesktop.hostname1', 'org.freedesktop.systemd1',
  'org.freedesktop.locale1', 'org.freedesktop.timedate1', 'org.freedesktop.PolicyKit1', 'com.lantharos.Kestrel.Watchdog1'];

export interface RemoteSession {
  id: string;
  user: string;
  path: string;
  end: () => void;
}

export const remoteSessions: RemoteSession[] = [];

const SESSION_ID = 'c1';
const SESSION_PATH = `/org/freedesktop/login1/session/${SESSION_ID}`;
const inhibitors = new Set<Gio.SocketConnection>();

function unixSocket() {
  return Gio.Socket.new(Gio.SocketFamily.UNIX, Gio.SocketType.STREAM, Gio.SocketProtocol.DEFAULT);
}

function connectedPair(): [Gio.Socket, Gio.Socket] {
  const address = new Gio.UnixSocketAddress({path: `kestrel-checks-inhibitor-${GLib.uuid_string_random()}`,
    address_type: Gio.UnixSocketAddressType.ABSTRACT});
  const listener = unixSocket();
  listener.bind(address, true);
  listener.listen();
  const given = unixSocket();
  given.connect(address, null);
  const held = listener.accept(null);
  listener.close();
  return [given, held];
}

export function answerInhibit(invocation: Gio.DBusMethodInvocation, released: () => void) {
  const [given, held] = connectedPair();
  followRelease(held, released);
  const descriptors = new Gio.UnixFDList();
  invocation.return_value_with_unix_fd_list(new GLib.Variant('(h)', [descriptors.append(given.get_fd())]), descriptors);
  given.close();
}

function followRelease(held: Gio.Socket, released: () => void) {
  const connection = held.connection_factory_create_connection();
  inhibitors.add(connection);
  connection.get_input_stream().read_bytes_async(1, GLib.PRIORITY_DEFAULT, null, (stream, result) => {
    stream!.read_bytes_finish(result);
    inhibitors.delete(connection);
    connection.close(null);
    released();
  });
}

export function publishBasics(publish: Publish, calls: string[]) {
  const uid = new Gio.Credentials().get_unix_user();
  let lidClosed = false;
  let canHibernate = 'na';
  let sleepRefused = false;
  let restartRefused = false;
  const login = publish(LOGIN, {
    InhibitAsync([what, , , mode]: string[], invocation: Gio.DBusMethodInvocation) {
      calls.push(`Inhibit ${what} ${mode}`);
      answerInhibit(invocation, () => calls.push(`Release ${what} ${mode}`));
    },
    Suspend: () => calls.push('Suspend'),
    Hibernate: () => calls.push('Hibernate'),
    PowerOff: () => calls.push('PowerOff'),
    SuspendWithFlags() {
      if (sleepRefused) throw new Error('The firmware refused to suspend');
      calls.push('Suspend');
    },
    HibernateWithFlags: () => calls.push('Hibernate'),
    PowerOffWithFlags: () => calls.push('PowerOff'),
    Reboot() {
      calls.push('Reboot');
      if (restartRefused) throw new Error('The computer refused to restart');
    },
    CanPowerOff: () => 'yes',
    CanReboot: () => 'yes',
    CanSuspend: () => 'yes',
    CanHibernate: () => canHibernate,
    GetUser: () => '/org/freedesktop/login1/user/self',
    GetSession: () => SESSION_PATH,
    ListSessions: () => [[SESSION_ID, uid, 'mara', 'seat0', SESSION_PATH], ...remoteSessions.map(({id, user, path}) => [id, uid, user, '', path])],
    TerminateSession(id: string) {
      calls.push(`TerminateSession ${id}`);
      remoteSessions.find(session => session.id === id)?.end();
    },
    get LidClosed() { return lidClosed; },
  }, '/org/freedesktop/login1');
  publish(LOGIN_CONTROL, {
    SetLidClosed: (closed: boolean) => {
      lidClosed = closed;
      login.emit_property_changed('LidClosed', new GLib.Variant('b', closed));
    },
    PrepareForSleep: (sleeping: boolean) => login.emit_signal('PrepareForSleep', new GLib.Variant('(b)', [sleeping])),
    SetCanHibernate: (answer: string) => {
      canHibernate = answer;
    },
    SetSleepRefused: (refused: boolean) => {
      sleepRefused = refused;
    },
    SetRestartRefused: (refused: boolean) => {
      restartRefused = refused;
    },
  }, '/com/lantharos/KestrelChecks/Login');
  publish(LOGIN_USER, {Display: [SESSION_ID, SESSION_PATH]}, '/org/freedesktop/login1/user/self');
  let lockedHint = false;
  const session = publish(LOGIN_SESSION, {
    Id: SESSION_ID,
    Name: 'mara',
    Service: 'greetd',
    State: 'active',
    RemoteHost: '',
    Timestamp: GLib.get_real_time(),
    Active: true,
    get LockedHint() { return lockedHint; },
    SetLockedHint: (locked: boolean) => {
      lockedHint = locked;
      session.emit_property_changed('LockedHint', new GLib.Variant('b', locked));
    },
  }, SESSION_PATH);
  publish(POLKIT, {
    CheckAuthorization: () => [true, false, {}],
    RegisterAuthenticationAgent() {},
    UnregisterAuthenticationAgent() {},
    BackendName: 'kestrel-checks',
    BackendVersion: '1',
    BackendFeatures: 0,
  }, '/org/freedesktop/PolicyKit1/Authority');
  publish(WATCHDOG, {Report: (_stalledMs: number, compositor: number) => calls.push(`Report ${compositor}`)}, '/com/lantharos/Kestrel/Watchdog1');

  publishUpower(publish, calls);
  let backlight = 1;
  publish(KEYBOARD, {
    GetBrightness: () => backlight,
    GetMaxBrightness: () => 2,
    SetBrightness: (level: number) => {
      backlight = level;
    },
  }, '/org/freedesktop/UPower/KbdBacklight');
  publish(HOSTNAME, {Chassis: 'laptop', Hostname: 'mara-laptop', StaticHostname: 'mara-laptop', PrettyHostname: 'Mara’s Laptop'}, '/org/freedesktop/hostname1');
  publish(SYSTEMD, {Virtualization: ''}, '/org/freedesktop/systemd1');
  publish(LOCALE, {
    X11Layout: 'us',
    X11Variant: '',
    X11Options: '',
    SetX11Keyboard: (layout: string, _model: string, variant: string) => calls.push(`SetX11Keyboard ${layout} ${variant}`),
  }, '/org/freedesktop/locale1');
  publish(TIME, {Timezone: 'UTC', SetTimezone: (zone: string) => calls.push(`SetTimezone ${zone}`)}, '/org/freedesktop/timedate1');
  return login;
}
