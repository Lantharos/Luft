import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import type { ContextMenus } from '../contextMenus.js';
import { busCall } from './bus.js';
import { DBusMenu } from './dbusMenu.js';
import { applyTrayIcon, TRAY_ICON_SIZE } from './icon.js';
import type { TrayItemAddress } from './watcher.js';

const ITEM_INTERFACE = 'org.kde.StatusNotifierItem';

function unpack<T>(properties: Record<string, GLib.Variant>, key: string, fallback: T): T {
  return (properties[key]?.deep_unpack() as T | undefined) ?? fallback;
}

export class TrayItem {
  readonly actor: St.Button;
  private readonly icon = new St.Icon({ style_class: 'kestrel-tray-icon', icon_size: TRAY_ICON_SIZE });
  private readonly cancellable = new Gio.Cancellable();
  private readonly subscriptions: number[];
  private properties: Record<string, GLib.Variant> = {};
  private refreshSource = 0;

  constructor(private readonly address: TrayItemAddress, private readonly menus: ContextMenus) {
    this.actor = new St.Button({
      style_class: 'kestrel-status-button kestrel-tray-button', child: this.icon, can_focus: true, visible: false,
      button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.MIDDLE,
    });
    this.actor.connect('clicked', (_actor, button: number) => this.click(button));
    this.actor.connect('button-press-event', (_actor, event: Clutter.Event) => {
      if (event.get_button() !== Clutter.BUTTON_SECONDARY) return Clutter.EVENT_PROPAGATE;
      void this.openMenu();
      return Clutter.EVENT_STOP;
    });
    this.actor.connect('scroll-event', (_actor, event: Clutter.Event) => this.scroll(event));
    this.actor.connect('key-press-event', (_actor, event: Clutter.Event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Menu) return Clutter.EVENT_PROPAGATE;
      void this.openMenu();
      return Clutter.EVENT_STOP;
    });
    const { busName, objectPath } = address;
    const refresh = () => this.scheduleRefresh();
    this.subscriptions = [
      Gio.DBus.session.signal_subscribe(busName, ITEM_INTERFACE, null, objectPath, null, Gio.DBusSignalFlags.NONE, refresh),
      Gio.DBus.session.signal_subscribe(busName, 'org.freedesktop.DBus.Properties', 'PropertiesChanged', objectPath, ITEM_INTERFACE, Gio.DBusSignalFlags.NONE, refresh),
    ];
    void this.refresh();
  }

  shutdown(): void {
    this.cancellable.cancel();
    if (this.refreshSource) GLib.Source.remove(this.refreshSource);
    this.refreshSource = 0;
    for (const id of this.subscriptions) Gio.DBus.session.signal_unsubscribe(id);
    this.subscriptions.length = 0;
  }

  destroy(): void {
    this.shutdown();
    this.actor.destroy();
  }

  private get title(): string {
    const [, , toolTip] = unpack<[string, unknown, string, string]>(this.properties, 'ToolTip', ['', null, '', '']);
    return toolTip || unpack(this.properties, 'Title', '') || unpack(this.properties, 'Id', '');
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
    const attention = status === 'NeedsAttention';
    const themePath = unpack(this.properties, 'IconThemePath', '');
    const shown = (attention && applyTrayIcon(this.icon, {
      name: unpack(this.properties, 'AttentionIconName', ''), themePath, pixmaps: this.properties.AttentionIconPixmap ?? null,
    })) || applyTrayIcon(this.icon, {
      name: unpack(this.properties, 'IconName', ''), themePath, pixmaps: this.properties.IconPixmap ?? null,
    });
    this.actor.visible = shown && status !== 'Passive';
    this.actor.accessible_name = this.title;
  }

  private anchor(): [x: number, y: number] {
    const [x, y] = this.actor.get_transformed_position();
    return [Math.round(x + this.actor.width / 2), Math.round(y)];
  }

  private call(method: string, parameters: GLib.Variant): Promise<GLib.Variant | null> {
    return busCall(this.address.busName, this.address.objectPath, ITEM_INTERFACE, method, parameters, this.cancellable);
  }

  private async click(button: number): Promise<void> {
    const position = new GLib.Variant('(ii)', this.anchor());
    if (button === Clutter.BUTTON_MIDDLE) await this.call('SecondaryActivate', position);
    else if (unpack(this.properties, 'ItemIsMenu', false) || !await this.call('Activate', position)) await this.openMenu();
  }

  private async openMenu(): Promise<void> {
    const menuPath = unpack(this.properties, 'Menu', '');
    const [x, y] = this.anchor();
    if (!menuPath) {
      await this.call('ContextMenu', new GLib.Variant('(ii)', [x, y]));
      return;
    }
    const entries = await new DBusMenu(this.address.busName, menuPath, this.cancellable).load();
    if (!this.cancellable.is_cancelled()) this.menus.open(this.actor, entries, x, y);
  }

  private scroll(event: Clutter.Event): boolean {
    const direction = event.get_scroll_direction();
    const delta = direction === Clutter.ScrollDirection.UP || direction === Clutter.ScrollDirection.LEFT ? -1 : 1;
    if (direction === Clutter.ScrollDirection.SMOOTH) return Clutter.EVENT_PROPAGATE;
    const orientation = direction === Clutter.ScrollDirection.LEFT || direction === Clutter.ScrollDirection.RIGHT ? 'horizontal' : 'vertical';
    void this.call('Scroll', new GLib.Variant('(is)', [delta, orientation]));
    return Clutter.EVENT_STOP;
  }
}
