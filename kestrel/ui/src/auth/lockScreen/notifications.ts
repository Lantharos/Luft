import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';
import { styleSurface } from '../../appearance/kestrelGlass.js';
import { fixMarkup } from '../../core/runtime/util.js';
import { MprisSource, type MprisPlayer } from '../../surfaces/notifications/tray/mpris.js';
import { MediaMessage } from '../../surfaces/notifications/tray/messageList.js';

const LOCK_SCREEN_PREVIEWS = 3;

type Source = MessageTray.Source;

interface SourceEntry {
  visible: boolean;
  detailed: boolean;
  sourceBox: St.BoxLayout;
  titleLabel: St.Label;
  countLabel: St.Label | null;
  hasCriticalNotification: boolean;
  policyChangedId: number;
}

const oneLine = (text: string): string => text.replace(/\n/g, ' ');

function sourceIcon(source: Source, params: Partial<St.Icon.ConstructorProps> = {}): St.Icon {
  const icon = new St.Icon({
    style_class: 'unlock-dialog-notification-icon',
    fallback_icon_name: 'application-x-executable',
    ...params,
  });
  source.bind_property('icon', icon, 'gicon', GObject.BindingFlags.SYNC_CREATE);
  return icon;
}

function buildSummary(source: Source, box: St.BoxLayout): [St.Label, St.Label] {
  box.add_child(sourceIcon(source));

  const textBox = new St.BoxLayout({
    x_expand: true,
    y_expand: true,
    y_align: Clutter.ActorAlign.CENTER,
  });
  box.add_child(textBox);

  const title = new St.Label({
    style_class: 'unlock-dialog-notification-label',
    x_expand: true,
    x_align: Clutter.ActorAlign.START,
  });
  source.bind_property('title', title, 'text', GObject.BindingFlags.SYNC_CREATE);
  textBox.add_child(title);

  const count = source.unseenCount;
  const countLabel = new St.Label({
    text: `${count}`,
    visible: count > 1,
    style_class: 'unlock-dialog-notification-count-text',
  });
  textBox.add_child(countLabel);

  box.visible = count !== 0;
  return [title, countLabel];
}

function buildDetails(source: Source, box: St.BoxLayout): [St.Label, null] {
  box.add_child(sourceIcon(source, { y_align: Clutter.ActorAlign.START }));

  const textBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  box.add_child(textBox);

  const title = new St.Label({ style_class: 'unlock-dialog-notification-label' });
  source.bind_property_full('title', title, 'text', GObject.BindingFlags.SYNC_CREATE,
    (_binding, sourceVal: string | null) => [true, sourceVal?.replace(/\n/g, ' ') ?? ''], null);
  textBox.add_child(title);

  const unseen = source.notifications
    .filter(notification => !notification.acknowledged)
    .sort((a, b) => b.datetime.compare(a.datetime));
  for (const notification of unseen.slice(0, LOCK_SCREEN_PREVIEWS)) {
    const preview = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'unlock-dialog-notification-preview',
    });
    preview.add_child(new St.Label({
      style_class: 'unlock-dialog-notification-preview-title',
      text: oneLine(notification.title!),
    }));
    if (notification.body) {
      const body = new St.Label({ style_class: 'unlock-dialog-notification-preview-body' });
      body.clutter_text.set_markup(fixMarkup(oneLine(notification.body), notification.useBodyMarkup));
      preview.add_child(body);
    }
    textBox.add_child(preview);
  }

  box.visible = unseen.length > 0;
  return [title, null];
}

function buildSource(source: Source, box: St.BoxLayout, detailed: boolean): [St.Label, St.Label | null] {
  return detailed ? buildDetails(source, box) : buildSummary(source, box);
}

export namespace NotificationsBox {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'wake-up-screen': () => void;
  }
}

