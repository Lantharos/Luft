import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { MenuEntry } from '../menus/contextMenus.js';
import { whenGraphicsRestored } from '../shared/graphics.js';
import { busCall } from './bus.js';
import { DBusMenu } from './dbusMenu.js';
import { resolveGlyph, type TrayGlyph } from './icon.js';
import type { TrayItemAddress } from './watcher.js';

const ITEM_INTERFACE = 'org.kde.StatusNotifierItem';

function unpack<T>(properties: Record<string, GLib.Variant>, key: string, fallback: T): T {
  return (properties[key]?.deep_unpack() as T | undefined) ?? fallback;
}

export class TrayItem {
  glyph: TrayGlyph | null = null;
  visible = false;
  private readonly cancellable = new Gio.Cancellable();
  private readonly subscriptions: number[];
  private readonly stopWatchingGraphics = whenGraphicsRestored(() => this.scheduleRefresh());
  private properties: Record<string, GLib.Variant> = {};
  private refreshSource = 0;

  constructor(private readonly address: TrayItemAddress, private readonly changed: () => void) {
    const { busName, objectPath } = address;
    const refresh = () => this.scheduleRefresh();
    this.subscriptions = [
      Gio.DBus.session.signal_subscribe(busName, ITEM_INTERFACE, null, objectPath, null, Gio.DBusSignalFlags.NONE, refresh),
      Gio.DBus.session.signal_subscribe(busName, 'org.freedesktop.DBus.Properties', 'PropertiesChanged', objectPath, ITEM_INTERFACE, Gio.DBusSignalFlags.NONE, refresh),
    ];
    void this.refresh();
  }

  get title(): string {
    const [, , toolTip] = unpack<[string, unknown, string, string]>(this.properties, 'ToolTip', ['', null, '', '']);
    return toolTip || unpack(this.properties, 'Title', '') || unpack(this.properties, 'Id', '');
  }

  get hasMenu(): boolean {
    return !!unpack(this.properties, 'Menu', '');
  }

  get isOnlyMenu(): boolean {
    return unpack(this.properties, 'ItemIsMenu', false);
  }

  activate(x: number, y: number): Promise<GLib.Variant | null> {
    return this.call('Activate', new GLib.Variant('(ii)', [x, y]));
  }

  menu(): Promise<MenuEntry[]> {
    return new DBusMenu(this.address.busName, unpack(this.properties, 'Menu', ''), this.cancellable).load();
  }

  shutdown(): void {
    this.cancellable.cancel();
    this.stopWatchingGraphics();
    if (this.refreshSource) GLib.Source.remove(this.refreshSource);
    this.refreshSource = 0;
    for (const id of this.subscriptions) Gio.DBus.session.signal_unsubscribe(id);
    this.subscriptions.length = 0;
  }

  private scheduleRefresh(): void {
    if (this.refreshSource) return;
    this.refreshSource = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.refreshSource = 0;
      void this.refresh();
      return GLib.SOURCE_REMOVE;
    });
  }

  private async refresh(): Promise<void> {
    const { busName, objectPath } = this.address;
    const reply = await busCall(busName, objectPath, 'org.freedesktop.DBus.Properties', 'GetAll', new GLib.Variant('(s)', [ITEM_INTERFACE]), this.cancellable);
    if (!reply) return;
    [this.properties] = reply.deep_unpack() as [Record<string, GLib.Variant>];
    const status = unpack<string>(this.properties, 'Status', '');
    const themePath = unpack(this.properties, 'IconThemePath', '');
    const attention = status === 'NeedsAttention' ? resolveGlyph({
      name: unpack(this.properties, 'AttentionIconName', ''), themePath, pixmaps: this.properties.AttentionIconPixmap ?? null,
    }) : null;
    this.glyph = attention ?? resolveGlyph({ name: unpack(this.properties, 'IconName', ''), themePath, pixmaps: this.properties.IconPixmap ?? null });
    this.visible = !!this.glyph && status !== 'Passive';
    this.changed();
  }

  private call(method: string, parameters: GLib.Variant): Promise<GLib.Variant | null> {
    return busCall(this.address.busName, this.address.objectPath, ITEM_INTERFACE, method, parameters, this.cancellable);
  }
}
