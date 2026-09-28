import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { canonical, reservedAccelerators, typesText } from './accelerators.js';
import { recordShortcuts } from './recordDialog.js';
import { ShortcutStore, type AppShortcuts } from './store.js';

const PROVIDER_INTERFACE = `<node><interface name="org.gnome.Settings.GlobalShortcutsProvider">
  <method name="BindShortcuts">
    <arg type="s" name="app_id" direction="in"/><arg type="s" name="parent_window" direction="in"/>
    <arg type="a(sa{sv})" name="shortcuts" direction="in"/><arg type="a(sa{sv})" name="results" direction="out"/>
  </method>
  <method name="ConfigureShortcuts">
    <arg type="s" name="app_id" direction="in"/><arg type="s" name="parent_window" direction="in"/>
    <arg type="a(sa{sv})" name="results" direction="out"/>
  </method>
</interface></node>`;

type Requested = [id: string, options: Record<string, GLib.Variant>][];

function toResults(shortcuts: AppShortcuts, ids: string[]): GLib.Variant {
  return new GLib.Variant('(a(sa{sv}))', [ids.map((id): [string, Record<string, GLib.Variant>] => {
    const { description, shortcuts: accelerators } = shortcuts[id];
    const options: Record<string, GLib.Variant> = { description: new GLib.Variant('s', description) };
    if (accelerators.length) options.shortcuts = new GLib.Variant('as', accelerators);
    return [id, options];
  })]);
}

export class GlobalShortcutsProvider {
  private readonly store = new ShortcutStore();
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(PROVIDER_INTERFACE, this);
  private readonly nameId: number;

  constructor() {
    this.dbus.export(Gio.DBus.session, '/org/gnome/Settings/GlobalShortcutsProvider');
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.gnome.Settings.GlobalShortcutsProvider', Gio.BusNameOwnerFlags.NONE, null, null);
  }

  BindShortcutsAsync([appId, , requested]: [string, string, Requested], invocation: Gio.DBusMethodInvocation): void {
    const stored = this.store.app(appId);
    const unavailable = new Set([...reservedAccelerators(), ...this.store.takenByOthers(appId),
      ...Object.values(stored).flatMap(shortcut => shortcut.shortcuts.map(canonical))]);
    const bound: AppShortcuts = { ...stored };
    for (const [id, options] of requested) {
      const description = (options.description?.deep_unpack() as string | undefined) ?? stored[id]?.description ?? id;
      if (stored[id]) {
        bound[id] = { ...stored[id], description };
        continue;
      }
      const preferred = [options.preferred_trigger?.recursiveUnpack() as string | string[] | undefined].flat()
        .filter((accelerator): accelerator is string => !!accelerator);
      const accepted = preferred.filter(accelerator => !typesText(accelerator) && !unavailable.has(canonical(accelerator)));
      accepted.forEach(accelerator => unavailable.add(canonical(accelerator)));
      bound[id] = { description, shortcuts: accepted };
    }
    this.store.save(appId, bound);
    invocation.return_value(toResults(bound, requested.map(([id]) => id)));
  }

  async ConfigureShortcutsAsync([appId]: [string, string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const current = this.store.app(appId);
    const unavailable = new Set([...reservedAccelerators(), ...this.store.takenByOthers(appId)]);
    const edited = await recordShortcuts(appId, current, unavailable);
    if (edited) this.store.save(appId, edited);
    const result = edited ?? current;
    invocation.return_value(toResults(result, Object.keys(result)));
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    this.dbus.unexport();
  }
}
