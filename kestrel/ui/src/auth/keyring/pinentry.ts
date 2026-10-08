import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { promptKey, stealFd } from './prompter.js';
import type { PromptQueue } from './queue.js';
import { accessRequest, passwordRequest, type Options } from './request.js';

Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');
Gio._promisify(Gio.DataInputStream.prototype, 'read_line_async');

const PINENTRY_XML = `<node>
  <interface name="com.lantharos.Kestrel.Pinentry">
    <method name="Password">
      <arg type="s" name="handle" direction="in"/>
      <arg type="a{sv}" name="request" direction="in"/>
      <arg type="h" name="channel" direction="in"/>
      <arg type="u" name="response" direction="out"/>
      <arg type="a{sv}" name="results" direction="out"/>
    </method>
    <method name="Confirm">
      <arg type="s" name="handle" direction="in"/>
      <arg type="a{sv}" name="request" direction="in"/>
      <arg type="u" name="response" direction="out"/>
    </method>
    <method name="Close">
      <arg type="s" name="handle" direction="in"/>
    </method>
  </interface>
</node>`;
const PINENTRY_PATH = '/com/lantharos/Kestrel/Pinentry';
const DEFAULT_ICON = 'dialog-password-symbolic';

type Invocation = Gio.DBusMethodInvocation;

class Channel {
  private readonly connection: Gio.SocketConnection;
  private readonly replies: Gio.DataInputStream;
  private asking = Promise.resolve(0);

  constructor(fd: number) {
    this.connection = Gio.Socket.new_from_fd(fd).connection_factory_create_connection();
    this.replies = new Gio.DataInputStream({ base_stream: this.connection.get_input_stream() });
  }

  private async send(kind: string, text: string): Promise<void> {
    const bytes = new TextEncoder().encode(text);
    const output = this.connection.get_output_stream();
    await output.write_all_async(new TextEncoder().encode(`${kind}${bytes.length}\n`), GLib.PRIORITY_DEFAULT, null);
    await output.write_all_async(bytes, GLib.PRIORITY_DEFAULT, null);
  }

  measure(secret: string): Promise<number> {
    this.asking = this.asking.then(async () => {
      await this.send('Q', secret);
      const [line] = await this.replies.read_line_async(GLib.PRIORITY_DEFAULT, null);
      return Number(new TextDecoder().decode(line ?? new Uint8Array())) || 0;
    });
    return this.asking;
  }

  async deliver(secret: string): Promise<void> {
    await this.asking.catch(() => 0);
    await this.send('P', secret);
  }

  close(): void {
    this.connection.close(null);
  }
}

function withIcon(options: Options): Options {
  return { icon: new GLib.Variant('s', DEFAULT_ICON), ...options };
}

export class PinentryPrompter {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(PINENTRY_XML, this);
  private incoming = Promise.resolve();

  constructor(private readonly queue: PromptQueue) {
    this.dbus.export(Gio.DBus.session, PINENTRY_PATH);
  }

  PasswordAsync([handle, options, index]: [string, Options, number], invocation: Invocation, fdList: Gio.UnixFDList | null): void {
    this.serialize(() => {
      const fd = stealFd(fdList, index);
      if (fd === null) {
        invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', 'The passphrase needs a channel to be handed over');
        return;
      }
      const channel = new Channel(fd);
      this.queue.receive({
        key: promptKey(invocation, handle),
        prompt: { kind: 'password', request: passwordRequest(withIcon(options)) },
        answer: (response, remember) => {
          channel.close();
          invocation.return_value(new GLib.Variant('(ua{sv})', [response, { remember: new GLib.Variant('b', remember) }]));
        },
        deliver: secret => channel.deliver(secret),
        measure: secret => channel.measure(secret),
      });
    });
  }

  ConfirmAsync([handle, options]: [string, Options], invocation: Invocation): void {
    this.serialize(() => this.queue.receive({
      key: promptKey(invocation, handle),
      prompt: { kind: 'access', request: accessRequest(withIcon(options)) },
      answer: response => invocation.return_value(new GLib.Variant('(u)', [response])),
      deliver: () => Promise.resolve(),
    }));
  }

  CloseAsync([handle]: [string], invocation: Invocation): void {
    this.serialize(() => {
      this.queue.close(promptKey(invocation, handle));
      invocation.return_value(null);
    });
  }

  private serialize(step: () => void): void {
    this.incoming = this.incoming.then(async () => {
      await this.queue.ready();
      step();
    }).catch(error => console.error('Kestrel could not show a passphrase prompt', error));
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
