import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

import type { PromptQueue } from './queue.js';
import { accessRequest, passwordRequest, type Options } from './request.js';

Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');

const PROMPTER_XML = `<node>
  <interface name="com.lantharos.Kestrel.KeyringPrompter">
    <method name="Access">
      <arg type="s" name="handle" direction="in"/>
      <arg type="a{sv}" name="request" direction="in"/>
      <arg type="u" name="response" direction="out"/>
      <arg type="a{sv}" name="results" direction="out"/>
    </method>
    <method name="Password">
      <arg type="s" name="handle" direction="in"/>
      <arg type="a{sv}" name="request" direction="in"/>
      <arg type="h" name="secret" direction="in"/>
      <arg type="u" name="response" direction="out"/>
    </method>
    <method name="Close">
      <arg type="s" name="handle" direction="in"/>
    </method>
  </interface>
</node>`;
const PROMPTER_PATH = '/com/lantharos/Kestrel/KeyringPrompter';
const SECRET_SERVICE = 'org.freedesktop.secrets';

type Invocation = Gio.DBusMethodInvocation;

export function stealFd(fdList: Gio.UnixFDList | null, index: number): number | null {
  const fds = fdList?.steal_fds() ?? [];
  for (const [position, fd] of fds.entries())
    if (position !== index) GLib.close(fd);
  return index < fds.length ? fds[index] : null;
}

export function promptKey(invocation: Invocation, handle: string): string {
  return `${invocation.get_sender()} ${handle}`;
}

function refuse(invocation: Invocation): void {
  invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', 'The secret needs a file descriptor to be written to');
}

export class KeyringPrompter {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(PROMPTER_XML, this);
  private incoming = Promise.resolve();

  constructor(private readonly queue: PromptQueue) {
    this.dbus.export(Gio.DBus.session, PROMPTER_PATH);
  }

  AccessAsync([handle, options]: [string, Options], invocation: Invocation): void {
    this.serialize(invocation, () => this.queue.receive({
      key: promptKey(invocation, handle),
      prompt: { kind: 'access', request: accessRequest(options) },
      answer: (response, remember) => invocation.return_value(new GLib.Variant('(ua{sv})', [response, { remember: new GLib.Variant('b', remember) }])),
      deliver: () => Promise.resolve(),
    }));
  }

  PasswordAsync([handle, options, index]: [string, Options, number], invocation: Invocation, fdList: Gio.UnixFDList | null): void {
    this.serialize(invocation, () => {
      const fd = stealFd(fdList, index);
      if (fd === null) {
        refuse(invocation);
        return;
      }
      const secret = new GioUnix.OutputStream({ fd, close_fd: true });
      this.queue.receive({
        key: promptKey(invocation, handle),
        prompt: { kind: 'password', request: passwordRequest(options) },
        answer: response => {
          secret.close(null);
          invocation.return_value(new GLib.Variant('(u)', [response]));
        },
        deliver: async typed => {
          await secret.write_all_async(new TextEncoder().encode(typed), GLib.PRIORITY_DEFAULT, null);
        },
      });
    });
  }

  CloseAsync([handle]: [string], invocation: Invocation): void {
    this.serialize(invocation, () => {
      this.queue.close(promptKey(invocation, handle));
      invocation.return_value(null);
    });
  }

  private serialize(invocation: Invocation, step: () => void): void {
    this.incoming = this.incoming.then(async () => {
      await this.queue.ready();
      if (await this.authorized(invocation)) step();
      else invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'Only the keyring can ask for passwords');
    }).catch(error => console.error('Kestrel could not show a keyring prompt', error));
  }

  private async authorized(invocation: Invocation): Promise<boolean> {
    if ((global as unknown as Shell.Global).context.unsafe_mode) return true;
    try {
      const owner = await invocation.get_connection().call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus',
        'GetNameOwner', new GLib.Variant('(s)', [SECRET_SERVICE]), new GLib.VariantType('(s)'), Gio.DBusCallFlags.NONE, -1, null);
      return owner.deepUnpack<[string]>()[0] === invocation.get_sender();
    } catch {
      return false;
    }
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
