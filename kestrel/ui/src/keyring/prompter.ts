import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

import type { Context } from '../context.js';
import { KeyringDialog, loadDialogModules, type DialogModules, type Prompt } from './dialog.js';
import { ALLOWED, DENIED, DISMISSED, accessRequest, passwordRequest } from './request.js';

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

type Options = Record<string, GLib.Variant>;
type Invocation = Gio.DBusMethodInvocation;
type Session = Pick<Context, 'sessionMode' | 'screenShield'>;

interface Call {
  handle: string;
  prompt: Prompt;
  invocation: Invocation;
  secret: GioUnix.OutputStream | null;
}

interface Active {
  handle: string;
  dialog: KeyringDialog | null;
  pending: Call | null;
  closing: boolean;
}

function reply({ prompt, invocation, secret }: Call, response: number, remember = false): void {
  secret?.close(null);
  if (prompt.kind === 'access')
    invocation.return_value(new GLib.Variant('(ua{sv})', [response, { remember: new GLib.Variant('b', remember) }]));
  else
    invocation.return_value(new GLib.Variant('(u)', [response]));
}

function secretStream(fdList: Gio.UnixFDList | null, index: number): GioUnix.OutputStream | null {
  const fds = fdList?.steal_fds() ?? [];
  for (const [position, fd] of fds.entries())
    if (position !== index) GLib.close(fd);
  return index < fds.length ? new GioUnix.OutputStream({ fd: fds[index], close_fd: true }) : null;
}

export class KeyringPrompter {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(PROMPTER_XML, this);
  private readonly queue: Call[] = [];
  private readonly refused = new Set<string>();
  private readonly disconnectors: (() => void)[] = [];
  private active: Active | null = null;
  private modules: DialogModules | null = null;
  private incoming = Promise.resolve();

  constructor(private readonly session: Session) {
    this.dbus.export(Gio.DBus.session, PROMPTER_PATH);
    const sessionId = session.sessionMode.connect('updated', () => this.syncLock());
    this.disconnectors.push(() => session.sessionMode.disconnect(sessionId));
    const shield = session.screenShield;
    if (shield) {
      const shieldId = shield.connect('active-changed', () => this.syncLock());
      this.disconnectors.push(() => shield.disconnect(shieldId));
    }
  }

  AccessAsync([handle, options]: [string, Options], invocation: Invocation): void {
    this.serialize(invocation, () => this.receive({ handle, prompt: { kind: 'access', request: accessRequest(options) }, invocation, secret: null }));
  }

  PasswordAsync([handle, options, index]: [string, Options, number], invocation: Invocation, fdList: Gio.UnixFDList | null): void {
    this.serialize(invocation, () => {
      const secret = secretStream(fdList, index);
      if (secret) this.receive({ handle, prompt: { kind: 'password', request: passwordRequest(options) }, invocation, secret });
      else invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', 'The secret needs a file descriptor to be written to');
    });
  }

  CloseAsync([handle]: [string], invocation: Invocation): void {
    this.serialize(invocation, () => {
      this.refused.delete(handle);
      if (this.active?.handle === handle) this.dismiss(this.active);
      for (const call of this.queue.filter(call => call.handle === handle)) {
        this.queue.splice(this.queue.indexOf(call), 1);
        reply(call, DISMISSED);
      }
      invocation.return_value(null);
    });
  }

  private serialize(invocation: Invocation, step: () => void): void {
    this.incoming = this.incoming.then(async () => {
      this.modules ??= await loadDialogModules();
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

  private get locked(): boolean {
    return this.session.sessionMode.isLocked || !!this.session.screenShield?.active;
  }

  private receive(call: Call): void {
    const { active } = this;
    if (call.prompt.kind === 'password' && this.refused.delete(call.handle)) {
      reply(call, DENIED);
    } else if (active?.handle === call.handle && !active.closing && call.prompt.kind === 'password' && active.dialog?.kind === 'password') {
      if (active.pending) reply(active.pending, DISMISSED);
      active.pending = call;
      active.dialog.retry(call.prompt.request);
    } else if (active?.handle === call.handle && !active.closing) {
      this.queue.unshift(call);
      this.dismiss(active);
    } else {
      this.queue.push(call);
      this.next();
    }
  }

  private next(): void {
    if (this.active || this.locked) return;
    const call = this.queue.shift();
    if (call) this.show(call);
  }

  private show(call: Call): void {
    const active: Active = { handle: call.handle, dialog: null, pending: call, closing: false };
    this.active = active;
    active.dialog = KeyringDialog.open(this.modules!, call.prompt, {
      allowed: remember => this.respond(active, ALLOWED, remember),
      denied: () => {
        if (!active.pending) this.refused.add(active.handle);
        this.respond(active, DENIED, active.dialog?.remembered);
      },
      entered: secret => this.enter(active, secret),
      closed: () => this.finished(active),
    });
    if (!active.dialog) this.finished(active);
  }

  private respond(active: Active, response: number, remember = false): void {
    if (active.pending) reply(active.pending, response, remember);
    active.pending = null;
    active.closing = true;
    active.dialog?.close();
  }

  private dismiss(active: Active): void {
    this.respond(active, DISMISSED, active.dialog?.remembered);
  }

  private async enter(active: Active, secret: string): Promise<void> {
    const call = active.pending!;
    active.pending = null;
    try {
      await call.secret!.write_all_async(new TextEncoder().encode(secret), GLib.PRIORITY_DEFAULT, null);
      reply(call, ALLOWED);
    } catch (error) {
      console.warn(`Kestrel could not hand the password to the keyring: ${error}`);
      reply(call, DISMISSED);
      this.respond(active, DISMISSED);
    }
  }

  private finished(active: Active): void {
    if (active.pending) reply(active.pending, DISMISSED);
    active.pending = null;
    if (this.active !== active) return;
    this.active = null;
    this.next();
  }

  private syncLock(): void {
    if (!this.locked) this.next();
    else if (this.active && !this.active.closing) this.dismiss(this.active);
  }

  destroy(): void {
    for (const disconnect of this.disconnectors) disconnect();
    this.dbus.unexport();
    for (const call of this.queue.splice(0)) reply(call, DISMISSED);
    if (this.active) this.dismiss(this.active);
  }
}
