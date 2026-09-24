import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import type { ContextMenus } from './contextMenus.js';
import { blurSurface } from './surface.js';

interface SignalSource {
  connect(signal: string, callback: () => void): number;
  connectObject(...args: any[]): void;
  disconnectObject(owner: object): void;
}

interface Notification extends SignalSource {
  title: string;
  body: string;
  destroy(): void;
}

interface Source extends SignalSource {
  title: string;
  notifications: Notification[];
  connect(signal: string, callback: () => void): number;
}

export interface MessageTray extends SignalSource {
  getSources(): Source[];
  connect(signal: string, callback: () => void): number;
}

export class NotificationCenter {
  readonly actor: St.BoxLayout;

  private readonly sources = new Set<Source>();
  private readonly items = new Map<Notification, { actor: St.BoxLayout }>();
  private refreshIdle = 0;
  private dirty = true;
  private readonly empty = new St.Label({ text: 'No notifications', style_class: 'kestrel-empty' });
  private readonly list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-list' });

  constructor(private readonly tray: MessageTray, private readonly menus: ContextMenus, private readonly layoutChanged: () => void) {
    this.actor = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      name: 'kestrel-notifications',
      style_class: 'kestrel-popover kestrel-notification-center',
      visible: false,
      reactive: true,
    });
    blurSurface(this.actor, 20);
    menus.bind(this.actor, () => [
      { label: 'Clear all notifications', run: () => this.clear() },
      { label: 'Notification settings', run: () => menus.settings('notifications') },
    ]);

    const header = new St.BoxLayout({ style_class: 'kestrel-notification-header', y_align: Clutter.ActorAlign.CENTER });
    header.add_child(new St.Label({
      text: 'Notifications',
      style_class: 'kestrel-title',
      x_expand: true,
    }));
    const clearButton = new St.Button({
      style_class: 'kestrel-text-button',
      label: 'Clear all',
      can_focus: true,
    });
    clearButton.connect('clicked', () => this.clear());
    header.add_child(clearButton);
    this.actor.add_child(header);

    const scroll = new St.ScrollView({
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      height: 0,
      y_expand: true,
    });
    scroll.child = this.list;
    this.actor.add_child(scroll);

    this.list.add_child(this.empty);
    this.tray.connectObject(
      'source-added', () => { this.watchSources(); this.invalidate(); },
      'source-removed', () => { this.watchSources(); this.invalidate(); },
      this.actor,
    );
    this.actor.connect('notify::visible', () => { if (this.actor.visible) this.refresh(); });
    this.actor.connect('destroy', () => {
      if (this.refreshIdle) GLib.Source.remove(this.refreshIdle);
      this.sources.clear();
      this.items.clear();
    });
    this.watchSources();
  }

  private invalidate(): void {
    this.dirty = true;
    if (!this.actor.visible || this.refreshIdle) return;
    this.refreshIdle = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.refreshIdle = 0;
      if (this.actor.visible) this.refresh();
      return GLib.SOURCE_REMOVE;
    });
  }

  refresh(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const notifications = this.tray.getSources()
      .flatMap(source => source.notifications.map(notification => ({ source, notification })))
      .reverse();
    const present = new Set(notifications.map(({ notification }) => notification));
    for (const [notification, item] of this.items) {
      if (present.has(notification)) continue;
      item.actor.destroy();
      this.items.delete(notification);
    }
    this.empty.visible = notifications.length === 0;
    for (const [index, { source, notification }] of notifications.entries()) {
      let item = this.items.get(notification);
      if (!item) {
        const actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification', reactive: true, can_focus: true });
        const sourceLabel = new St.Label({ text: source.title, style_class: 'kestrel-muted' });
        const title = new St.Label({ text: notification.title, style_class: 'kestrel-section-title' });
        const body = new St.Label({ text: notification.body, visible: !!notification.body, style_class: 'kestrel-muted' });
        actor.add_child(sourceLabel);
        actor.add_child(title);
        actor.add_child(body);
        const update = () => {
          title.text = notification.title;
          body.text = notification.body;
          body.visible = !!notification.body;
          this.invalidate();
        };
        notification.connectObject('notify::title', update, 'notify::body', update, actor);
        this.menus.bind(actor, () => [{ label: 'Dismiss', run: () => notification.destroy() },
          { label: 'Notification settings', run: () => this.menus.settings('notifications') }]);
        item = { actor };
        this.items.set(notification, item);
        this.list.add_child(actor);
      }
      if (this.list.get_child_at_index(index + 1) !== item.actor) this.list.set_child_at_index(item.actor, index + 1);
    }
    if (this.actor.visible) this.layoutChanged();
  }

  preferredHeight(width: number, limit: number): number {
    const theme = this.actor.get_theme_node();
    const contentWidth = width - theme.get_horizontal_padding();
    const header = this.actor.get_first_child()!.get_preferred_height(contentWidth)[1];
    return Math.min(limit, header + this.list.get_preferred_height(contentWidth)[1] + theme.get_vertical_padding() + theme.get_length('spacing'));
  }

  private watchSources(): void {
    const present = new Set(this.tray.getSources());
    for (const source of this.sources) {
      if (present.has(source)) continue;
      source.disconnectObject(this.actor);
      this.sources.delete(source);
    }
    for (const source of present) {
      if (this.sources.has(source)) continue;
      this.sources.add(source);
      source.connectObject(
        'notification-added', () => this.invalidate(),
        'notification-removed', () => this.invalidate(),
        this.actor,
      );
    }
  }

  private clear(): void {
    for (const source of this.tray.getSources()) {
      for (const notification of [...source.notifications]) notification.destroy();
    }
    this.invalidate();
  }
}
