import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as GnomeSession from '../../../session/actions/gnomeSession.js';
import * as KestrelUi from '../../../kestrelUi.js';
import * as Layout from '../../../core/stage/layout.js';
import * as Main from '../../../core/main.js';
import * as MessageList from './messageList.js';

import { bannerAllowed, soundAllowed } from './bannerRules.js';
import { FocusGrabber } from './focusGrabber.js';
import { Notification, Source } from './notification.js';
import { NotificationDestroyedReason, State, Urgency } from './notificationEnums.js';
import type { NotificationPolicy } from './notificationPolicy.js';

export { Action, Notification, Sound, Source } from './notification.js';
export { NotificationDestroyedReason, PrivacyScope, State, Urgency } from './notificationEnums.js';
export { NotificationApplicationPolicy, NotificationGenericPolicy, NotificationPolicy } from './notificationPolicy.js';
export { getSystemSource } from './systemSource.js';

const SHELL_KEYBINDINGS_SCHEMA = 'com.lantharos.kestrel.keybindings';

export const ANIMATION_TIME = 200;
const BANNER_SHOW_TIME = 260;
const BANNER_SLIDE_DISTANCE = 48;

const NOTIFICATION_TIMEOUT = 4000;

const HIDE_TIMEOUT = 200;
const LONGER_HIDE_TIMEOUT = 600;

const MAX_NOTIFICATIONS_IN_QUEUE = 3;

const MOUSE_LEFT_ACTOR_THRESHOLD = 20;

const IDLE_TIME = 1000;

interface PresenceRemote {
  readonly status: number;
  connectSignal(name: 'StatusChanged', callback: (proxy: Gio.DBusProxy, sender: string, args: [number]) => void): number;
}

type NotificationBanner = InstanceType<typeof MessageList.NotificationMessage>;

export namespace MessageTray {
  export interface Signals extends St.Widget.SignalSignatures {
    'queue-changed': () => void;
    'source-added': (source: Source) => void;
    'source-removed': (source: Source) => void;
  }
}

export class MessageTray extends St.Widget {
  static [GObject.signals] = {
    'queue-changed': {},
    'source-added': { param_types: [Source.$gtype] },
    'source-removed': { param_types: [Source.$gtype] },
  };

  static {
    GObject.registerClass(this);

    this.get_binding_pool().install_closure('close', Clutter.KEY_Escape, Clutter.ModifierType.RELEASE_MASK, ((tray: MessageTray) => {
      tray.expireNotification();
      return Clutter.EVENT_STOP;
    }) as unknown as GObject.Closure);
  }

  declare connect: GObject.SignalMethods<this, MessageTray.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, MessageTray.Signals>['emit'];

  private readonly presence: Gio.DBusProxy & PresenceRemote;
  private busy = false;
  private bannerBlockedValue = false;
  private readonly notificationSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' });
  private readonly bannerBin: St.Widget;
  private readonly notificationFocusGrabber: FocusGrabber;
  private notificationQueue: Notification[] = [];
  private notification: Notification | null = null;
  private banner: NotificationBanner | null = null;
  private userActiveWhileNotificationShown = false;
  private readonly idleMonitor = global.backend.get_core_idle_monitor();
  private useLongerNotificationLeftTimeout = false;
  private pointerInNotification = false;
  private notificationHovered = false;
  private bannerHeld = false;
  private notificationState: State = State.HIDDEN;
  private notificationTimeoutId = 0;
  private notificationRemoved = false;
  private notificationExpired = false;
  private notificationLeftTimeoutId = 0;
  private notificationLeftMouseX = -1;
  private notificationLeftMouseY = -1;
  private showNotificationMouseX = -1;
  private showNotificationMouseY = -1;
  private lastSeenMouseX = 0;
  private lastSeenMouseY = 0;
  private updatingState = false;
  private readonly sources = new Set<Source>();

