import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import { ensureActorVisibleInScrollView } from 'resource:///org/gnome/shell/misc/animationUtils.js';
import { NotificationCard, type Notification, type NotificationSource, type SignalSource } from './notificationCard.js';
import St from 'gi://St';
import type { ContextMenus } from './contextMenus.js';
import { blurSurface } from './surface.js';
import { Calendar } from './calendar.js';

export interface MessageTray extends SignalSource {
  getSources(): NotificationSource[];
}

export class NotificationCenter {
  readonly actor: St.BoxLayout;

  private readonly sources = new Set<NotificationSource>();
  private readonly items = new Map<Notification, NotificationCard>();
  private readonly clearButton = new St.Button({ style_class: 'kestrel-text-button', label: 'Clear all', can_focus: true });
  private refreshIdle = 0;
  private dirty = true;
  private closing = false;
  private first: NotificationCard | null = null;
  private readonly scroll: St.ScrollView;
  private readonly empty = new St.Label({ text: 'No notifications', style_class: 'kestrel-notification-empty' });
  private readonly list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-list' });
  private readonly header = new St.BoxLayout({ style_class: 'kestrel-notification-header', y_align: Clutter.ActorAlign.CENTER });
  private readonly calendar = new Calendar();

  constructor(private readonly tray: MessageTray, private readonly menus: ContextMenus, private readonly layoutChanged: () => void, private readonly close: () => void) {
    this.actor = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      name: 'kestrel-notifications',
      style_class: 'kestrel-popover kestrel-notification-center',
      visible: false,
      reactive: true,
    });
    blurSurface(this.actor, 20);
    menus.bind(this.actor, () => [
      { label: 'Clear all notifications', enabled: this.tray.getSources().some(source => source.notifications.length > 0), run: () => this.clear() },
      { label: 'Notification settings', run: () => menus.settings('notifications') },
    ]);

    this.header.add_child(new St.Label({
      text: 'Notifications',
      style_class: 'kestrel-section-title',
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    }));
    this.clearButton.connect('clicked', () => this.clear());
    this.header.add_child(this.clearButton);
    this.actor.add_child(this.header);

    const scroll = this.scroll = new St.ScrollView({
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      height: 0,
      y_expand: true,
    });
    scroll.child = this.list;
    this.actor.add_child(scroll);
    this.actor.add_child(this.calendar.actor);

    this.list.add_child(this.empty);
    this.tray.connectObject(
      'source-added', () => { this.watchSources(); this.invalidate(); },
      'source-removed', () => { this.watchSources(); this.invalidate(); },
      this.actor,
    );
    this.actor.connect('destroy', () => {
      if (this.refreshIdle) GLib.Source.remove(this.refreshIdle);
      this.sources.clear();
      this.items.clear();
      this.first = null;
    });
    this.watchSources();
  }

  private invalidate(): void {
    this.dirty = true;
    if (!this.actor.visible || this.closing || this.refreshIdle) return;
    this.refreshIdle = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      this.refreshIdle = 0;
      if (this.actor.visible) this.refresh();
      return GLib.SOURCE_REMOVE;
    });
  }

  prepareOpen(): void {
    this.closing = false;
    this.dirty = true;
    this.calendar.showToday();
    this.refresh();
  }
  freeze(): void { this.closing = true; }

  refresh(): void {
    if (this.closing || !this.dirty) return;
    this.dirty = false;
    const notifications = this.tray.getSources()
      .flatMap(source => source.notifications.map(notification => ({ source, notification })))
      .sort((a, b) => b.notification.datetime.compare(a.notification.datetime));
    const present = new Set(notifications.map(({ notification }) => notification));
    const focus = (global as unknown as Shell.Global).stage.get_key_focus();
    let focusRemoved = false;
    for (const [notification, item] of this.items) {
      if (present.has(notification)) continue;
      focusRemoved ||= !!focus && item.actor.contains(focus);
      item.actor.destroy();
      this.items.delete(notification);
    }
    this.first = null;
    this.empty.visible = notifications.length === 0;
    this.header.visible = notifications.length > 0;
    for (const [index, { source, notification }] of notifications.entries()) {
      let item = this.items.get(notification);
      if (!item) {
        item = new NotificationCard(source, notification, this.menus, () => this.invalidate(), this.close,
          actor => ensureActorVisibleInScrollView(this.scroll, actor));
        this.items.set(notification, item);
        this.list.add_child(item.actor);
      }
      if (index === 0) this.first = item;
      item.refresh();
      if (this.actor.visible) notification.acknowledged = true;
      if (this.list.get_child_at_index(index + 1) !== item.actor) this.list.set_child_at_index(item.actor, index + 1);
    }
    if (focusRemoved) {
      if (this.first) this.first.open.grab_key_focus();
      else this.actor.grab_key_focus();
    }
    if (this.actor.visible) this.layoutChanged();
  }

  focus(): void {
    if (this.first) this.first.open.grab_key_focus();
    else this.actor.grab_key_focus();
  }

  preferredHeight(width: number, limit: number): number {
    const theme = this.actor.get_theme_node();
    const contentWidth = width - theme.get_horizontal_padding();
    const spacing = theme.get_length('spacing');
    const header = this.header.visible ? this.header.get_preferred_height(contentWidth)[1] + spacing : 0;
    const chrome = header + this.calendar.actor.get_preferred_height(contentWidth)[1] + theme.get_vertical_padding() + spacing;
    return Math.min(limit, chrome + this.list.get_preferred_height(contentWidth)[1]);
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
