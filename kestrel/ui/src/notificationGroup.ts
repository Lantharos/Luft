import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ContextMenus } from './contextMenus.js';
import { NotificationCard, type Notification, type NotificationSource } from './notificationCard.js';

const COLLAPSED_COUNT = 2;

export class NotificationGroup {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-group' });
  private readonly cards = new Map<Notification, NotificationCard>();
  private readonly list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-group-list' });
  private readonly icon = new St.Icon({ icon_size: 16, style_class: 'kestrel-notification-group-icon' });
  private readonly title = new St.Label({ style_class: 'kestrel-muted', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  private readonly more = new St.Button({ style_class: 'kestrel-text-button kestrel-notification-more', can_focus: true, visible: false });
  private expanded = false;

  constructor(private readonly source: NotificationSource, private readonly menus: ContextMenus, private readonly changed: () => void,
    private readonly close: () => void, private readonly reveal: (actor: Clutter.Actor) => void) {
    const header = new St.BoxLayout({ style_class: 'kestrel-notification-group-header' });
    header.add_child(this.icon);
    header.add_child(this.title);
    this.more.connect('clicked', () => {
      this.expanded = !this.expanded;
      this.changed();
    });
    header.add_child(this.more);
    const clear = new St.Button({ style_class: 'kestrel-notification-dismiss', can_focus: true, track_hover: true,
      accessible_name: `Clear notifications from ${source.title}`, child: new St.Icon({ icon_name: 'edit-clear-all-symbolic', icon_size: 16 }) });
    clear.connect('clicked', () => { for (const notification of [...source.notifications]) notification.destroy(); });
    header.add_child(clear);
    this.actor.add_child(header);
    this.actor.add_child(this.list);
    source.connectObject('notify::title', changed, 'notify::icon', changed, this.actor);
  }

  get first(): NotificationCard | null {
    return this.cards.get(this.newest()[0]) ?? null;
  }

  private newest(): Notification[] {
    return [...this.source.notifications].sort((a, b) => b.datetime.compare(a.datetime));
  }

  refresh(acknowledge: boolean): void {
    const notifications = this.newest();
    const present = new Set(notifications);
    for (const [notification, card] of this.cards) {
      if (present.has(notification)) continue;
      card.actor.destroy();
      this.cards.delete(notification);
    }
    this.title.text = this.source.title;
    this.icon.gicon = this.source.icon;
    this.icon.visible = !!this.source.icon;
    const hidden = notifications.length - COLLAPSED_COUNT;
    if (hidden <= 0) this.expanded = false;
    this.more.visible = hidden > 0;
    this.more.label = this.more.accessible_name = this.expanded ? 'Show less' : `${hidden} more`;
    notifications.forEach((notification, index) => {
      let card = this.cards.get(notification);
      if (!card) {
        card = new NotificationCard(notification, this.menus, this.changed, this.close, this.reveal);
        this.cards.set(notification, card);
        this.list.add_child(card.actor);
      }
      card.refresh();
      card.actor.visible = this.expanded || index < COLLAPSED_COUNT;
      if (acknowledge) notification.acknowledged = true;
      if (this.list.get_child_at_index(index) !== card.actor) this.list.set_child_at_index(card.actor, index);
    });
  }
}
