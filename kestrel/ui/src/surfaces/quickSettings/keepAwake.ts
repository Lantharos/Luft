import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const IDLE = 8;

export class KeepAwake {
  private proxy: Gio.DBusProxy | null = null;
  private readonly cancellable = new Gio.Cancellable();

  constructor(changed: () => void) {
    Gio.DBusProxy.new_for_bus(Gio.BusType.SESSION, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null, 'org.gnome.SessionManager',
      '/org/gnome/SessionManager', 'org.gnome.SessionManager', this.cancellable, (_source, result) => {
        try {
          this.proxy = Gio.DBusProxy.new_for_bus_finish(result);
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
            console.warn(`Keep awake state is unavailable: ${error}`);
          return;
        }
        this.proxy.connect('g-properties-changed', changed);
        changed();
      });
  }

  get active(): boolean {
    return !!((this.proxy?.get_cached_property('InhibitedActions')?.get_uint32() ?? 0) & IDLE);
  }

  destroy(): void {
    this.cancellable.cancel();
    this.proxy = null;
  }
}