export class NotificationsBox extends St.BoxLayout {
  static [GObject.signals] = {
    'wake-up-screen': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, NotificationsBox.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, NotificationsBox.Signals>['emit'];

  private readonly notificationBox = new St.BoxLayout({
    orientation: Clutter.Orientation.VERTICAL,
    style_class: 'unlock-dialog-notifications-container',
  });

  private readonly scrollView = new St.ScrollView({ child: this.notificationBox });
  private readonly players = new Map<MprisPlayer, InstanceType<typeof MediaMessage>>();
  private readonly mediaSource = new MprisSource();
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' });
  private readonly shellSettings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly sources = new Map<Source, SourceEntry>();

  constructor() {
    super({
      orientation: Clutter.Orientation.VERTICAL,
      name: 'unlockDialogNotifications',
    });

    this.add_child(this.scrollView);

    this.mediaSource.connectObject(
      'player-added', (_source: MprisSource, player: MprisPlayer) => this.addPlayer(player),
      'player-removed', (_source: MprisSource, player: MprisPlayer) => this.removePlayer(player),
      this);
    this.mediaSource.players.forEach(player => this.addPlayer(player));

    this.shellSettings.connectObject('changed::lock-screen-content', () => {
      for (const [source, entry] of this.sources) this.detailedChanged(source, entry);
    }, this);

    Main.messageTray.getSources().forEach(source => this.sourceAdded(source, true));
    this.updateVisibility();

    Main.messageTray.connectObject('source-added', (_tray: unknown, source: Source) => this.sourceAdded(source, false), this);

    this.connect('destroy', () => this.onDestroy());
  }

  private onDestroy(): void {
    for (const [source, entry] of this.sources) this.removeSource(source, entry);
    for (const player of this.players.keys()) this.removePlayer(player);
  }

  private updateVisibility(): void {
    this.notificationBox.visible = this.notificationBox.get_children().some(a => a.visible);
    this.visible = this.notificationBox.visible;
  }

  private shouldShowDetails(source: Source): boolean {
    return (this.shellSettings.get_boolean('lock-screen-content') && source.policy.showInLockScreen) ||
      source.policy.detailsInLockScreen ||
      source.narrowestPrivacyScope === MessageTray.PrivacyScope.SYSTEM;
  }

  private updateSourceBoxStyle(source: Source, entry: SourceEntry): void {
    const hasCriticalNotification = source.notifications.some(n => n.urgency === MessageTray.Urgency.CRITICAL);
    if (hasCriticalNotification === entry.hasCriticalNotification) return;

    entry.hasCriticalNotification = hasCriticalNotification;
    if (hasCriticalNotification) entry.sourceBox.add_style_class_name('critical');
    else entry.sourceBox.remove_style_class_name('critical');
  }

  private syncSourceBox(source: Source, entry: SourceEntry): void {
    entry.sourceBox.visible = entry.visible && source.unseenCount > 0;
    this.updateSourceBoxStyle(source, entry);
  }

  private rebuildSource(source: Source, entry: SourceEntry): void {
    entry.sourceBox.destroy_all_children();
    [entry.titleLabel, entry.countLabel] = buildSource(source, entry.sourceBox, entry.detailed);
    this.syncSourceBox(source, entry);
  }

  private wakeUpScreenForSource(source: Source): void {
    if (!this.settings.get_boolean('show-banners')) return;
    if (this.sources.get(source)?.sourceBox.visible) this.emit('wake-up-screen');
  }

  private addPlayer(player: MprisPlayer): void {
    const message = new MediaMessage(player);
    this.players.set(player, message);
    this.notificationBox.insert_child_at_index(message, 0);
    this.updateVisibility();
  }

  private removePlayer(player: MprisPlayer): void {
    this.players.get(player)!.destroy();
    this.players.delete(player);
    this.updateVisibility();
  }

  private sourceAdded(source: Source, initial: boolean): void {
    const sourceBox = new St.BoxLayout({ style_class: 'unlock-dialog-notification-source', x_expand: true });
    styleSurface(sourceBox, 20);

    const detailed = this.shouldShowDetails(source);
    const [titleLabel, countLabel] = buildSource(source, sourceBox, detailed);
    const entry: SourceEntry = {
      visible: source.policy.showInLockScreen,
      detailed,
      sourceBox,
      titleLabel,
      countLabel,
      hasCriticalNotification: false,
      policyChangedId: 0,
    };
    this.syncSourceBox(source, entry);
    this.notificationBox.insert_child_at_index(sourceBox, this.players.size);

    source.connectObject(
      'notify::count', () => this.countChanged(source, entry),
      'notify::title', () => (entry.titleLabel.text = source.title!),
      'destroy', () => {
        this.removeSource(source, entry);
        this.updateVisibility();
      }, this);
    entry.policyChangedId = source.policy.connect('notify', (_policy, pspec) => {
      if (pspec.name === 'show-in-lock-screen') this.visibleChanged(source, entry);
      else this.detailedChanged(source, entry);
    });

    this.sources.set(source, entry);

    if (initial) return;

    if (this.scrollView.height >= this.notificationBox.height) this.scrollView.vscrollbar_policy = St.PolicyType.NEVER;

    const [, natHeight] = sourceBox.get_preferred_height(-1);
    sourceBox.height = 0;
    sourceBox.ease({
      height: natHeight,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration: 250,
      onComplete: () => {
        this.scrollView.vscrollbar_policy = St.PolicyType.AUTOMATIC;
        sourceBox.set_height(-1);
      },
    });

    this.updateVisibility();
    this.wakeUpScreenForSource(source);
  }

  private countChanged(source: Source, entry: SourceEntry): void {
    const newDetailed = this.shouldShowDetails(source);
    const oldDetailed = entry.detailed;

    entry.detailed = newDetailed;

    if (entry.detailed || oldDetailed !== newDetailed) {
      this.rebuildSource(source, entry);
    } else {
      const count = source.unseenCount;
      entry.countLabel!.text = `${count}`;
      entry.countLabel!.visible = count > 1;
    }

    entry.sourceBox.visible = entry.visible && source.unseenCount > 0;

    this.updateVisibility();
    this.wakeUpScreenForSource(source);
  }

  private visibleChanged(source: Source, entry: SourceEntry): void {
    if (entry.visible === source.policy.showInLockScreen) return;

    entry.visible = source.policy.showInLockScreen;
    entry.sourceBox.visible = entry.visible && source.unseenCount > 0;

    this.updateVisibility();
    this.wakeUpScreenForSource(source);
  }

  private detailedChanged(source: Source, entry: SourceEntry): void {
    const newDetailed = this.shouldShowDetails(source);
    if (entry.detailed === newDetailed) return;

    entry.detailed = newDetailed;
    this.rebuildSource(source, entry);
  }

  private removeSource(source: Source, entry: SourceEntry): void {
    entry.sourceBox.destroy();
    source.policy.disconnect(entry.policyChangedId);
    this.sources.delete(source);
  }
}
