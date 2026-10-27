import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import * as Main from '../../main.js';
import type { MprisPlayer } from '../mpris.js';
import { policyForApp, type NotificationPolicy } from '../notificationPolicy.js';
import { Message } from './message.js';

export const MediaMessage = GObject.registerClass(
class MediaMessage extends Message {
  private readonly prevButton: St.Button;
  private readonly playPauseButton: St.Button;
  private readonly nextButton: St.Button;
  private policy: NotificationPolicy | null = null;

  constructor(private readonly player: MprisPlayer) {
    super(player.source);

    this.add_style_class_name('media-message');

    this.prevButton = this.addMediaControl('media-skip-backward-symbolic', () => this.player.previous());
    this.playPauseButton = this.addMediaControl('', () => this.player.playPause());
    this.nextButton = this.addMediaControl('media-skip-forward-symbolic', () => this.player.next());

    Main.sessionMode.connectObject('updated', () => this.applyPolicy(), this);
    this.player.connectObject('changed', () => this.update(), this);
    this.update();
  }

  vfunc_clicked(): void {
    if (Main.sessionMode.isLocked) return;

    this.player.raise();
    Main.closeShellPopups();
  }

  private applyPolicy(): void {
    this.visible =
      this.policy!.enable &&
      (!Main.sessionMode.isLocked || this.policy!.showInLockScreen);
  }

  private update(): void {
    const icon = this.player.trackCoverUrl
      ? new Gio.FileIcon({ file: Gio.File.new_for_uri(this.player.trackCoverUrl) })
      : new Gio.ThemedIcon({ name: 'audio-x-generic-symbolic' });

    this.title = this.player.trackTitle;
    this.body = this.player.trackArtists.join(', ');
    this.icon = icon;

    const isPlaying = this.player.status === 'Playing';
    (this.playPauseButton.child as St.Icon).icon_name = isPlaying
      ? 'media-playback-pause-symbolic'
      : 'media-playback-start-symbolic';

    this.prevButton.reactive = this.player.canGoPrevious;
    this.nextButton.reactive = this.player.canGoNext;

    const appId = this.player.app?.id.replace(/\.desktop$/, '') ?? 'generic';
    if (this.policy?.id === appId) return;

    this.policy?.disconnectObject(this);
    const policy = this.policy = policyForApp(this.player.app);
    policy.store();
    policy.connectObject(
      'notify::enable', () => this.applyPolicy(),
      'notify::show-in-lock-screen', () => this.applyPolicy(),
      this);
    this.applyPolicy();
  }
});
export type MediaMessage = InstanceType<typeof MediaMessage>;
