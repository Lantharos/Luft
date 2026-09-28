import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

export interface LauncherEntry {
  count: number;
  countVisible: boolean;
  progress: number;
  progressVisible: boolean;
  urgent: boolean;
}

type Listener = (appId: string) => void;

const EMPTY: LauncherEntry = { count: 0, countVisible: false, progress: 0, progressVisible: false, urgent: false };
const PROPERTIES: Record<string, keyof LauncherEntry> = {
  'count': 'count', 'count-visible': 'countVisible', 'progress': 'progress', 'progress-visible': 'progressVisible', 'urgent': 'urgent',
};

class LauncherEntries {
  private readonly entries = new Map<string, LauncherEntry>();
  private readonly senders = new Map<string, { apps: Set<string>; subscription: number }>();
  private readonly listeners = new Set<Listener>();

  constructor() {
    Gio.DBus.session.signal_subscribe(null, 'com.canonical.Unity.LauncherEntry', 'Update', null, null, Gio.DBusSignalFlags.NONE,
      (_connection, sender, _path, _iface, _signal, parameters) => {
        const [uri, properties] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>];
        this.update(sender!, uri.replace(/^application:\/\//, ''), properties);
      });
  }

  get(appId: string): LauncherEntry {
    return this.entries.get(appId) ?? EMPTY;
  }

  watch(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private update(sender: string, appId: string, properties: Record<string, GLib.Variant>): void {
    const entry = { ...this.get(appId) } as Record<keyof LauncherEntry, unknown>;
    for (const [name, value] of Object.entries(properties))
      if (name in PROPERTIES) entry[PROPERTIES[name]] = value.deep_unpack();
    this.entries.set(appId, entry as unknown as LauncherEntry);
    this.track(sender, appId);
    this.emit(appId);
  }

  private track(sender: string, appId: string): void {
    const known = this.senders.get(sender);
    if (known) {
      known.apps.add(appId);
      return;
    }
    const subscription = Gio.DBus.session.signal_subscribe('org.freedesktop.DBus', 'org.freedesktop.DBus', 'NameOwnerChanged',
      '/org/freedesktop/DBus', sender, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, , owner] = parameters.deep_unpack() as [string, string, string];
        if (!owner) this.forget(sender);
      });
    this.senders.set(sender, { apps: new Set([appId]), subscription });
  }

  private forget(sender: string): void {
    const known = this.senders.get(sender)!;
    Gio.DBus.session.signal_unsubscribe(known.subscription);
    this.senders.delete(sender);
    for (const appId of known.apps) {
      this.entries.delete(appId);
      this.emit(appId);
    }
  }

  private emit(appId: string): void {
    for (const listener of this.listeners) listener(appId);
  }
}

export const launcherEntries = new LauncherEntries();
