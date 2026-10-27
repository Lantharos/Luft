import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as KestrelUi from '../../../kestrelUi.js';
import * as MessageList from './messageList.js';
import * as SignalTracker from '../../../core/runtime/signalTracker.js';
import type { NotificationSound } from '../../../system/sounds/sounds.js';

import { NotificationDestroyedReason, PrivacyScope, Urgency } from './notificationEnums.js';
import { NotificationGenericPolicy, NotificationPolicy } from './notificationPolicy.js';

const MAX_NOTIFICATIONS_PER_SOURCE = 10;

const URGENCY_SOUNDS: Record<Urgency, string> = {
  [Urgency.LOW]: 'dialog-information',
  [Urgency.NORMAL]: 'message-new-instant',
  [Urgency.HIGH]: 'message-new-instant',
  [Urgency.CRITICAL]: 'dialog-warning',
};

export const Sound = GObject.registerClass(
class Sound extends GObject.Object {
  constructor(readonly sound: NotificationSound | null) {
    super();
  }
});
export type Sound = InstanceType<typeof Sound>;

export const Action = GObject.registerClass(
class Action extends GObject.Object {
  constructor(readonly label: string, private readonly callback: () => void) {
    super();
  }

  activate(): void {
    this.callback();
  }
});
export type Action = InstanceType<typeof Action>;

export namespace Notification {
  export interface Signals extends GObject.Object.SignalSignatures {
    'action-added': (action: Action) => void;
    'action-removed': (action: Action) => void;
    'activated': () => void;
    'replied': (text: string) => void;
    'destroy': (reason: NotificationDestroyedReason) => void;
  }

  export interface Params {
    source: Source;
    title: string | null;
    body: string | null;
    useBodyMarkup: boolean;
    gicon: Gio.Icon | null;
    iconName: string;
    sound: Sound | null;
    senderPid: number;
    datetime: GLib.DateTime;
    privacyScope: PrivacyScope;
    urgency: Urgency;
    acknowledged: boolean;
    resident: boolean;
    forFeedback: boolean;
    isTransient: boolean;
    replyLabel: string | null;
    replyPlaceholder: string | null;
  }
}

export class Notification extends GObject.Object {
  declare connect: GObject.SignalMethods<this, Notification.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Notification.Signals>['emit'];

  declare source: Source;
  declare title: string | null;
  declare body: string | null;
  declare useBodyMarkup: boolean;
  declare gicon: Gio.Icon | null;
  declare sound: Sound | null;
  declare senderPid: number;
  declare datetime: GLib.DateTime;
  declare acknowledged: boolean;
  declare resident: boolean;
  declare forFeedback: boolean;
  declare isTransient: boolean;
  declare replyLabel: string | null;
  declare replyPlaceholder: string | null;

  declare private privacyScopeValue: PrivacyScope;
  declare private urgencyValue: Urgency;
  private actionList: Action[] = [];
  private updateDatetimeId = 0;
  private destroyed = false;

