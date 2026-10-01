import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {descendants} from '../portal/backend.js';

const PROMPTER = ['com.lantharos.Kestrel', '/com/lantharos/Kestrel/KeyringPrompter', 'com.lantharos.Kestrel.KeyringPrompter'];
const SECRET_SERVICE = 'org.freedesktop.secrets';
const PRIMARY_OWNER = 1;
const DO_NOT_QUEUE = 4;

let prompts = 0;

export function handle() {
  return `/org/freedesktop/secrets/prompt/check${++prompts}`;
}

export function request(entries) {
  return Object.fromEntries(Object.entries(entries).map(([key, value]) =>
    [key, new GLib.Variant(typeof value === 'boolean' ? 'b' : 's', value)]));
}

export function keyringDialog() {
  return descendants(global.stage).find(actor => actor.has_style_class_name?.('kestrel-keyring-dialog') && actor.mapped);
}

export function keyringDialogs() {
  return descendants(global.stage).filter(actor => actor.has_style_class_name?.('kestrel-keyring-dialog') && actor.mapped);
}

function invoke(connection, method, parameters, replyType, fdList = null) {
  return new Promise((resolve, reject) => connection.call_with_unix_fd_list(...PROMPTER, method, parameters,
    replyType && new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, -1, fdList, null, (source, result) => {
      try {
        resolve(source.call_with_unix_fd_list_finish(result)[0]);
      } catch (error) {
        reject(error);
      }
    }));
}

export class SecretPipe {
  constructor() {
    this._cat = Gio.Subprocess.new(['cat'], Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE);
    this.fdList = new Gio.UnixFDList();
    this.fdList.append(this._cat.get_stdin_pipe().get_fd());
    this._cat.get_stdin_pipe().close(null);
  }

  async read(pause) {
    for (const fd of this.fdList.steal_fds())
      GLib.close(fd);
    const exited = new Promise(resolve => this._cat.wait_async(null, () => resolve(true)));
    if (!await Promise.race([exited, pause(2000).then(() => false)])) {
      this._cat.force_exit();
      return null;
    }
    return new TextDecoder().decode(this._cat.get_stdout_pipe().read_bytes(4096, null).toArray());
  }
}

export class KeyringClient {
  constructor() {
    const address = Gio.dbus_address_get_for_bus_sync(Gio.BusType.SESSION, null);
    this._connection = Gio.DBusConnection.new_for_address_sync(address,
      Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  }

  async ownSecretService() {
    const reply = await this._connection.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'RequestName',
      new GLib.Variant('(su)', [SECRET_SERVICE, DO_NOT_QUEUE]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
    return reply.deepUnpack()[0] === PRIMARY_OWNER;
  }

  access(id, entries, connection = this._connection) {
    return invoke(connection, 'Access', new GLib.Variant('(sa{sv})', [id, request(entries)]), '(ua{sv})')
      .then(reply => reply.recursiveUnpack());
  }

  password(id, entries, pipe) {
    return invoke(this._connection, 'Password', new GLib.Variant('(sa{sv}h)', [id, request(entries), 0]), '(u)', pipe.fdList)
      .then(reply => reply.deepUnpack()[0]);
  }

  close(id) {
    return invoke(this._connection, 'Close', new GLib.Variant('(s)', [id]), null);
  }

  destroy() {
    this._connection.close_sync(null);
  }
}
