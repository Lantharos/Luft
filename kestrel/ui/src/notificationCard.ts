import Clutter from 'gi://Clutter';
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
  activate(): void;
  destroy(): void;
}

export interface NotificationSource extends SignalSource {
  title: string;
  notifications: Notification[];
}

export class NotificationCard {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification' });
  readonly open: St.Button;
  readonly refresh: () => void;

  constructor(source: NotificationSource, notification: Notification, menus: ContextMenus,
    changed: () => void, close: () => void, reveal: (actor: Clutter.Actor) => void) {
    const header = new St.BoxLayout();
    const sourceLabel = new St.Label({ text: source.title, style_class: 'kestrel-muted', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    source.connectObject('notify::title', changed, this.actor);
    header.add_child(sourceLabel);
    const dismiss = new St.Button({ style_class: 'kestrel-notification-dismiss', can_focus: true, track_hover: true,
      accessible_name: 'Dismiss notification', child: new St.Icon({ icon_name: 'window-close-symbolic', icon_size: 16 }) });
    dismiss.connect('clicked', () => notification.destroy());
    dismiss.connect('key-focus-in', () => reveal(dismiss));
    header.add_child(dismiss);
    this.actor.add_child(header);

    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, style_class: 'kestrel-notification-content' });
    const title = new St.Label({ text: notification.title, style_class: 'kestrel-section-title' });
    const body = new St.Label({ text: notification.body, visible: !!notification.body, style_class: 'kestrel-muted' });
    for (const label of [title, body]) {
      label.clutter_text.line_wrap = true;
      label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
      label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
      content.add_child(label);
    }
    this.open = new St.Button({ child: content, x_expand: true, can_focus: true, track_hover: true, style_class: 'kestrel-notification-open', accessible_name: notification.title });
    this.open.connect('clicked', () => { close(); notification.activate(); });
    this.open.connect('key-focus-in', () => reveal(this.open));
    this.open.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Delete) return Clutter.EVENT_PROPAGATE;
      notification.destroy();
      return Clutter.EVENT_STOP;
    });
    this.actor.add_child(this.open);

    const actions = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-notification-actions', visible: false });
    let displayedActions: Notification['actions'] = [];
    this.refresh = () => {
      sourceLabel.text = source.title;
      title.text = notification.title;
      this.open.accessible_name = notification.title;
      body.text = notification.body;
      body.visible = !!notification.body;
      if (displayedActions.length === notification.actions.length && displayedActions.every((action, index) => action === notification.actions[index])) return;
      displayedActions = [...notification.actions];
      actions.destroy_all_children();
      actions.visible = notification.actions.length > 0;
      for (const action of notification.actions) {
        const button = new St.Button({ label: action.label, style_class: 'kestrel-notification-action', can_focus: true, track_hover: true, x_expand: true });
        button.connect('clicked', () => { if (!notification.resident) close(); action.activate(); });
        button.connect('key-focus-in', () => reveal(button));
        actions.add_child(button);
      }
    };
    this.actor.add_child(actions);
    this.refresh();
    notification.connectObject('action-added', changed, 'action-removed', changed,
      'notify::datetime', changed,
      'notify::title', changed, 'notify::body', changed, this.actor);
    menus.bind(this.actor, () => [{ label: 'Open', run: () => { close(); notification.activate(); } },
      { label: 'Dismiss', run: () => notification.destroy() },
      { label: 'Notification settings', run: () => menus.settings('notifications') }]);
  }
}
