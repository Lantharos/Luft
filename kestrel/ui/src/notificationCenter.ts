import Clutter from 'gi://Clutter';
import St from 'gi://St';
import type { ContextMenus } from './contextMenus.js';
import { blurSurface } from './surface.js';

interface Notification {
  title: string;
  body: string;
  destroy(): void;
}

interface Source {
  title: string;
  notifications: Notification[];
  connect(signal: string, callback: () => void): number;
}

export interface MessageTray {
  getSources(): Source[];
  connect(signal: string, callback: () => void): number;
}

export class NotificationCenter {
  readonly actor: St.BoxLayout;

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

    this.tray.connect('source-added', () => {
      this.watchSources();
      this.refresh();
    });
    this.tray.connect('source-removed', () => this.refresh());
    this.watchSources();
    this.refresh();
  }

  refresh(): void {
    this.list.destroy_all_children();

    const notifications = this.tray.getSources()
      .flatMap(source => source.notifications.map(notification => ({ source, notification })))
      .reverse();

    if (notifications.length === 0) {
      this.list.add_child(new St.Label({
        text: 'No notifications',
        style_class: 'kestrel-empty',
      }));
      if (this.actor.visible) this.layoutChanged();
      return;
    }

    for (const { source, notification } of notifications) {
      const item = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification', reactive: true, can_focus: true });
      item.add_child(new St.Label({ text: source.title, style_class: 'kestrel-muted' }));
      item.add_child(new St.Label({ text: notification.title, style_class: 'kestrel-section-title' }));
      if (notification.body)
        item.add_child(new St.Label({ text: notification.body, style_class: 'kestrel-muted' }));
      this.menus.bind(item, () => [{ label: 'Dismiss', run: () => notification.destroy() },
        { label: 'Notification settings', run: () => this.menus.settings('notifications') }]);
      this.list.add_child(item);
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
    for (const source of this.tray.getSources()) {
      if (watchedSources.has(source))
        continue;
      watchedSources.add(source);
      source.connect('notification-added', () => this.refresh());
      source.connect('notification-removed', () => this.refresh());
    }
  }

  private clear(): void {
    for (const source of this.tray.getSources()) {
      for (const notification of [...source.notifications])
        notification.destroy();
    }
    this.refresh();
  }
}

const watchedSources = new WeakSet<Source>();
