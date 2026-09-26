import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';
import type { ContextMenus } from './contextMenus.js';

export interface SignalSource {
  connectObject(...args: any[]): void;
  disconnectObject(owner: object): void;
}

export interface Notification extends SignalSource {
  title: string;
  body: string;
  datetime: GLib.DateTime;
  acknowledged: boolean;
  resident: boolean;
  actions: { label: string; activate(): void }[];
  replyLabel: string | null;
  replyPlaceholder: string | null;
  activate(): void;
  reply(text: string): void;
  destroy(): void;
}

export interface NotificationSource extends SignalSource {
  title: string;
  icon: Gio.Icon | null;
  notifications: Notification[];
}

export class NotificationCard {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification' });
  readonly open: St.Button;
  readonly refresh: () => void;
  private readonly actions = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-actions', visible: false });

  constructor(private readonly notification: Notification, menus: ContextMenus,
    changed: () => void, private readonly close: () => void, private readonly reveal: (actor: Clutter.Actor) => void) {
    const header = new St.BoxLayout();
    const title = new St.Label({ text: notification.title, style_class: 'kestrel-section-title', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    const body = new St.Label({ text: notification.body, visible: !!notification.body, style_class: 'kestrel-muted' });
    for (const label of [title, body]) {
      label.clutter_text.line_wrap = true;
      label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
      label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    }
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, style_class: 'kestrel-notification-content' });
    content.add_child(title);
    content.add_child(body);
    this.open = new St.Button({ child: content, x_expand: true, can_focus: true, track_hover: true, style_class: 'kestrel-notification-open', accessible_name: notification.title });
    this.open.connect('clicked', () => { close(); notification.activate(); });
    this.open.connect('key-focus-in', () => reveal(this.open));
    this.open.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Delete) return Clutter.EVENT_PROPAGATE;
      notification.destroy();
      return Clutter.EVENT_STOP;
    });
    header.add_child(this.open);
    const dismiss = new St.Button({ style_class: 'kestrel-notification-dismiss', can_focus: true, track_hover: true, y_align: Clutter.ActorAlign.START,
      accessible_name: 'Dismiss notification', child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: 16 }) });
    dismiss.connect('clicked', () => notification.destroy());
    dismiss.connect('key-focus-in', () => reveal(dismiss));
    header.add_child(dismiss);
    this.actor.add_child(header);
    this.actor.add_child(this.actions);

    let displayed: unknown[] = [];
    this.refresh = () => {
      title.text = notification.title;
      this.open.accessible_name = notification.title;
      body.text = notification.body;
      body.visible = !!notification.body;
      const current = [notification.replyLabel, ...notification.actions];
      if (displayed.length === current.length && displayed.every((entry, index) => entry === current[index])) return;
      displayed = current;
      this.showActions();
    };
    this.refresh();
    notification.connectObject('action-added', changed, 'action-removed', changed,
      'notify::datetime', changed, 'notify::reply-label', changed,
      'notify::title', changed, 'notify::body', changed, this.actor);
    menus.bind(this.actor, () => [{ label: 'Open', run: () => { close(); notification.activate(); } },
      { label: 'Dismiss', run: () => notification.destroy() },
      { label: 'Notification settings', run: () => menus.settings('notifications') }]);
  }

  private button(label: string, activate: () => void): St.Button {
    const button = new St.Button({ label, accessible_name: label, style_class: 'kestrel-notification-action', can_focus: true, track_hover: true, x_expand: true });
    button.connect('clicked', activate);
    button.connect('key-focus-in', () => this.reveal(button));
    return button;
  }

  private showActions(): void {
    const { notification } = this;
    this.actions.destroy_all_children();
    this.actions.visible = notification.actions.length > 0 || !!notification.replyLabel;
    if (notification.replyLabel) this.actions.add_child(this.button(notification.replyLabel, () => this.showReply()));
    for (const action of notification.actions)
      this.actions.add_child(this.button(action.label, () => { if (!notification.resident) this.close(); action.activate(); }));
  }

  private showReply(): void {
    this.actions.destroy_all_children();
    const row = new St.BoxLayout({ style_class: 'kestrel-notification-reply' });
    const entry = new St.Entry({ style_class: 'kestrel-notification-reply-entry', hint_text: this.notification.replyPlaceholder ?? '', can_focus: true, x_expand: true });
    const send = new St.Button({ style_class: 'kestrel-notification-reply-send', can_focus: true, accessible_name: 'Send reply',
      child: new St.Icon({ icon_name: 'mail-send-symbolic', icon_size: 16 }) });
    const submit = () => {
      const text = entry.text.trim();
      if (text) this.notification.reply(text);
    };
    entry.clutter_text.connect('activate', submit);
    entry.clutter_text.connect('key-press-event', (_actor, event: Clutter.Event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Escape) return Clutter.EVENT_PROPAGATE;
      this.showActions();
      this.open.grab_key_focus();
      return Clutter.EVENT_STOP;
    });
    send.connect('clicked', submit);
    row.add_child(entry);
    row.add_child(send);
    this.actions.add_child(row);
    entry.grab_key_focus();
    this.reveal(row);
  }
}
