import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const SIGN_IN = `<node><interface name="com.lantharos.SignIn1">
  <method name="Ways"><arg name="uid" type="u" direction="in"/><arg type="as" direction="out"/></method>
  <method name="Methods">
    <arg type="a(ss)" direction="out"/><arg type="a(ss)" direction="out"/><arg type="b" direction="out"/><arg type="b" direction="out"/>
  </method>
  <method name="FindSecurityKey"><arg type="b" direction="out"/><arg type="b" direction="out"/><arg type="b" direction="out"/></method>
  <method name="AddSecurityKey"><arg name="pin" type="s" direction="in"/><arg type="s" direction="out"/></method>
  <method name="RemoveSecurityKey"><arg name="id" type="s" direction="in"/></method>
  <method name="FindSmartCard"><arg type="b" direction="out"/><arg type="s" direction="out"/></method>
  <method name="AddSmartCard"><arg name="pin" type="s" direction="in"/><arg type="s" direction="out"/></method>
  <method name="RemoveSmartCard"><arg name="id" type="s" direction="in"/></method>
  <method name="SetPasswordSignIn"><arg name="allowed" type="b" direction="in"/></method>
  <signal name="Changed"><arg name="uid" type="u"/></signal>
  <signal name="TouchSecurityKey"><arg name="step" type="u"/></signal>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.SignIn">
  <method name="Set">
    <arg type="s" name="user" direction="in"/><arg type="as" name="ways" direction="in"/><arg type="b" name="password" direction="in"/>
  </method>
</interface></node>`;

export const SIGN_IN_NAME = 'com.lantharos.SignIn1';

const NAMES: Record<number, string> = {2001: 'mara', 2002: 'theo', 2003: 'ines'};
const KEY_PIN = '2468';
const CARD_PIN = '1357';
const TOUCH_TIME = 400;
const ERRORS = 'com.lantharos.SignIn1.Error';

interface Person {
  keys: [string, string][];
  cards: [string, string][];
  password: boolean;
}

/** Answers how people sign in, from what checks set and the fingerprints the reader stand-in keeps. */
export function publishSignIn(publish: Publish, fingers: (user: string) => string[]) {
  const people = new Map<string, Person>();
  const me = GLib.get_user_name();
  const person = (name: string) => {
    if (!people.has(name)) people.set(name, {keys: [], cards: [], password: true});
    return people.get(name)!;
  };
  const others = ({keys, cards}: Person, name: string) => keys.length + cards.length + fingers(name).length > 0;
  let serial = 0;
  const added = (list: [string, string][], name: string) => {
    const id = `enrolled-${++serial}`;
    list.push([id, name]);
    return id;
  };
  const after = (milliseconds: number, then: () => void) => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
    then();
    return GLib.SOURCE_REMOVE;
  });
  const service = publish(SIGN_IN, {
    Ways: (uid: number) => {
      const name = NAMES[uid] ?? me;
      const {keys, cards, password} = person(name);
      const ways = [...(keys.length ? ['security-key'] : []), ...(cards.length ? ['smart-card'] : []), ...(fingers(name).length ? ['fingerprint'] : [])];
      return password || !ways.length ? [...ways, 'password'] : ways;
    },
    Methods: () => {
      const mine = person(me);
      return [mine.keys, mine.cards, mine.password, others(mine, me)];
    },
    FindSecurityKey: () => [true, true, false],
    AddSecurityKeyAsync: ([pin]: [string], invocation: Gio.DBusMethodInvocation) => {
      if (pin !== KEY_PIN) {
        invocation.return_dbus_error(`${ERRORS}.WrongPin`, 'Wrong PIN');
        return;
      }
      service.emit_signal('TouchSecurityKey', new GLib.Variant('(u)', [1]));
      after(TOUCH_TIME, () => {
        service.emit_signal('TouchSecurityKey', new GLib.Variant('(u)', [2]));
        after(TOUCH_TIME, () => invocation.return_value(new GLib.Variant('(s)', [added(person(me).keys, 'YubiKey 5 NFC')])));
      });
    },
    RemoveSecurityKey: (id: string) => {
      const mine = person(me);
      mine.keys = mine.keys.filter(([known]) => known !== id);
      mine.password ||= !others(mine, me);
    },
    FindSmartCard: () => [true, 'Company badge'],
    AddSmartCardAsync: ([pin]: [string], invocation: Gio.DBusMethodInvocation) => {
      if (pin !== CARD_PIN) invocation.return_dbus_error(`${ERRORS}.WrongPin`, 'Wrong PIN');
      else invocation.return_value(new GLib.Variant('(s)', [added(person(me).cards, 'Company badge')]));
    },
    RemoveSmartCard: (id: string) => {
      const mine = person(me);
      mine.cards = mine.cards.filter(([known]) => known !== id);
      mine.password ||= !others(mine, me);
    },
    SetPasswordSignInAsync: ([allowed]: [boolean], invocation: Gio.DBusMethodInvocation) => {
      const mine = person(me);
      if (!allowed && !others(mine, me)) {
        invocation.return_dbus_error(`${ERRORS}.NothingElse`, 'Nothing else signs in');
        return;
      }
      mine.password = allowed;
      invocation.return_value(null);
    },
  }, '/com/lantharos/SignIn1');
  publish(CONTROL, {
    Set: (user: string, ways: string[], password: boolean) => {
      const chosen = person(user);
      chosen.keys = ways.includes('security-key') ? [['set-key', 'Security key']] : [];
      chosen.cards = ways.includes('smart-card') ? [['set-card', 'Smart card']] : [];
      chosen.password = password;
    },
  }, '/com/lantharos/KestrelChecks/SignIn');
}
