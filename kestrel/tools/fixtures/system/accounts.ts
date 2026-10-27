import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {type Color, drawAvatar} from './avatar.js';
import type {Publish} from './bus.js';

const INTERFACES = '/usr/share/dbus-1/interfaces';
const ACCOUNTS_PATH = '/org/freedesktop/Accounts';
const HOUR = 3600;

export const ACCOUNTS_NAME = 'org.freedesktop.Accounts';

const interfaceXml = (name: string) => new TextDecoder().decode(GLib.file_get_contents(`${INTERFACES}/${name}.xml`)[1]);

function avatar(name: string, color: Color) {
  const folder = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel-checks']);
  GLib.mkdir_with_parents(folder, 0o755);
  const path = GLib.build_filenamev([folder, `${name}-avatar.png`]);
  drawAvatar(path, color);
  return path;
}

function user(person: {uid: number; name: string; realName: string; administrator: boolean; loginTime: number; icon: string}) {
  return {
    Uid: person.uid,
    UserName: person.name,
    RealName: person.realName,
    AccountType: person.administrator ? 1 : 0,
    HomeDirectory: GLib.get_home_dir(),
    Shell: '/bin/bash',
    Email: `${person.name}@example.test`,
    Language: 'en_US.UTF-8',
    Languages: ['en_US.UTF-8'],
    Session: 'kestrel',
    SessionType: 'wayland',
    XSession: '',
    Location: '',
    LoginFrequency: 12,
    LoginTime: person.loginTime,
    LoginHistory: [],
    IconFile: person.icon,
    Saved: true,
    Locked: false,
    PasswordMode: 0,
    PasswordHint: '',
    AutomaticLogin: false,
    SystemAccount: false,
    LocalAccount: true,
    UsesHomed: false,
  };
}

export function publishAccounts(publish: Publish) {
  const now = Math.floor(Date.now() / 1000);
  const people = [
    {name: 'mara', realName: 'Mara Lindqvist', uid: new Gio.Credentials().get_unix_user(), loginTime: now - HOUR, administrator: true,
      icon: avatar('mara', [0.93, 0.56, 0.32])},
    {name: 'theo', realName: 'Theo Brandt', uid: 2002, loginTime: now - 90 * HOUR, administrator: false, icon: ''},
  ].map(person => ({...person, path: `${ACCOUNTS_PATH}/User${person.uid}`}));
  for (const person of people) {
    const account = {
      ...user(person),
      SetLanguage: (language: string) => {
        account.Language = language;
        exported.emit_property_changed('Language', new GLib.Variant('s', language));
        exported.flush();
        exported.emit_signal('Changed', null);
      },
    };
    const exported = publish(interfaceXml('org.freedesktop.Accounts.User'), account, person.path);
  }
  const [me] = people;
  const found = (person: {path: string} | undefined, key: string | number) => {
    if (!person) throw new Error(`No such user: ${key}`);
    return person.path;
  };
  publish(interfaceXml('org.freedesktop.Accounts'), {
    DaemonVersion: '26',
    HasNoUsers: false,
    HasMultipleUsers: true,
    AutomaticLoginUsers: [],
    ListCachedUsers: () => people.map(person => person.path),
    FindUserByName: (name: string) => found(name === GLib.get_user_name() ? me : people.find(person => person.name === name), name),
    FindUserById: (uid: number) => found(people.find(person => person.uid === uid), uid),
    GetUsersLanguages: () => ['en_US.UTF-8'],
  }, ACCOUNTS_PATH);
}
