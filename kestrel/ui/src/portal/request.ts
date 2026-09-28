import Gio from 'gi://Gio';

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
