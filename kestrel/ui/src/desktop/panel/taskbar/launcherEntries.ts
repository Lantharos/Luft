import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

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
const UPDATE = new GLib.VariantType('(sa{sv})');
const MAX_APPS_PER_SENDER = 16;
const MAX_APP_ID_LENGTH = 255;

class LauncherEntries {
  private readonly entries = new Map<string, LauncherEntry>();
  private readonly senders = new Map<string, { apps: Set<string>; subscription: number }>();
  private readonly listeners = new Set<Listener>();

  constructor() {
    Gio.DBus.session.signal_subscribe(null, 'com.canonical.Unity.LauncherEntry', 'Update', null, null, Gio.DBusSignalFlags.NONE,
      (_connection, sender, _path, _iface, _signal, parameters) => {
        if (!parameters.is_of_type(UPDATE)) return;
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
    if (appId.length > MAX_APP_ID_LENGTH || !this.track(sender, appId)) return;
    const entry = { ...this.get(appId) } as Record<keyof LauncherEntry, unknown>;
    for (const [name, packed] of Object.entries(properties)) {
      if (!Object.hasOwn(PROPERTIES, name)) continue;
      const key = PROPERTIES[name];
      const value: unknown = packed.deep_unpack();
      if (typeof value === typeof EMPTY[key]) entry[key] = value;
    }
    this.entries.set(appId, entry as unknown as LauncherEntry);
    this.emit(appId);
  }

  /** Remembers that a sender spoke for an app, so its badge goes when the sender does. A sender only gets so many apps. */
  private track(sender: string, appId: string): boolean {
    const known = this.senders.get(sender);
    if (known) {
      if (!known.apps.has(appId) && known.apps.size >= MAX_APPS_PER_SENDER) return false;
      known.apps.add(appId);
      return true;
    }
    const subscription = Gio.DBus.session.signal_subscribe('org.freedesktop.DBus', 'org.freedesktop.DBus', 'NameOwnerChanged',
      '/org/freedesktop/DBus', sender, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
        const [, , owner] = parameters.deep_unpack() as [string, string, string];
        if (!owner) this.forget(sender);
      });
    this.senders.set(sender, { apps: new Set([appId]), subscription });
    return true;
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
