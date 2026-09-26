import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import { ensureActorVisibleInScrollView } from 'resource:///org/gnome/shell/misc/animationUtils.js';
import type { NotificationCard, NotificationSource, SignalSource } from './notificationCard.js';
import { NotificationGroup } from './notificationGroup.js';
import St from 'gi://St';
import type { ContextMenus } from './contextMenus.js';
import { blurSurface } from './surface.js';
import { Calendar } from './calendar.js';
import { MediaCard } from './media.js';

export interface MessageTray extends SignalSource {
  bannerBlocked: boolean;
  getSources(): NotificationSource[];
}

const LOCK_SCREEN_CONTENT = 'kestrel-lock-screen-content';

export class NotificationCenter {
  readonly actor: St.BoxLayout;
  private readonly shellSettings = new Gio.Settings({ schema_id: 'org.gnome.shell' });

  private readonly sources = new Set<NotificationSource>();
  private readonly groups = new Map<NotificationSource, NotificationGroup>();
  private readonly clearButton = new St.Button({ style_class: 'kestrel-text-button', label: 'Clear all', can_focus: true });
  private refreshIdle = 0;
  private dirty = true;
  private closing = false;
  private first: NotificationCard | null = null;
  private readonly scroll: St.ScrollView;
  private readonly list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-list' });
  private readonly header = new St.BoxLayout({ style_class: 'kestrel-notification-header', y_align: Clutter.ActorAlign.CENTER });
  private readonly calendar = new Calendar();
  private readonly media: MediaCard;

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
      { label: 'Show message content on the lock screen', checked: this.shellSettings.get_boolean(LOCK_SCREEN_CONTENT),
        run: () => this.shellSettings.set_boolean(LOCK_SCREEN_CONTENT, !this.shellSettings.get_boolean(LOCK_SCREEN_CONTENT)) },
      { label: 'Notification settings', run: () => menus.settings('notifications') },
    ]);

    this.media = new MediaCard(() => { if (this.actor.visible) this.layoutChanged(); });
    this.actor.add_child(this.media.actor);
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

    this.tray.connectObject(
      'source-added', () => { this.watchSources(); this.invalidate(); },
      'source-removed', () => { this.watchSources(); this.invalidate(); },
      this.actor,
    );
    this.actor.connect('destroy', () => {
      if (this.refreshIdle) GLib.Source.remove(this.refreshIdle);
      this.sources.clear();
      this.groups.clear();
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
    const sources = this.tray.getSources()
      .filter(source => source.notifications.length > 0)
      .map(source => ({ source, newest: source.notifications.reduce((a, b) => a.datetime.compare(b.datetime) >= 0 ? a : b).datetime }))
      .sort((a, b) => b.newest.compare(a.newest))
      .map(({ source }) => source);
    const present = new Set(sources);
    const stage = (global as unknown as Shell.Global).stage;
    const focus = stage.get_key_focus();
    const focusInside = !!focus && this.actor.contains(focus);
    for (const [source, group] of this.groups) {
      if (present.has(source)) continue;
      group.actor.destroy();
      this.groups.delete(source);
    }
    this.scroll.visible = sources.length > 0;
    this.header.visible = sources.length > 0;
    sources.forEach((source, index) => {
      let group = this.groups.get(source);
      if (!group) {
        group = new NotificationGroup(source, this.menus, () => this.invalidate(), this.close,
          actor => ensureActorVisibleInScrollView(this.scroll, actor));
        this.groups.set(source, group);
        this.list.add_child(group.actor);
      }
      group.refresh(this.actor.visible);
      if (this.list.get_child_at_index(index) !== group.actor) this.list.set_child_at_index(group.actor, index);
    });
    this.first = sources.length ? this.groups.get(sources[0])!.first : null;
    const current = stage.get_key_focus();
    if (focusInside && (!current || !current.mapped || !this.actor.contains(current))) {
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
    const height = (actor: Clutter.Actor) => actor.get_preferred_height(contentWidth)[1];
    const parts = [
      this.media.actor.visible ? height(this.media.actor) : null,
      this.header.visible ? height(this.header) : null,
      this.scroll.visible ? height(this.list) : null,
      height(this.calendar.actor),
    ].filter((part): part is number => part !== null);
    return Math.min(limit, parts.reduce((sum, part) => sum + part, 0) + spacing * (parts.length - 1) + theme.get_vertical_padding());
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
