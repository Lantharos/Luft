import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { MenuEntry } from '../menus/contextMenus.js';
import { whenGraphicsRestored } from '../../shared/graphics.js';
import { busCall } from './bus.js';
import { DBusMenu } from './dbusMenu.js';
import { resolveGlyph, type TrayGlyph } from './icon.js';
import type { TrayItemAddress } from './watcher.js';

const ITEM_INTERFACE = 'org.kde.StatusNotifierItem';
const PROPERTIES_INTERFACE = 'org.freedesktop.DBus.Properties';
const GLYPH_PROPERTIES = new Set(['Status', 'IconThemePath', 'IconName', 'IconPixmap', 'AttentionIconName', 'AttentionIconPixmap']);
const SIGNAL_PROPERTIES: Record<string, string[]> = {
  NewIcon: ['IconName', 'IconPixmap'],
  NewAttentionIcon: ['AttentionIconName', 'AttentionIconPixmap'],
  NewTitle: ['Title'],
  NewToolTip: ['ToolTip'],
  NewMenu: ['Menu'],
};
const SIGNAL_VALUES: Record<string, string> = { NewStatus: 'Status', NewIconThemePath: 'IconThemePath' };

function unpack<T>(properties: Record<string, GLib.Variant>, key: string, fallback: T): T {
  return (properties[key]?.deep_unpack() as T | undefined) ?? fallback;
}

export class TrayItem {
  glyph: TrayGlyph | null = null;
  visible = false;
  private readonly cancellable = new Gio.Cancellable();
  private readonly subscriptions: number[];
  private readonly stopWatchingGraphics = whenGraphicsRestored(() => this.resolve());
  private properties: Record<string, GLib.Variant> = {};
  private readonly stale = new Set<string>();
  private fetchSource = 0;

  constructor(private readonly address: TrayItemAddress, private readonly changed: () => void) {
    const { busName, objectPath } = address;
    this.subscriptions = [
      Gio.DBus.session.signal_subscribe(busName, ITEM_INTERFACE, null, objectPath, null, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _iface, signal, parameters) => this.signalled(signal, parameters)),
      Gio.DBus.session.signal_subscribe(busName, PROPERTIES_INTERFACE, 'PropertiesChanged', objectPath, ITEM_INTERFACE, Gio.DBusSignalFlags.NONE,
        (_connection, _sender, _path, _iface, _signal, parameters) => this.propertiesChanged(parameters)),
    ];
    void this.load();
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
    if (this.fetchSource) GLib.Source.remove(this.fetchSource);
    this.fetchSource = 0;
    for (const id of this.subscriptions) Gio.DBus.session.signal_unsubscribe(id);
    this.subscriptions.length = 0;
  }

  private async load(): Promise<void> {
    const { busName, objectPath } = this.address;
    const reply = await busCall(busName, objectPath, PROPERTIES_INTERFACE, 'GetAll', new GLib.Variant('(s)', [ITEM_INTERFACE]), this.cancellable);
    if (!reply) return;
    [this.properties] = reply.deep_unpack() as [Record<string, GLib.Variant>];
    this.resolve();
  }

  private signalled(signal: string, parameters: GLib.Variant): void {
    const property = SIGNAL_VALUES[signal];
    if (property) this.update(new Map([[property, parameters.get_child_value(0)]]));
    else for (const name of SIGNAL_PROPERTIES[signal] ?? []) this.markStale(name);
  }

  private propertiesChanged(parameters: GLib.Variant): void {
    const [, changed, invalidated] = parameters.deep_unpack() as [string, Record<string, GLib.Variant>, string[]];
    this.update(new Map(Object.entries(changed)));
    for (const name of invalidated) this.markStale(name);
  }

  private markStale(name: string): void {
    this.stale.add(name);
    if (this.fetchSource) return;
    this.fetchSource = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.fetchSource = 0;
      void this.fetchStale();
      return GLib.SOURCE_REMOVE;
    });
  }

  private async fetchStale(): Promise<void> {
    const { busName, objectPath } = this.address;
    const names = [...this.stale];
    this.stale.clear();
    const replies = await Promise.all(names.map(name => busCall(busName, objectPath, PROPERTIES_INTERFACE, 'Get',
      new GLib.Variant('(ss)', [ITEM_INTERFACE, name]), this.cancellable)));
    if (this.cancellable.is_cancelled()) return;
    this.update(new Map(names.map((name, index) => [name, replies[index]?.get_child_value(0).get_variant() ?? null])));
  }

  private update(values: Map<string, GLib.Variant | null>): void {
    let glyphChanged = false;
    for (const [name, value] of values) {
      const previous = this.properties[name];
      if (value ? previous?.equal(value) : !previous) continue;
      if (value) this.properties[name] = value;
      else delete this.properties[name];
      glyphChanged ||= GLYPH_PROPERTIES.has(name);
    }
    if (glyphChanged) this.resolve();
  }

  private resolve(): void {
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
