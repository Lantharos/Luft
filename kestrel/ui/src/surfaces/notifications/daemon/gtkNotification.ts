import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as Main from '../../../core/main.js';
import { Notification, Sound, type Source } from '../tray/notification.js';
import { Urgency } from '../tray/notificationEnums.js';

export type SerializedNotification = Record<string, GLib.Variant>;

export interface AppSource extends Source {
  activateAction(actionId: string, target: GLib.Variant | undefined): void;
  emitActionInvoked(notificationId: string, actionId: string, target: GLib.Variant | undefined): void;
}

interface Button {
  label: GLib.Variant;
  action: GLib.Variant;
  target?: GLib.Variant;
}

const PRIORITY_URGENCY_MAP: Record<string, Urgency> = {
  low: Urgency.LOW,
  normal: Urgency.NORMAL,
  high: Urgency.HIGH,
  urgent: Urgency.CRITICAL,
};

function soundFromPortal(sound: GLib.Variant | undefined, fds: Gio.UnixFDList | null): Sound | null {
  if (!sound) return null;
  if (sound.is_of_type(new GLib.VariantType('s')))
    return sound.unpack() === 'silent' ? new Sound(null) : null;
  const [kind, value] = sound.deepUnpack() as [string, GLib.Variant];
  return kind === 'file' && fds ? new Sound({ fds, index: value.unpack() as number }) : null;
}

function urgencyOf(priority: GLib.Variant | undefined, urgent: GLib.Variant | undefined): Urgency {
  if (priority)
    return PRIORITY_URGENCY_MAP[priority.unpack() as string] ?? Urgency.NORMAL;
  if (urgent)
    return urgent.unpack() ? Urgency.CRITICAL : Urgency.NORMAL;
  return Urgency.NORMAL;
}

export const GtkNotificationDaemonNotification = GObject.registerClass(
class GtkNotificationDaemonNotification extends Notification {
  private readonly serialized: GLib.Variant;
  private readonly defaultAction: string | undefined;
  private readonly defaultActionTarget: GLib.Variant | undefined;

  constructor(private readonly appSource: AppSource, readonly id: string,
    notification: SerializedNotification, fds: Gio.UnixFDList | null = null) {
    super({ source: appSource });
    this.serialized = GLib.Variant.new('a{sv}', notification);

    const {
      title,
      body,
      icon: gicon,
      urgent,
      priority,
      buttons,
      'default-action': defaultAction,
      'default-action-target': defaultActionTarget,
      timestamp: time,
      sound,
    } = notification;

    this.urgency = urgencyOf(priority, urgent);

    if (buttons) {
      (buttons.deepUnpack() as Button[]).forEach(button => {
        this.addAction(button.label.unpack() as string, () => this.onButtonClicked(button));
      });
    }

    this.defaultAction = defaultAction?.unpack() as string | undefined;
    this.defaultActionTarget = defaultActionTarget;

    this.set({
      title: title.unpack(),
      body: body?.unpack(),
      gicon: gicon ? Gio.icon_deserialize(gicon) : null,
      datetime: time ? GLib.DateTime.new_from_unix_local(time.unpack() as number) : null,
      sound: soundFromPortal(sound, fds),
    });
  }

  private activateAction(actionId: string, target: GLib.Variant | undefined): void {
    if (actionId.startsWith('app.'))
      this.appSource.activateAction(actionId.slice('app.'.length), target);
    else
      this.appSource.emitActionInvoked(this.id, actionId, target);

    Main.closeShellPopups();
  }

  private onButtonClicked({ action, target }: Button): void {
    this.activateAction(action.unpack() as string, target);
  }

  activate(): void {
    if (this.defaultAction)
      this.activateAction(this.defaultAction, this.defaultActionTarget);
    else
      this.appSource.open();

    super.activate();
  }

  serialize(): GLib.Variant {
    return this.serialized;
  }
});
export type GtkNotificationDaemonNotification = InstanceType<typeof GtkNotificationDaemonNotification>;
