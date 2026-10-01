import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Request } from './copy.js';
import { PasskeyDialog } from './dialog.js';

const PROMPT_XML = `<node><interface name="com.lantharos.Kestrel.Passkeys1.Prompt">
  <method name="Next"><arg type="s" direction="out"/><arg type="a{sv}" direction="out"/></method>
  <method name="Update"><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
  <method name="Close"/>
</interface></node>`;

type Event = [kind: string, details: Record<string, GLib.Variant>];

export class PasskeyPrompt {
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(PROMPT_XML, this);
  private readonly events: Event[] = [];
  private waiting: Gio.DBusMethodInvocation | null = null;
  private finished = false;
  private readonly dialog: PasskeyDialog;

  constructor(readonly path: string, readonly owner: string, request: Request, private readonly ended: () => void) {
    this.dialog = new PasskeyDialog(request, {
      account: index => this.push(['account', { index: new GLib.Variant('u', index) }]),
      password: text => this.push(['password', { password: new GLib.Variant('s', text) }]),
      confirm: () => this.push(['confirm', {}]),
      cancel: () => this.finish(),
    });
    this.exported.export(Gio.DBus.session, path);
  }

  open(): Promise<boolean> {
    return this.dialog.open();
  }

  private allowed(invocation: Gio.DBusMethodInvocation): boolean {
    if (invocation.get_sender() === this.owner) return true;
    invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'This prompt belongs to another caller');
    return false;
  }

  private push(event: Event): void {
    if (this.finished) return;
    if (!this.waiting) {
      this.events.push(event);
      return;
    }
    this.waiting.return_value(new GLib.Variant('(sa{sv})', event));
    this.waiting = null;
  }

  NextAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    if (!this.allowed(invocation)) return;
    const event = this.events.shift() ?? (this.finished ? ['cancel', {}] as Event : null);
    if (event) invocation.return_value(new GLib.Variant('(sa{sv})', event));
    else this.waiting = invocation;
  }

  UpdateAsync([state, message]: [string, string], invocation: Gio.DBusMethodInvocation): void {
    if (!this.allowed(invocation)) return;
    if (state === 'fingerprint-hint') this.dialog.fingerprintHint(message);
    else if (state === 'fingerprint-unavailable') this.dialog.fingerprintUnavailable();
    else if (state === 'wrong-password') this.dialog.wrongPassword();
    invocation.return_value(null);
  }

  CloseAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    if (!this.allowed(invocation)) return;
    this.finish();
    invocation.return_value(null);
  }

  finish(): void {
    if (this.finished) return;
    this.finished = true;
    this.events.length = 0;
    this.waiting?.return_value(new GLib.Variant('(sa{sv})', ['cancel', {}]));
    this.waiting = null;
    this.dialog.close();
    this.exported.unexport();
    this.ended();
  }
}
