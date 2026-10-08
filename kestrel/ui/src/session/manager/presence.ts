import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { PRESENCE_XML, PresenceStatus, MANAGER_PATH } from './interfaces.js';

const IDLE_MONITOR = ['org.gnome.Mutter.IdleMonitor', '/org/gnome/Mutter/IdleMonitor/Core', 'org.gnome.Mutter.IdleMonitor'] as const;

function idleMonitor(method: string, parameters: GLib.Variant | null, replyType: string | null): Promise<GLib.Variant> {
  return Gio.DBus.session.call(...IDLE_MONITOR, method, parameters, replyType ? new GLib.VariantType(replyType) : null,
    Gio.DBusCallFlags.NO_AUTO_START, -1, null);
}

export class Presence {
  private status = PresenceStatus.AVAILABLE;
  private statusText = '';
  private readonly exported: Gio.DBusExportedObject;
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.session' });
  private readonly delayChanged: number;
  private readonly monitorWatch: number;
  private readonly firedSubscription: number;
  private idleWatch = 0;
  private activeWatch = 0;

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
    this.firedSubscription = Gio.DBus.session.signal_subscribe(IDLE_MONITOR[0], IDLE_MONITOR[2], 'WatchFired', IDLE_MONITOR[1], null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => this.fired((parameters.deep_unpack() as [number])[0]));
    this.monitorWatch = Gio.bus_watch_name_on_connection(Gio.DBus.session, IDLE_MONITOR[0], Gio.BusNameWatcherFlags.NONE,
      () => void this.watchIdle(), () => { this.idleWatch = this.activeWatch = 0; });
    this.delayChanged = this.settings.connect('changed::idle-delay', () => void this.watchIdle());
  }

  destroy(): void {
    this.settings.disconnect(this.delayChanged);
    Gio.bus_unwatch_name(this.monitorWatch);
    Gio.DBus.session.signal_unsubscribe(this.firedSubscription);
    void this.clearWatches();
    this.exported.unexport();
  }

  private async watchIdle(): Promise<void> {
    await this.clearWatches();
    const delay = this.settings.get_uint('idle-delay');
    if (!delay) return;
    [this.idleWatch] = (await idleMonitor('AddIdleWatch', new GLib.Variant('(t)', [delay * 1000]), '(u)')).deep_unpack() as [number];
  }

  private async clearWatches(): Promise<void> {
    const watches = [this.idleWatch, this.activeWatch].filter(Boolean);
    this.idleWatch = this.activeWatch = 0;
    await Promise.all(watches.map(watch => idleMonitor('RemoveWatch', new GLib.Variant('(u)', [watch]), null).catch(() => null)));
  }

  private fired(watch: number): void {
    if (watch === this.idleWatch) {
      this.setStatus(PresenceStatus.IDLE);
      void idleMonitor('AddUserActiveWatch', null, '(u)').then(reply => {
        [this.activeWatch] = reply.deep_unpack() as [number];
      });
    } else if (watch === this.activeWatch) {
      this.activeWatch = 0;
      this.setStatus(PresenceStatus.AVAILABLE);
    }
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
