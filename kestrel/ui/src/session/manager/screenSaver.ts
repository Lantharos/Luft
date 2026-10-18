import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BUS_NAME = 'org.freedesktop.ScreenSaver';
const PATHS = ['/org/freedesktop/ScreenSaver', '/ScreenSaver'];
const SHELL_SCREEN_SAVER = ['org.gnome.ScreenSaver', '/org/gnome/ScreenSaver', 'org.gnome.ScreenSaver'] as const;
const IDLE_MONITOR = ['org.gnome.Mutter.IdleMonitor', '/org/gnome/Mutter/IdleMonitor/Core', 'org.gnome.Mutter.IdleMonitor'] as const;
const SCREEN_SAVER_XML = `<node><interface name="org.freedesktop.ScreenSaver">
  <method name="Inhibit"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="u" direction="out"/></method>
  <method name="UnInhibit"><arg type="u" direction="in"/></method>
  <method name="GetActive"><arg type="b" direction="out"/></method>
  <method name="GetActiveTime"><arg type="u" direction="out"/></method>
  <method name="GetSessionIdleTime"><arg type="u" direction="out"/></method>
  <signal name="ActiveChanged"><arg type="b"/></signal>
</interface></node>`;

interface IdleRequests {
  inhibit(sender: string, appId: string, reason: string): number;
  uninhibit(cookie: number): void;
}

function forward<T>(target: readonly [string, string, string], method: string, replyType: string, invocation: Gio.DBusMethodInvocation,
  convert: (value: T) => GLib.Variant): void {
  Gio.DBus.session.call(...target, method, null, new GLib.VariantType(replyType), Gio.DBusCallFlags.NO_AUTO_START, -1, null)
    .then(reply => invocation.return_value(convert((reply.deep_unpack() as [T])[0])))
    .catch((error: GLib.Error) => invocation.return_gerror(error));
}

export class ScreenSaver {
  private readonly exported: Gio.DBusExportedObject[];
  private readonly nameId: number;
  private readonly activeChanged: number;

  constructor(requests: IdleRequests) {
    this.exported = PATHS.map(path => {
      const exported = Gio.DBusExportedObject.wrapJSObject(SCREEN_SAVER_XML, {
        InhibitAsync: ([appId, reason]: [string, string], invocation: Gio.DBusMethodInvocation) =>
          invocation.return_value(new GLib.Variant('(u)', [requests.inhibit(invocation.get_sender()!, appId, reason)])),
        UnInhibit: (cookie: number) => requests.uninhibit(cookie),
        GetActiveAsync: (_parameters: [], invocation: Gio.DBusMethodInvocation) =>
          forward<boolean>(SHELL_SCREEN_SAVER, 'GetActive', '(b)', invocation, active => new GLib.Variant('(b)', [active])),
        GetActiveTimeAsync: (_parameters: [], invocation: Gio.DBusMethodInvocation) =>
          forward<number>(SHELL_SCREEN_SAVER, 'GetActiveTime', '(u)', invocation, seconds => new GLib.Variant('(u)', [seconds])),
        GetSessionIdleTimeAsync: (_parameters: [], invocation: Gio.DBusMethodInvocation) =>
          forward<number>(IDLE_MONITOR, 'GetIdletime', '(t)', invocation, milliseconds => new GLib.Variant('(u)', [Math.floor(milliseconds / 1000)])),
      });
      exported.export(Gio.DBus.session, path);
      return exported;
    });
    this.activeChanged = Gio.DBus.session.signal_subscribe(SHELL_SCREEN_SAVER[0], SHELL_SCREEN_SAVER[2], 'ActiveChanged', SHELL_SCREEN_SAVER[1],
      null, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        for (const exported of this.exported) exported.emit_signal('ActiveChanged', parameters);
      });
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, null, null);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    Gio.DBus.session.signal_unsubscribe(this.activeChanged);
    for (const exported of this.exported) exported.unexport();
  }
}
