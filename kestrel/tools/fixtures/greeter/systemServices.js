import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const [images, events] = ARGV;
const INTERFACES = '/usr/share/dbus-1/interfaces';
const ACCOUNTS_PATH = '/org/freedesktop/Accounts';
const HOUR = 3600;

const now = Math.floor(Date.now() / 1000);
const people = [
  {name: 'kristof', realName: 'Kristof Imeri', uid: new Gio.Credentials().get_unix_user(), loginTime: now - HOUR, session: 'kestrel'},
  {name: 'ayesha', realName: 'Ayesha Khan', uid: 2001, loginTime: now - 30 * HOUR, session: 'sway'},
  {name: 'sam', realName: 'Sam Rivera', uid: 2002, loginTime: now - 90 * HOUR, session: ''},
];

const interfaceXml = name => Gio.DBusNodeInfo
  .new_for_xml(new TextDecoder().decode(GLib.file_get_contents(`${INTERFACES}/${name}.xml`)[1]))
  .lookup_interface(name);

const published = [];

function publish(interfaceName, implementation, path) {
  const exported = Gio.DBusExportedObject.wrapJSObject(interfaceXml(interfaceName), implementation);
  exported.export(Gio.DBus.system, path);
  published.push(exported);
  return exported;
}

function record(event) {
  const stream = Gio.File.new_for_path(events).append_to(Gio.FileCreateFlags.NONE, null);
  stream.write_all(new TextEncoder().encode(`${JSON.stringify(event)}\n`), null);
  stream.close(null);
}

function exportUser(person) {
  const avatar = `${images}/${person.name}-avatar.png`;
  const user = {
    Uid: person.uid,
    UserName: person.name,
    RealName: person.realName,
    AccountType: 0,
    HomeDirectory: `/home/${person.name}`,
    Shell: '/bin/bash',
    Email: '',
    Language: '',
    Languages: [],
    Session: person.session,
    SessionType: person.session ? 'wayland' : '',
    XSession: '',
    Location: '',
    LoginFrequency: 12,
    LoginTime: person.loginTime,
    LoginHistory: [],
    IconFile: GLib.file_test(avatar, GLib.FileTest.EXISTS) ? avatar : '',
    Saved: true,
    Locked: false,
    PasswordMode: 0,
    PasswordHint: '',
    AutomaticLogin: false,
    SystemAccount: false,
    LocalAccount: true,
    UsesHomed: false,
    SetSession(session) {
      user.Session = session;
      record({type: 'remembered-session', user: person.name, session});
      exported.emit_signal('Changed', null);
    },
    SetSessionType(type) {
      user.SessionType = type;
    },
  };
  person.path = `${ACCOUNTS_PATH}/User${person.uid}`;
  const exported = publish('org.freedesktop.Accounts.User', user, person.path);
}

people.forEach(exportUser);

const byName = name => people.find(person => person.name === name);
publish('org.freedesktop.Accounts', {
  DaemonVersion: '26',
  HasNoUsers: false,
  HasMultipleUsers: true,
  AutomaticLoginUsers: [],
  ListCachedUsers: () => people.map(person => person.path),
  FindUserByName: name => {
    const person = byName(name);
    if (!person)
      throw new Error(`No such user: ${name}`);
    return person.path;
  },
  FindUserById: uid => people.find(person => person.uid === uid).path,
  GetUsersLanguages: () => [],
}, ACCOUNTS_PATH);

publish('org.freedesktop.login1.Manager', {
  CanSuspend: () => 'yes',
  CanReboot: () => 'yes',
  CanPowerOff: () => 'yes',
  Suspend: () => record({type: 'power', action: 'suspend'}),
  Reboot: () => record({type: 'power', action: 'reboot'}),
  PowerOffAsync: (_parameters, invocation) => {
    record({type: 'power', action: 'power-off'});
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
      invocation.return_dbus_error('org.freedesktop.login1.BlockedByInhibitorLock', 'Powering off is inhibited');
      return GLib.SOURCE_REMOVE;
    });
  },
}, '/org/freedesktop/login1');

publish('org.freedesktop.locale1', {
  Locale: ['LANG=en_US.UTF-8'],
  VConsoleKeymap: 'us',
  VConsoleKeymapToggle: '',
  X11Layout: 'us,de',
  X11Model: '',
  X11Variant: ',',
  X11Options: '',
}, '/org/freedesktop/locale1');

for (const name of ['org.freedesktop.Accounts', 'org.freedesktop.login1', 'org.freedesktop.locale1'])
  Gio.bus_own_name_on_connection(Gio.DBus.system, name, Gio.BusNameOwnerFlags.NONE, null, null);

new GLib.MainLoop(null, false).run();
