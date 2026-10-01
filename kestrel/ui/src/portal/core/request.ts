import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const SUCCESS = 0;
export const CANCELLED = 1;
export const ENDED = 2;

export type Options = Record<string, GLib.Variant>;
export type Invocation = Gio.DBusMethodInvocation;
export type Outcome = [response: number, results: Options];

const REQUEST_XML = `<node><interface name="org.freedesktop.impl.portal.Request">
  <method name="Close"/>
</interface></node>`;

export class PortalRequest {
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(REQUEST_XML, { Close: () => this.closed() });

  constructor(handle: string, private readonly closed: () => void) {
    this.exported.export(Gio.DBus.session, handle);
  }

  finish(): void {
    this.exported.unexport();
  }
}

export function respond(invocation: Invocation, [response, results]: Outcome): void {
  invocation.return_value(new GLib.Variant('(ua{sv})', [response, results]));
}

export function option<T>(options: Options, key: string): T | undefined {
  return options[key]?.recursiveUnpack() as T | undefined;
}