  constructor() {
    super({
      visible: false,
      clip_to_allocation: true,
      layout_manager: new Clutter.BinLayout(),
    });

    this.presence = GnomeSession.Presence((proxy: PresenceRemote) => this.onStatusChanged(proxy.status)) as Gio.DBusProxy & PresenceRemote;
    this.presence.connectSignal('StatusChanged', (_proxy, _sender, [status]) => this.onStatusChanged(status));

    this.add_constraint(new Layout.MonitorConstraint({ primary: true, work_area: true }));

    this.bannerBin = new St.Widget({
      name: 'notification-container',
      reactive: true,
      track_hover: true,
      y_align: Clutter.ActorAlign.END,
      x_align: Clutter.ActorAlign.END,
      y_expand: true,
      x_expand: true,
      layout_manager: new Clutter.BinLayout(),
    });
    this.bannerBin.connect('notify::hover', () => this.onNotificationHoverChanged());
    this.add_child(this.bannerBin);

    this.notificationFocusGrabber = new FocusGrabber(this.bannerBin);

    Main.layoutManager.addChrome(this);
    Main.layoutManager.trackChrome(this.bannerBin);

    global.display.connectObject('in-fullscreen-changed', () => this.updateState(), this);

    Main.sessionMode.connect('updated', () => this.updateState());

    Main.xdndHandler.connect('drag-begin', () => Shell.util_set_hidden_from_pick(this, true));
    Main.xdndHandler.connect('drag-end', () => Shell.util_set_hidden_from_pick(this, false));

    Main.wm.addKeybinding('focus-active-notification',
      new Gio.Settings({ schema_id: SHELL_KEYBINDINGS_SCHEMA }),
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
      () => this.expandActiveNotification());

    this.updateState();
  }

  private expireNotification(): void {
    this.notificationExpired = true;
    this.updateState();
  }

  get queueCount(): number {
    return this.notificationQueue.length;
  }

  set bannerBlocked(blocked: boolean) {
    if (this.bannerBlockedValue === blocked) return;
    this.bannerBlockedValue = blocked;
    this.updateState();
  }

  hasSource(source: Source): boolean {
    return this.sources.has(source);
  }

  add(source: Source): void {
    if (this.hasSource(source)) {
      log(`Trying to re-add source ${source.title}`);
      return;
    }

    source.policy.store();
    source.policy.connect('notify::enable', () => this.onSourceEnableChanged(source.policy, source));
    source.policy.connect('notify', () => this.updateState());
    this.onSourceEnableChanged(source.policy, source);
  }

  private addSource(source: Source): void {
    this.sources.add(source);
    source.connectObject(
      'notification-request-banner', (_source: Source, notification: Notification) => this.onNotificationRequestBanner(notification),
      'notification-removed', (_source: Source, notification: Notification) => this.onNotificationRemoved(notification),
      'destroy', () => this.removeSource(source), this);
    this.emit('source-added', source);
  }

  private removeSource(source: Source): void {
    this.sources.delete(source);
    source.disconnectObject(this);
    this.emit('source-removed', source);
  }

  getSources(): Source[] {
    return [...this.sources.keys()];
  }

  private onSourceEnableChanged(policy: NotificationPolicy, source: Source): void {
    if (this.hasSource(source) === policy.enable) return;
    if (policy.enable)
      this.addSource(source);
    else
      this.removeSource(source);
  }

  private onNotificationRemoved(notification: Notification): void {
    if (this.notification === notification) {
      this.notificationRemoved = true;
      if (this.notificationState === State.SHOWN || this.notificationState === State.SHOWING) {
        this.pointerInNotification = false;
        this.updateNotificationTimeout(0);
        this.updateState();
      }
      return;
    }
    const index = this.notificationQueue.indexOf(notification);
    if (index === -1) return;
    this.notificationQueue.splice(index, 1);
    this.emit('queue-changed');
  }

  private onNotificationRequestBanner(notification: Notification): void {
    if (notification.acknowledged) return;

    if (soundAllowed(notification, this.notificationSettings))
      notification.playSound();

    if (!bannerAllowed(notification, this.notificationSettings)) {
      if (!notification.source.policy.keepInList)
        this.discardSoon(notification);
      return;
    }

    if (this.notification === notification) {
      this.updateShowingNotification();
    } else if (!this.notificationQueue.includes(notification)) {
      const bannerCount = this.notification ? 1 : 0;
      const full = this.queueCount + bannerCount >= MAX_NOTIFICATIONS_IN_QUEUE;
      if (!full || notification.urgency === Urgency.CRITICAL) {
        this.notificationQueue.push(notification);
        this.notificationQueue.sort((n1, n2) => n2.urgency - n1.urgency);
        this.emit('queue-changed');
      }
    }
    this.updateState();
  }

