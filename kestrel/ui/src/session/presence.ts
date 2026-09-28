import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import { PRESENCE_XML, PresenceStatus, MANAGER_PATH } from './interfaces.js';

export class Presence {
  private status = PresenceStatus.AVAILABLE;
  private statusText = '';
  private readonly exported: Gio.DBusExportedObject;
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.session' });
  private readonly monitor: Meta.IdleMonitor = (global as unknown as Shell.Global).backend.get_core_idle_monitor();
  private idleWatch = 0;
  private activeWatch = 0;
  private readonly delayChanged: number;

  constructor() {
    const presence = this;
    this.exported = Gio.DBusExportedObject.wrapJSObject(PRESENCE_XML, {
      SetStatus: (status: number) => this.setStatus(status),
      SetStatusText: (text: string) => this.setStatusText(text),
      get status() { return presence.status; },
      set status(status: number) { presence.setStatus(status); },
      get 'status-text'() { return presence.statusText; },
      set 'status-text'(text: string) { presence.setStatusText(text); },
    });
    this.exported.export(Gio.DBus.session, `${MANAGER_PATH}/Presence`);
    this.delayChanged = this.settings.connect('changed::idle-delay', () => this.watchIdle());
    this.watchIdle();
  }

  destroy(): void {
    this.settings.disconnect(this.delayChanged);
    this.clearWatches();
    this.exported.unexport();
  }

  private watchIdle(): void {
    this.clearWatches();
    const delay = this.settings.get_uint('idle-delay');
    if (!delay) return;
    this.idleWatch = this.monitor.add_idle_watch(delay * 1000, () => {
      this.setStatus(PresenceStatus.IDLE);
      this.activeWatch = this.monitor.add_user_active_watch(() => {
        this.activeWatch = 0;
        this.setStatus(PresenceStatus.AVAILABLE);
      });
    });
  }

  private clearWatches(): void {
    for (const watch of [this.idleWatch, this.activeWatch]) if (watch) this.monitor.remove_watch(watch);
    this.idleWatch = this.activeWatch = 0;
  }

  private setStatus(status: number): void {
    if (status === this.status) return;
    this.status = status;
    this.exported.emit_signal('StatusChanged', new GLib.Variant('(u)', [status]));
    this.exported.emit_property_changed('status', new GLib.Variant('u', status));
  }

  private setStatusText(text: string): void {
    if (text === this.statusText) return;
    this.statusText = text;
    this.exported.emit_signal('StatusTextChanged', new GLib.Variant('(s)', [text]));
    this.exported.emit_property_changed('status-text', new GLib.Variant('s', text));
  }
}
