import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

import type { PortalDialog } from '../core/dialog.js';
import { ENDED } from '../core/request.js';
import { PortalSession } from '../core/session.js';

const PORTAL_PATH = '/org/freedesktop/portal/desktop';

export abstract class PeerSession extends PortalSession {
  private readonly watch: number;
  private dialog: PortalDialog | null = null;

  constructor(handle: string, appId: string, readonly peer: string) {
    super(handle, appId);
    this.watch = Gio.bus_watch_name_on_connection(Gio.DBus.session, peer, Gio.BusNameWatcherFlags.NONE, null, () => this.close());
  }

  emit(iface: string, signal: string, parameters: GLib.Variant): void {
    Gio.DBus.session.emit_signal(this.peer, PORTAL_PATH, iface, signal, parameters);
  }

  protected readonly track = (dialog: PortalDialog | null) => { this.dialog = dialog; };

  protected closed(): void {
    Gio.bus_unwatch_name(this.watch);
    this.dialog?.finish(ENDED);
    this.stopped();
  }

  protected abstract stopped(): void;
}
