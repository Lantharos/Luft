import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {shownStyled} from '../../lib/actors.js';
import {ownName, privateConnection} from '../../lib/dbus.js';
import {spawn, type Process} from '../../lib/processes.js';
import {settled, waitUntil, within} from '../../lib/wait.js';

const PROMPTER = ['com.lantharos.Kestrel', '/com/lantharos/Kestrel/KeyringPrompter', 'com.lantharos.Kestrel.KeyringPrompter'] as const;
const PIPE_TIMEOUT = 2000;

let prompts = 0;

type PromptEntries = Record<string, string | boolean>;

export function handle() {
  return `/org/freedesktop/secrets/prompt/check${++prompts}`;
}

function request(entries: PromptEntries) {
  return Object.fromEntries(Object.entries(entries).map(([key, value]) =>
    [key, typeof value === 'boolean' ? new GLib.Variant('b', value) : new GLib.Variant('s', value)]));
}

export const keyringDialog = () => shownStyled('kestrel-keyring-dialog');

export async function openedDialog(label: string) {
  await waitUntil(keyringDialog, label);
  await settled();
  return waitUntil(keyringDialog, label);
}

export async function focusedEntry(dialog: St.Widget) {
  await waitUntil(() => {
    const focus = global.stage.key_focus;
    return focus?.get_parent() instanceof St.Entry && dialog.contains(focus);
  }, 'a field in the prompt takes the keyboard');
}

function invoke<S extends string>(connection: Gio.DBusConnection, method: string, parameters: GLib.Variant, replyType: S | null,
  fdList: Gio.UnixFDList | null = null): Promise<GLib.Variant<S>> {
  return new Promise((resolve, reject) => connection.call_with_unix_fd_list(...PROMPTER, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, fdList, null, (_source, result) => {
      try {
        resolve(connection.call_with_unix_fd_list_finish(result)[0]);
      } catch (error) {
        reject(error);
      }
    }));
}

export class SecretPipe {
  readonly fdList: Gio.UnixFDList;
  private readonly _cat: Process;

  constructor() {
    this._cat = spawn(['cat'], {flags: Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE});
    const stdin = this._cat.get_stdin_pipe();
    if (!(stdin instanceof GioUnix.OutputStream)) throw new Error('The secret pipe has no file descriptor');
    this.fdList = new Gio.UnixFDList();
    this.fdList.append(stdin.get_fd());
    stdin.close(null);
  }

  async read() {
    for (const fd of this.fdList.steal_fds())
      GLib.close(fd);
    await within(this._cat.exited, PIPE_TIMEOUT, 'the keyring closes the secret pipe');
    return new TextDecoder().decode(this._cat.get_stdout_pipe()!.read_bytes(4096, null).toArray());
  }
}

export class KeyringClient {
  private readonly _connection: Gio.DBusConnection;

  constructor() {
    this._connection = privateConnection();
  }

  ownSecretService() {
    return ownName(this._connection, 'org.freedesktop.secrets');
  }

  access(id: string, entries: PromptEntries, connection = this._connection) {
    return invoke(connection, 'Access', new GLib.Variant('(sa{sv})', [id, request(entries)]), '(ua{sv})')
      .then(reply => reply.recursiveUnpack());
  }

  password(id: string, entries: PromptEntries, pipe: SecretPipe) {
    return invoke(this._connection, 'Password', new GLib.Variant('(sa{sv}h)', [id, request(entries), 0]), '(u)', pipe.fdList)
      .then(reply => reply.deepUnpack()[0]);
  }

  close(id: string) {
    return invoke(this._connection, 'Close', new GLib.Variant('(s)', [id]), null);
  }

  destroy() {
    this._connection.close_sync(null);
  }
}
