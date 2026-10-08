import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import type { ContextMenus, MenuEntry } from '../menus/contextMenus.js';
import { paintGlyph, TRAY_ICON_SIZE } from './icon.js';
import { TrayItem } from './item.js';
import { StatusNotifierWatcher, type TrayItemAddress } from './watcher.js';

const PREVIEW_SIZE = 18;
const PREVIEW_LAYOUTS: [x: number, y: number, size: number][][] = [
  [[1, 1, TRAY_ICON_SIZE]],
  [[0, 3, 12], [6, 3, 12]],
  [[0, 0, 10], [8, 0, 10], [4, 8, 10]],
  [[0, 0, 10], [8, 0, 10], [0, 8, 10], [8, 8, 10]],
];

export class Tray {
  readonly actor: St.Button;
  private readonly preview = new St.Widget({ width: PREVIEW_SIZE, height: PREVIEW_SIZE, y_align: Clutter.ActorAlign.CENTER });
  private readonly items = new Map<string, TrayItem>();
  private readonly watcher: StatusNotifierWatcher;
  private syncSource = 0;

  constructor(private readonly menus: ContextMenus) {
    this.actor = new St.Button({
      name: 'kestrel-tray', style_class: 'kestrel-status-button kestrel-tray-button', child: this.preview,
      can_focus: true, visible: false, accessible_name: 'Tray apps',
      button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.SECONDARY,
    });
    this.actor.connect('clicked', () => this.open());
    this.watcher = new StatusNotifierWatcher(this);
  }

  added(id: string, address: TrayItemAddress): void {
    this.items.set(id, new TrayItem(address, () => this.scheduleSync()));
  }

  removed(id: string): void {
    this.items.get(id)?.shutdown();
    this.items.delete(id);
    this.scheduleSync();
  }

  contains(actor: Clutter.Actor | null): boolean {
    return !!actor && this.actor.contains(actor);
  }

  shutdown(): void {
    if (this.syncSource) GLib.Source.remove(this.syncSource);
    this.watcher.destroy();
    for (const item of this.items.values()) item.shutdown();
    this.items.clear();
  }

  private get shown(): TrayItem[] {
    return [...this.items.values()].filter(item => item.visible);
  }

  private scheduleSync(): void {
    if (this.syncSource) return;
    this.syncSource = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.syncSource = 0;
      this.sync();
      return GLib.SOURCE_REMOVE;
    });
  }

  private sync(): void {
    const shown = this.shown;
    this.actor.visible = shown.length > 0;
    this.preview.destroy_all_children();
    const layout = PREVIEW_LAYOUTS[Math.min(shown.length, PREVIEW_LAYOUTS.length) - 1] ?? [];
    layout.forEach(([x, y, size], index) => {
      const icon = new St.Icon({ x, y });
      paintGlyph(icon, shown[index].glyph!, size);
      this.preview.add_child(icon);
    });
  }

  private anchor(): [x: number, y: number] {
    const [x, y] = this.actor.get_transformed_position();
    return [Math.round(x + this.actor.width / 2), Math.round(y)];
  }

  private open(): void {
    const [x, y] = this.anchor();
    this.menus.open(this.actor, this.shown.map(item => this.entry(item, x, y)), x, y);
  }

  private entry(item: TrayItem, x: number, y: number): MenuEntry {
    const activate = () => void item.activate(x, y);
    if (!item.hasMenu) return { label: item.title, icon: item.glyph, run: activate };
    return {
      label: item.title, icon: item.glyph,
      children: async () => [
        ...item.isOnlyMenu ? [] : [{ label: `Open ${item.title}`, run: activate }, 'separator' as const],
        ...await item.menu(),
      ],
    };
  }
}
