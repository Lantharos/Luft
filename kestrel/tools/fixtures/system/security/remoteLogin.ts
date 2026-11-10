import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LOGIN_SESSION, remoteSessions} from '../basics.js';
import type {Publish} from '../bus.js';

const REMOTE_LOGIN = `<node><interface name="com.lantharos.RemoteLogin1">
  <property name="Enabled" type="b" access="read"/>
  <property name="PasswordLogin" type="b" access="read"/>
  <property name="PublicNetworks" type="b" access="read"/>
  <property name="Accounts" type="as" access="read"/>
  <property name="HostKeys" type="a(ss)" access="read"/>
  <method name="SetEnabled"><arg name="enabled" type="b" direction="in"/></method>
  <method name="SetPasswordLogin"><arg name="allowed" type="b" direction="in"/></method>
  <method name="SetPublicNetworks"><arg name="allowed" type="b" direction="in"/></method>
  <method name="SetAccountAllowed"><arg name="account" type="s" direction="in"/><arg name="allowed" type="b" direction="in"/></method>
  <method name="AuthorizedKeys"><arg name="keys" type="a(sss)" direction="out"/></method>
  <method name="AddAuthorizedKey"><arg name="key" type="s" direction="in"/><arg name="added" type="(sss)" direction="out"/></method>
  <method name="RemoveAuthorizedKey"><arg name="fingerprint" type="s" direction="in"/></method>
</interface></node>`;
const CONTROL = `<node><interface name="com.lantharos.KestrelChecks.RemoteLogin">
  <method name="SignIn"><arg name="account" type="s" direction="in"/><arg name="address" type="s" direction="in"/></method>
</interface></node>`;
const MINUTE = 60_000_000;

export const REMOTE_LOGIN_NAME = 'com.lantharos.RemoteLogin1';

export function publishRemoteLogin(publish: Publish, calls: string[], login: Gio.DBusExportedObject) {
  const state = {
    Enabled: true,
    PasswordLogin: false,
    PublicNetworks: false,
    Accounts: ['mara'],
    HostKeys: [
      ['ssh-ed25519', 'SHA256:kD3x9mQ7vR2pL8nW4tY6uB1cE5hJ0aZsFgXoVi+Nq0M'],
      ['ecdsa-sha2-nistp256', 'SHA256:Pq2Lw8Hn5Rt1Yx7Kb4Mv9Cz3Dg6Js0Fa+Ue/Wo2Ti8s'],
      ['ssh-rsa', 'SHA256:Xe7Ub3Ni9Ko1Lp5Qm2Rs8Tv4Wy6Zc0Ad/Bf+Gh3Jk7l'],
    ],
  };
  const keys: [string, string, string][] = [
    ['ssh-ed25519', 'mara@phone', 'SHA256:Z8kq2T1vXn4pR6sW9yB3cM5hL0dF7gJaQeUoIiVtYw4'],
    ['sk-ssh-ed25519@openssh.com', 'mara@work-laptop', 'SHA256:Hc5Nm1Qa8Rw3Ls6Tx9Vb2Yd4Fg7Jk0Pz+Ue/Oi5Xr2c'],
  ];
  const remote = publish(REMOTE_LOGIN, {
    get Enabled() { return state.Enabled; },
    get PasswordLogin() { return state.PasswordLogin; },
    get PublicNetworks() { return state.PublicNetworks; },
    get Accounts() { return state.Accounts; },
    get HostKeys() { return state.HostKeys; },
    SetEnabled(enabled: boolean) {
      calls.push(`SetEnabled ${enabled}`);
      changed('Enabled', 'b', enabled);
    },
    SetPasswordLogin(allowed: boolean) {
      calls.push(`SetPasswordLogin ${allowed}`);
      changed('PasswordLogin', 'b', allowed);
    },
    SetPublicNetworks(allowed: boolean) {
      calls.push(`SetPublicNetworks ${allowed}`);
      changed('PublicNetworks', 'b', allowed);
    },
    SetAccountAllowed(account: string, allowed: boolean) {
      calls.push(`SetAccountAllowed ${account} ${allowed}`);
      changed('Accounts', 'as', allowed ? [...state.Accounts, account] : state.Accounts.filter(name => name !== account));
    },
    AuthorizedKeys: () => keys,
    AddAuthorizedKey(key: string) {
      const [kind, , comment = ''] = key.split(' ');
      const added: [string, string, string] = [kind, comment, `SHA256:${GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, key, -1)!.slice(0, 43)}`];
      calls.push(`AddAuthorizedKey ${kind}`);
      keys.push(added);
      return added;
    },
    RemoveAuthorizedKey(fingerprint: string) {
      calls.push(`RemoveAuthorizedKey ${fingerprint}`);
      keys.splice(keys.findIndex(([, , listed]) => listed === fingerprint), 1);
    },
  }, '/com/lantharos/RemoteLogin1');
  const changed = (name: keyof typeof state, type: string, value: boolean | string[]) => {
    Object.assign(state, {[name]: value});
    remote.emit_property_changed(name, new GLib.Variant(type, value));
  };

  let next = 7;
  const signIn = (account: string, address: string, since = GLib.get_real_time()) => {
    const id = `c${next++}`;
    const path = `/org/freedesktop/login1/session/${id}`;
    const session = publish(LOGIN_SESSION, {
      Id: id, Name: account, Service: 'sshd', State: 'online', RemoteHost: address, Timestamp: since, Active: false, LockedHint: false,
      SetLockedHint() {},
    }, path);
    remoteSessions.push({
      id, user: account, path,
      end: () => {
        remoteSessions.splice(remoteSessions.findIndex(listed => listed.id === id), 1);
        session.unexport();
        login.emit_signal('SessionRemoved', new GLib.Variant('(so)', [id, path]));
      },
    });
    login.emit_signal('SessionNew', new GLib.Variant('(so)', [id, path]));
  };
  signIn('mara', '192.168.1.37', GLib.get_real_time() - 25 * MINUTE);
  publish(CONTROL, {SignIn: (account: string, address: string) => signIn(account, address)}, '/com/lantharos/KestrelChecks/RemoteLogin');
}