  constructor(params: Partial<Notification.Params>) {
    super(params);

    if (!this.datetime)
      this.datetime = GLib.DateTime.new_now_local();

    this.connect('notify', (_notification, pspec) => {
      if (pspec.name === 'acknowledged') return;
      if (pspec.name === 'datetime') {
        if (this.updateDatetimeId)
          GLib.source_remove(this.updateDatetimeId);
        this.updateDatetimeId = 0;
      } else if (!this.updateDatetimeId) {
        this.updateDatetimeId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
          this.updateDatetimeId = 0;
          this.datetime = GLib.DateTime.new_now_local();
        });
      }
    });
  }

  get actions(): Action[] {
    return this.actionList;
  }

  set iconName(iconName: string) {
    this.gicon = new Gio.ThemedIcon({ name: iconName });
  }

  get privacyScope(): PrivacyScope {
    return this.privacyScopeValue;
  }

  set privacyScope(privacyScope: PrivacyScope) {
    if (!Object.values(PrivacyScope).includes(privacyScope))
      throw new Error('out of range');
    if (this.privacyScopeValue === privacyScope) return;
    this.privacyScopeValue = privacyScope;
    this.notify('privacy-scope');
  }

  get urgency(): Urgency {
    return this.urgencyValue;
  }

  set urgency(urgency: Urgency) {
    if (!Object.values(Urgency).includes(urgency))
      throw new Error('out of range');
    if (this.urgencyValue === urgency) return;
    this.urgencyValue = urgency;
    this.notify('urgency');
  }

  addAction(label: string, callback: () => void): Action {
    const action = new Action(label, () => {
      callback();
      if (!this.resident)
        this.destroy();
    });
    this.actionList.push(action);
    this.emit('action-added', action);
    return action;
  }

  clearActions(): void {
    if (this.actionList.length === 0) return;
    this.actionList.forEach(action => this.emit('action-removed', action));
    this.actionList = [];
  }

  playSound(): void {
    if (this.forFeedback) return;
    KestrelUi.playNotificationSound({
      choice: this.source.policy.sound,
      requested: this.sound?.sound,
      fallback: { name: URGENCY_SOUNDS[this.urgency] },
      sender: { app: KestrelUi.sourceApp(this.source), pid: this.senderPid },
    });
  }

  activate(): void {
    console.assert(!this.destroyed, 'Activating a destroyed notification');
    this.emit('activated');
    if (this.destroyed || this.resident) return;
    this.destroy();
  }

  reply(text: string): void {
    this.emit('replied', text);
    if (!this.resident && !this.destroyed)
      this.destroy();
  }

  destroy(reason: NotificationDestroyedReason = NotificationDestroyedReason.DISMISSED): void {
    this.emit('destroy', reason);
    this.destroyed = true;
    if (this.updateDatetimeId)
      GLib.source_remove(this.updateDatetimeId);
    this.updateDatetimeId = 0;
    this.run_dispose();
  }
}

export namespace Source {
  export interface Signals extends GObject.Object.SignalSignatures {
    'destroy': (reason?: NotificationDestroyedReason) => void;
    'notification-added': (notification: Notification) => void;
    'notification-removed': (notification: Notification) => void;
    'notification-request-banner': (notification: Notification) => void;
  }

  export interface Params {
    title: string;
    icon: Gio.Icon | null;
    iconName: string;
    policy: NotificationPolicy;
  }
}

export const Source = GObject.registerClass({
  Properties: {
    'count': GObject.ParamSpec.int('count', null, null, GObject.ParamFlags.READABLE, 0, GLib.MAXINT32, 0),
    'policy': GObject.ParamSpec.object('policy', null, null, GObject.ParamFlags.READWRITE, NotificationPolicy.$gtype),
  },
  Signals: {
    'destroy': { param_types: [GObject.TYPE_UINT] },
    'notification-added': { param_types: [Notification.$gtype] },
    'notification-removed': { param_types: [Notification.$gtype] },
    'notification-request-banner': { param_types: [Notification.$gtype] },
  },
}, class Source extends MessageList.Source {
  declare connect: GObject.SignalMethods<this, Source.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Source.Signals>['emit'];

  notifications: Notification[] = [];
  declare private policyValue: NotificationPolicy;
  private inDestruction = false;

  constructor(params: Partial<Source.Params> = {}) {
    super(params);
    if (!this.policyValue)
      this.policyValue = new NotificationGenericPolicy();
  }

  get policy(): NotificationPolicy {
    return this.policyValue;
  }

  set policy(policy: NotificationPolicy) {
    this.policyValue?.destroy();
    this.policyValue = policy;
  }

  get count(): number {
    return this.notifications.length;
  }

  get unseenCount(): number {
    return this.notifications.filter(notification => !notification.acknowledged).length;
  }

  get countVisible(): boolean {
    return this.count > 1;
  }

  countUpdated(): void {
    this.notify('count');
  }

  get narrowestPrivacyScope(): PrivacyScope {
    return this.notifications.every(notification => notification.privacyScope === PrivacyScope.SYSTEM)
      ? PrivacyScope.SYSTEM
      : PrivacyScope.USER;
  }

  private onNotificationDestroy(notification: Notification): void {
    const index = this.notifications.indexOf(notification);
    if (index < 0)
      throw new Error('Notification was already removed previously');

    this.notifications.splice(index, 1);
    this.emit('notification-removed', notification);
    this.countUpdated();

    if (!this.inDestruction && this.notifications.length === 0)
      this.destroy();
  }

  addNotification(notification: Notification): void {
    if (this.notifications.includes(notification)) return;

    while (this.notifications.length >= MAX_NOTIFICATIONS_PER_SOURCE)
      this.notifications[0].destroy(NotificationDestroyedReason.EXPIRED);

    notification.connect('destroy', () => this.onNotificationDestroy(notification));
    notification.connect('notify::acknowledged', () => {
      this.countUpdated();
      if (!notification.acknowledged)
        this.emit('notification-request-banner', notification);
    });
    this.notifications.push(notification);

    this.emit('notification-added', notification);
    this.emit('notification-request-banner', notification);
    this.countUpdated();
  }

  destroy(reason?: NotificationDestroyedReason): void {
    this.inDestruction = true;
    while (this.notifications.length > 0)
      this.notifications[0].destroy(reason);

    this.emit('destroy', reason);
    this.policy.destroy();
    this.run_dispose();
  }

  open(): void {}

  destroyNonResidentNotifications(): void {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      if (!this.notifications[i].resident)
        this.notifications[i].destroy();
    }
  }
});
export type Source = InstanceType<typeof Source>;
SignalTracker.registerDestroyableType(Source);