  private discardSoon(notification: Notification): void {
    let idleId = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      idleId = 0;
      notification.destroy(NotificationDestroyedReason.EXPIRED);
      return GLib.SOURCE_REMOVE;
    });
    notification.connect('destroy', () => {
      if (idleId)
        GLib.source_remove(idleId);
    });
  }

  private resetNotificationLeftTimeout(): void {
    this.useLongerNotificationLeftTimeout = false;
    if (!this.notificationLeftTimeoutId) return;
    GLib.source_remove(this.notificationLeftTimeoutId);
    this.notificationLeftTimeoutId = 0;
    this.notificationLeftMouseX = -1;
    this.notificationLeftMouseY = -1;
  }

  private onNotificationHoverChanged(): void {
    if (this.bannerBin.hover === this.notificationHovered) return;

    this.notificationHovered = this.bannerBin.hover;
    if (this.notificationHovered) {
      this.resetNotificationLeftTimeout();

      if (this.showNotificationMouseX >= 0) {
        const actorAtShowNotificationPosition =
          global.stage.get_actor_at_pos(Clutter.PickMode.ALL, this.showNotificationMouseX, this.showNotificationMouseY);
        this.showNotificationMouseX = -1;
        this.showNotificationMouseY = -1;
        if (this.bannerBin.contains(actorAtShowNotificationPosition)) {
          this.useLongerNotificationLeftTimeout = true;
          return;
        }
      }

      this.pointerInNotification = true;
      this.updateState();
      return;
    }

    const [x, y] = global.get_pointer();
    this.notificationLeftMouseX = x;
    this.notificationLeftMouseY = y;

    const timeout = this.useLongerNotificationLeftTimeout ? LONGER_HIDE_TIMEOUT : HIDE_TIMEOUT;
    this.scheduleNotificationLeftTimeout(timeout);
  }

  private scheduleNotificationLeftTimeout(timeout: number): void {
    this.notificationLeftTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, timeout, () => this.onNotificationLeftTimeout());
    GLib.Source.set_name_by_id(this.notificationLeftTimeoutId, '[kestrel] this._onNotificationLeftTimeout');
  }

  private onStatusChanged(status: number): void {
    if (status === GnomeSession.PresenceStatus.BUSY) {
      this.updateNotificationTimeout(0);
      this.busy = true;
    } else if (status !== GnomeSession.PresenceStatus.IDLE) {
      this.busy = false;
    }
    this.updateState();
  }

  private onNotificationLeftTimeout(): void {
    const [x, y] = global.get_pointer();
    if (this.notificationLeftMouseX > -1 &&
      y < this.notificationLeftMouseY + MOUSE_LEFT_ACTOR_THRESHOLD &&
      y > this.notificationLeftMouseY - MOUSE_LEFT_ACTOR_THRESHOLD &&
      x < this.notificationLeftMouseX + MOUSE_LEFT_ACTOR_THRESHOLD &&
      x > this.notificationLeftMouseX - MOUSE_LEFT_ACTOR_THRESHOLD) {
      this.notificationLeftMouseX = -1;
      this.scheduleNotificationLeftTimeout(LONGER_HIDE_TIMEOUT);
      return;
    }
    this.notificationLeftTimeoutId = 0;
    this.useLongerNotificationLeftTimeout = false;
    this.pointerInNotification = false;
    this.updateNotificationTimeout(0);
    this.updateState();
  }

  private updateState(): void {
    const hasMonitor = Main.layoutManager.primaryMonitor != null;
    this.visible = !this.bannerBlockedValue && hasMonitor && this.banner != null;
    if (this.bannerBlockedValue || !hasMonitor) return;
    if (this.updatingState) return;

    this.updatingState = true;

    let changed = false;
    this.notificationQueue = this.notificationQueue.filter(notification => {
      changed ||= notification.acknowledged;
      return !notification.acknowledged;
    });
    if (changed)
      this.emit('queue-changed');

    const hasNotifications: boolean = Main.sessionMode.hasNotifications;

    if (this.notificationState === State.HIDDEN) {
      const nextNotification = this.notificationQueue[0] || null;
      if (hasNotifications && nextNotification) {
        const limited = this.busy || Main.layoutManager.primaryMonitor!.inFullscreen;
        if (!limited || nextNotification.forFeedback || nextNotification.urgency === Urgency.CRITICAL)
          this.showNotification();
      }
    } else if (this.notificationState === State.SHOWING || this.notificationState === State.SHOWN) {
      const expired = (!this.bannerHeld &&
        this.userActiveWhileNotificationShown &&
        this.notificationState === State.SHOWN &&
        this.notificationTimeoutId === 0 &&
        this.notification!.urgency !== Urgency.CRITICAL &&
        !this.pointerInNotification) || this.notificationExpired;
      const mustClose = this.notificationRemoved || !hasNotifications || expired;

      if (mustClose)
        this.hideNotification(hasNotifications && !this.notificationRemoved);
      else if (this.notificationState === State.SHOWN && this.pointerInNotification && !this.banner!.expanded)
        this.expandBanner(false);
      else if (this.notificationState === State.SHOWN && this.pointerInNotification)
        this.notificationFocusGrabber.grabFocus();
    }

    this.updatingState = false;
    this.notificationExpired = false;
  }

  private onIdleMonitorBecameActive(): void {
    this.userActiveWhileNotificationShown = true;
    this.updateNotificationTimeout(2000);
    this.updateState();
  }

  private showNotification(): void {
    const notification = this.notificationQueue.shift()!;
    this.notification = notification;
    this.emit('queue-changed');

    this.userActiveWhileNotificationShown = this.idleMonitor.get_idletime() <= IDLE_TIME;
    if (!this.userActiveWhileNotificationShown)
      this.idleMonitor.add_user_active_watch(() => this.onIdleMonitorBecameActive());

    const banner = this.banner = new MessageList.NotificationMessage(notification);
    banner.can_focus = false;
    banner.header.expandButton.visible = false;
    banner.add_style_class_name('notification-banner');

    this.bannerBin.add_child(banner);
    new KestrelUi.SwipeAway(banner, {
      downward: true,
      held: held => this.holdBanner(held),
      dismissed: () => this.notification!.destroy(NotificationDestroyedReason.DISMISSED),
    });

    this.bannerBin.opacity = 0;
    this.bannerBin.translation_y = BANNER_SLIDE_DISTANCE;
    this.show();

    global.compositor.disable_unredirect();
    this.updateShowingNotification();

    const [x, y] = global.get_pointer();
    this.showNotificationMouseX = x;
    this.showNotificationMouseY = y;
    this.lastSeenMouseX = x;
    this.lastSeenMouseY = y;

    this.resetNotificationLeftTimeout();
  }

  private updateShowingNotification(): void {
    const notification = this.notification!;
    notification.acknowledged = true;

    if (notification.urgency === Urgency.CRITICAL || notification.source.policy.forceExpanded)
      this.expandBanner(true);

    this.notificationState = State.SHOWING;
    this.bannerBin.remove_all_transitions();
    this.bannerBin.ease({
      opacity: 255,
      translation_y: 0,
      duration: BANNER_SHOW_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUART,
      onComplete: () => {
        this.notificationState = State.SHOWN;
        this.showNotificationCompleted();
        this.updateState();
      },
    });
  }

  private holdBanner(held: boolean): void {
    this.bannerHeld = held;
    if (held)
      this.updateNotificationTimeout(0);
    else if (this.notificationState === State.SHOWN)
      this.showNotificationCompleted();
  }

  private showNotificationCompleted(): void {
    if (this.notification!.urgency !== Urgency.CRITICAL)
      this.updateNotificationTimeout(NOTIFICATION_TIMEOUT);
  }

  private updateNotificationTimeout(timeout: number): void {
    if (this.notificationTimeoutId) {
      GLib.source_remove(this.notificationTimeoutId);
      this.notificationTimeoutId = 0;
    }
    if (timeout <= 0) return;
    this.notificationTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, timeout, () => this.notificationTimeout());
    GLib.Source.set_name_by_id(this.notificationTimeoutId, '[kestrel] this._notificationTimeout');
  }

  private notificationTimeout(): void {
    const [x, y] = global.get_pointer();
    if (y > this.lastSeenMouseY + 10 && !this.notificationHovered) {
      this.updateNotificationTimeout(1000);
    } else if (this.useLongerNotificationLeftTimeout && !this.notificationLeftTimeoutId &&
      (x !== this.lastSeenMouseX || y !== this.lastSeenMouseY)) {
      this.updateNotificationTimeout(1000);
    } else {
      this.notificationTimeoutId = 0;
      this.updateState();
    }
    this.lastSeenMouseX = x;
    this.lastSeenMouseY = y;
  }

  private hideNotification(animate: boolean): void {
    this.notificationFocusGrabber.ungrabFocus();
    this.resetNotificationLeftTimeout();
    this.bannerBin.remove_all_transitions();

    this.notificationState = State.HIDING;
    this.bannerBin.ease({
      opacity: 0,
      translation_y: BANNER_SLIDE_DISTANCE,
      duration: animate ? ANIMATION_TIME : 0,
      mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => {
        this.notificationState = State.HIDDEN;
        this.hideNotificationCompleted();
        this.updateState();
      },
    });
  }

  private hideNotificationCompleted(): void {
    const notification = this.notification!;
    this.notification = null;
    if (!this.notificationRemoved && (notification.isTransient || !notification.source.policy.keepInList))
      notification.destroy(NotificationDestroyedReason.EXPIRED);

    this.pointerInNotification = false;
    this.notificationRemoved = false;
    this.bannerHeld = false;
    global.compositor.enable_unredirect();

    this.banner!.destroy();
    this.banner = null;
    this.hide();
  }

  private expandActiveNotification(): void {
    if (this.banner)
      this.expandBanner(false);
  }

  private expandBanner(autoExpanding: boolean): void {
    this.banner!.expand(!autoExpanding);
    if (!autoExpanding)
      this.notificationFocusGrabber.grabFocus();
  }
}
