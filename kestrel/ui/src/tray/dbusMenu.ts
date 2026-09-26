import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { MenuEntry } from '../contextMenus.js';
import { busCall } from './bus.js';

const MENU_INTERFACE = 'com.canonical.dbusmenu';

type Layout = [id: number, properties: Record<string, GLib.Variant>, children: GLib.Variant[]];

function stripMnemonics(label: string): string {
  return label.replace(/__/g, '\0').replace(/_/g, '').replace(/\0/g, '_');
}

function menuIcon(properties: Layout[1]): Gio.Icon | null {
  const name = properties['icon-name']?.deep_unpack() as string | undefined;
  if (name) return new Gio.ThemedIcon({ name });
  const data = properties['icon-data'];
  return data && data.n_children() ? Gio.BytesIcon.new(data.get_data_as_bytes()) : null;
}

function withoutStraySeparators(entries: MenuEntry[]): MenuEntry[] {
  return entries.filter((entry, index) => entry !== 'separator' ||
    (index > 0 && index < entries.length - 1 && entries[index - 1] !== 'separator'));
}

export class DBusMenu {
  constructor(private readonly busName: string, private readonly menuPath: string, private readonly cancellable: Gio.Cancellable) {}

  async load(): Promise<MenuEntry[]> {
    await busCall(this.busName, this.menuPath, MENU_INTERFACE, 'AboutToShow', new GLib.Variant('(i)', [0]), this.cancellable);
    const reply = await busCall(this.busName, this.menuPath, MENU_INTERFACE, 'GetLayout', new GLib.Variant('(iias)', [0, -1, []]), this.cancellable);
    if (!reply) return [];
    const [, [, , children]] = reply.deep_unpack() as [number, Layout];
    return this.entries(children);
  }

  private entries(children: GLib.Variant[]): MenuEntry[] {
    return withoutStraySeparators(children.flatMap(child => this.entry(child.deep_unpack() as Layout)));
  }

  private entry([id, properties, children]: Layout): MenuEntry[] {
    const value = <T>(key: string, fallback: T) => (properties[key]?.deep_unpack() as T | undefined) ?? fallback;
    const text = (key: string) => value<string>(key, '');
    if (!value('visible', true)) return [];
    const label = stripMnemonics(text('label'));
    if (text('type') === 'separator' || !label) return ['separator'];
    const enabled = value('enabled', true);
    const icon = menuIcon(properties);
    if (text('children-display') === 'submenu' && children.length)
      return [{ label, enabled, icon, children: this.entries(children) }];
    const toggle = text('toggle-type');
    return [{
      label, enabled, icon,
      checked: toggle === 'checkmark' || toggle === 'radio' ? value<number>('toggle-state', 0) === 1 : undefined,
      run: () => void busCall(this.busName, this.menuPath, MENU_INTERFACE, 'Event',
        new GLib.Variant('(isvu)', [id, 'clicked', new GLib.Variant('i', 0), 0]), null),
    }];
  }
}
