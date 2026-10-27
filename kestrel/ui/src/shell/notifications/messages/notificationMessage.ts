import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import type { Action, Notification } from '../notification.js';
import { NotificationDestroyedReason } from '../notificationEnums.js';
import { Message } from './message.js';

const MAX_NOTIFICATION_BUTTONS = 3;

export const NotificationMessage = GObject.registerClass(
class NotificationMessage extends Message {
  notification: Notification | null;
  private closed = false;
  private readonly actionButtons = new Map<Action, St.Button>();
  private replyButton: St.Button | null = null;
  private buttonBox: St.BoxLayout | null = null;

  constructor(notification: Notification) {
    super(notification.source);

    this.notification = notification;

    notification.connectObject(
      'action-added', (_notification: Notification, action: Action) => this.addAction(action),
      'action-removed', (_notification: Notification, action: Action) => this.removeAction(action),
      'destroy', () => {
        this.notification = null;
        if (!this.closed)
          this.close();
      }, this);

    notification.bind_property('title', this, 'title', GObject.BindingFlags.SYNC_CREATE);
    notification.bind_property('body', this, 'body', GObject.BindingFlags.SYNC_CREATE);
    notification.bind_property('use-body-markup', this, 'use-body-markup', GObject.BindingFlags.SYNC_CREATE);
    notification.bind_property('datetime', this, 'datetime', GObject.BindingFlags.SYNC_CREATE);
    notification.bind_property('gicon', this, 'icon', GObject.BindingFlags.SYNC_CREATE);

    notification.actions.forEach(action => this.addAction(action));

    notification.connectObject('notify::reply-label', () => this.syncReply(), this);
    this.syncReply();
  }

  on_close(): void {
    this.closed = true;
    this.notification?.destroy(NotificationDestroyedReason.DISMISSED);
  }

  vfunc_clicked(): void {
    this.notification?.activate();
  }

  canClose(): boolean {
    return true;
  }

  private ensureButtonBox(): St.BoxLayout {
    if (this.buttonBox) return this.buttonBox;
    this.buttonBox = new St.BoxLayout({
      x_expand: true,
      style_class: 'notification-buttons-bin',
    });
    this.setActionArea(this.buttonBox);
    global.focus_manager.add_group(this.buttonBox);
    return this.buttonBox;
  }

  private syncReply(): void {
    this.replyButton?.destroy();
    this.replyButton = null;
    const label = this.notification?.replyLabel;
    if (!label) return;

    const buttonBox = this.ensureButtonBox();
    this.replyButton = new St.Button({
      style_class: 'notification-button',
      x_expand: true,
      label,
    });
    this.replyButton.connect('clicked', () => this.showReplyEntry());
    buttonBox.insert_child_at_index(this.replyButton, 0);
  }

  private showReplyEntry(): void {
    const entry = new St.Entry({
      style_class: 'notification-reply-entry',
      hint_text: this.notification!.replyPlaceholder,
      can_focus: true,
      x_expand: true,
    });
    const send = new St.Button({
      style_class: 'notification-reply-send',
      icon_name: 'mail-send-symbolic',
      accessible_name: KestrelUi.t('messages-reply-send'),
      can_focus: true,
    });
    const submit = () => {
      const text = entry.text.trim();
      if (text)
        this.notification?.reply(text);
    };
    entry.clutter_text.connect('activate', submit);
    send.connect('clicked', submit);

    const box = new St.BoxLayout({ style_class: 'notification-reply', x_expand: true });
    box.add_child(entry);
    box.add_child(send);
    this.setActionArea(box);
    entry.grab_key_focus();
  }

  private addAction(action: Action): void {
    const buttonBox = this.ensureButtonBox();
    if (buttonBox.get_n_children() >= MAX_NOTIFICATION_BUTTONS) return;

    const button = new St.Button({
      style_class: 'notification-button',
      x_expand: true,
      label: action.label,
    });
    button.connect('clicked', () => action.activate());

    this.actionButtons.set(action, button);
    buttonBox.add_child(button);
  }

  private removeAction(action: Action): void {
    this.actionButtons.get(action)?.destroy();
    this.actionButtons.delete(action);
  }
});
export type NotificationMessage = InstanceType<typeof NotificationMessage>;
