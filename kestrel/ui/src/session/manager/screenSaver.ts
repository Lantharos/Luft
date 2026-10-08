import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BUS_NAME = 'org.freedesktop.ScreenSaver';
const PATHS = ['/org/freedesktop/ScreenSaver', '/ScreenSaver'];
const SCREEN_SAVER_XML = `<node><interface name="org.freedesktop.ScreenSaver">
  <method name="Inhibit"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="u" direction="out"/></method>
  <method name="UnInhibit"><arg type="u" direction="in"/></method>
</interface></node>`;

interface IdleRequests {
  inhibit(sender: string, appId: string, reason: string): number;
  uninhibit(cookie: number): void;
}

export class ScreenSaver {
  private readonly exported: Gio.DBusExportedObject[];
  private readonly nameId: number;

  constructor(requests: IdleRequests) {
    this.exported = PATHS.map(path => {
      const exported = Gio.DBusExportedObject.wrapJSObject(SCREEN_SAVER_XML, {
        InhibitAsync: ([appId, reason]: [string, string], invocation: Gio.DBusMethodInvocation) =>
          invocation.return_value(new GLib.Variant('(u)', [requests.inhibit(invocation.get_sender()!, appId, reason)])),
        UnInhibit: (cookie: number) => requests.uninhibit(cookie),
      });
      exported.export(Gio.DBus.session, path);
      return exported;
    });
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, null, null);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    for (const exported of this.exported) exported.unexport();
  }
}