GObject.registerClass({
  Properties: {
    'source': GObject.ParamSpec.object('source', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, Source),
    'title': GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE, null),
    'body': GObject.ParamSpec.string('body', null, null, GObject.ParamFlags.READWRITE, null),
    'use-body-markup': GObject.ParamSpec.boolean('use-body-markup', null, null, GObject.ParamFlags.READWRITE, false),
    'gicon': GObject.ParamSpec.object('gicon', null, null, GObject.ParamFlags.READWRITE, Gio.Icon),
    'icon-name': GObject.ParamSpec.string('icon-name', null, null, GObject.ParamFlags.READWRITE, null),
    'sound': GObject.ParamSpec.object('sound', null, null, GObject.ParamFlags.READWRITE, Sound),
    'sender-pid': GObject.ParamSpec.uint('sender-pid', null, null, GObject.ParamFlags.READWRITE, 0, GLib.MAXUINT32, 0),
    'datetime': GObject.ParamSpec.boxed('datetime', null, null, GObject.ParamFlags.READWRITE, GLib.DateTime),
    'privacy-scope': GObject.ParamSpec.int('privacy-scope', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, GLib.MAXINT32, PrivacyScope.USER),
    'urgency': GObject.ParamSpec.int('urgency', null, null, GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, GLib.MAXINT32, Urgency.NORMAL),
    'acknowledged': GObject.ParamSpec.boolean('acknowledged', null, null, GObject.ParamFlags.READWRITE, false),
    'resident': GObject.ParamSpec.boolean('resident', null, null, GObject.ParamFlags.READWRITE, false),
    'for-feedback': GObject.ParamSpec.boolean('for-feedback', null, null, GObject.ParamFlags.READWRITE, false),
    'is-transient': GObject.ParamSpec.boolean('is-transient', null, null, GObject.ParamFlags.READWRITE, false),
    'reply-label': GObject.ParamSpec.string('reply-label', null, null, GObject.ParamFlags.READWRITE, null),
    'reply-placeholder': GObject.ParamSpec.string('reply-placeholder', null, null, GObject.ParamFlags.READWRITE, null),
  },
  Signals: {
    'action-added': { param_types: [Action] },
    'action-removed': { param_types: [Action] },
    'activated': {},
    'replied': { param_types: [GObject.TYPE_STRING] },
    'destroy': { param_types: [GObject.TYPE_UINT] },
  },
}, Notification);
SignalTracker.registerDestroyableType(Notification);
