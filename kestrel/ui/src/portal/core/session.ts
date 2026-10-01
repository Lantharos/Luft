import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SESSION_XML = `<node><interface name="org.freedesktop.impl.portal.Session">
  <method name="Close"/>
  <signal name="Closed"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const sessions = new Map<string, PortalSession>();

export function findSession<T extends PortalSession>(handle: string, kind: abstract new (...args: never[]) => T): T | null {
  const session = sessions.get(handle);
  return session instanceof kind ? session : null;
}

export abstract class PortalSession {
  readonly version = 1;
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(SESSION_XML, { Close: () => this.end(), version: this.version });
  private ended = false;

  constructor(readonly handle: string, readonly appId: string) {
    this.exported.export(Gio.DBus.session, handle);
    sessions.set(handle, this);
  }

  get active(): boolean {
    return !this.ended;
  }

  close(): void {
    if (this.ended) return;
    this.exported.emit_signal('Closed', null as unknown as GLib.Variant);
    this.end();
  }

  protected abstract closed(): void;

  private end(): void {
    if (this.ended) return;
    this.ended = true;
    sessions.delete(this.handle);
    this.exported.unexport();
    this.closed();
  }
}
