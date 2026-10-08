import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {shownStyled} from '../../lib/actors.js';
import {ownName, privateConnection} from '../../lib/dbus.js';
import {spawn} from '../../lib/processes.js';
import {settled, waitUntil, within} from '../../lib/wait.js';

const PROMPTER = ['com.lantharos.Kestrel', '/com/lantharos/Kestrel/KeyringPrompter', 'com.lantharos.Kestrel.KeyringPrompter'];
const PIPE_TIMEOUT = 2000;

let prompts = 0;

export function handle() {
  return `/org/freedesktop/secrets/prompt/check${++prompts}`;
}

function request(entries) {
  return Object.fromEntries(Object.entries(entries).map(([key, value]) =>
    [key, new GLib.Variant(typeof value === 'boolean' ? 'b' : 's', value)]));
}

export const keyringDialog = () => shownStyled('kestrel-keyring-dialog');

export async function openedDialog(label) {
  await waitUntil(keyringDialog, label);
  await settled();
  return keyringDialog();
}

export async function focusedEntry(dialog) {
  await waitUntil(() => {
    const focus = global.stage.key_focus;
    return focus?.get_parent() instanceof St.Entry && dialog.contains(focus);
  }, 'a field in the prompt takes the keyboard');
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
    this._cat = spawn(['cat'], {flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE});
    this.fdList = new Gio.UnixFDList();
    this.fdList.append(this._cat.get_stdin_pipe().get_fd());
    this._cat.get_stdin_pipe().close(null);
  }

  async read() {
    for (const fd of this.fdList.steal_fds())
      GLib.close(fd);
    await within(this._cat.exited, PIPE_TIMEOUT, 'the keyring closes the secret pipe');
    return new TextDecoder().decode(this._cat.get_stdout_pipe().read_bytes(4096, null).toArray());
  }
}

export class KeyringClient {
  constructor() {
    this._connection = privateConnection();
  }

  ownSecretService() {
    return ownName(this._connection, 'org.freedesktop.secrets');
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
