import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { t } from '../../../../shared/i18n/index.js';
import * as MessageTray from '../../../../surfaces/notifications/tray/messageTray.js';
import type { ExtensionHost } from '../../../host.js';
import { noticeEffectOff } from '../../../runtime/notices.js';
import type { AppLines } from '../types.js';
import { EffectClock } from './clock.js';
import { FrameWatch } from './frameWatch.js';
import { WindowTracker } from './windows/tracker.js';

const OFF_KEY = 'screen-effects-off';
const OFF_SHORTCUT = 'screen-effects-off';
const LINES_KEY = 'app-lines';
const STARTING = GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'effects-starting']);

/** Something an extension draws with a shader, which Kestrel can take off the screen at any moment. */
export interface StagedEffect {
  /** Takes the effect on or off the screen, as what it depends on changed. */
  sync(): void;
  /** How much of the screen it costs, so a frame that's too slow takes the costliest effect off first. */
  readonly cost: number;
  /** Whether it's on the screen right now. */
  readonly attached: boolean;
  /** Takes it off for good, and tells the extension why. */
  fail(problem: 'shader' | 'slow', detail: string): void;
}

/**
 * Every effect of every extension, and what decides whether any of them show: the shortcut that turns them all off,
 * the lock screen, the frame watch. Nothing here runs or is connected until an extension adds an effect.
 */
export class EffectsStage {
  readonly windows = new WindowTracker(this);
  readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly effects = new Set<StagedEffect>();
  private readonly watch = new FrameWatch(() => this.tooSlow(), () => this.survivedFrame());
  private clockInstance: EffectClock | null = null;
  private disconnectors: (() => void)[] = [];
  private readonly offListeners = new Set<() => void>();
  private offNotice: MessageTray.Notification | null = null;
  private appLines: AppLines = 'none';
  private watching = false;

  constructor(readonly host: ExtensionHost) {
    host.keybindings.add(OFF_SHORTCUT, new Gio.Settings({ schema_id: 'com.lantharos.kestrel.keybindings' }), Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
      Shell.ActionMode.ALL, () => this.turnOff());
    if (GLib.file_test(STARTING, GLib.FileTest.EXISTS)) this.wentDownStarting();
    this.writeAppLines();
  }

  /** Effects were going on when the desktop or the computer last went down, so a shader may have hung the GPU. */
  private wentDownStarting(): void {
    this.survivedFrame();
    this.settings.set_boolean(OFF_KEY, true);
    this.sayOff();
  }

  private survivedFrame(): void {
    GLib.unlink(STARTING);
  }

  setAppLines(style: AppLines): void {
    this.appLines = style;
    this.writeAppLines();
  }

  private writeAppLines(): void {
    const style = this.off ? 'none' : this.appLines;
    if (this.settings.get_string(LINES_KEY) !== style) this.settings.set_string(LINES_KEY, style);
  }

  /** Whether the shortcut turned effects off. It lasts across restarts, so an unreadable filter doesn't come back by itself. */
  get off(): boolean {
    return this.settings.get_boolean(OFF_KEY);
  }

  get held(): boolean {
    return this.off || this.host.desktop.locked || !this.host.desktop.active;
  }

  get clock(): EffectClock {
    return this.clockInstance ??= new EffectClock();
  }

  add(effect: StagedEffect): () => void {
    if (!this.effects.size) this.start();
    this.effects.add(effect);
    effect.sync();
    return () => {
      this.effects.delete(effect);
      if (!this.effects.size) this.stop();
      else this.attachedChanged();
    };
  }

  private start(): void {
    const sync = () => this.sync();
    const offSignal = this.settings.connect(`changed::${OFF_KEY}`, sync);
    const fullscreenSignal = global.display.connect('in-fullscreen-changed', sync);
    const recovery = global.stage.context.get_backend().get_graphics_recovery_context();
    const resetSignal = recovery.connect('reset-detected', () => this.turnOff());
    this.disconnectors = [
      () => recovery.disconnect(resetSignal),
      this.host.desktop.watch(sync),
      this.host.watchMonitors(sync),
      () => this.settings.disconnect(offSignal),
      () => global.display.disconnect(fullscreenSignal),
    ];
  }

  private stop(): void {
    for (const disconnect of this.disconnectors.splice(0)) disconnect();
    this.attachedChanged();
    this.clockInstance?.destroy();
    this.clockInstance = null;
  }

  sync(): void {
    for (const effect of this.effects) effect.sync();
    this.windows.sync();
    this.attachedChanged();
  }

  attachedChanged(): void {
    const attached = [...this.effects].some(effect => effect.attached);
    if (attached && !this.watching) this.noteStarting();
    if (!attached && this.watching) this.survivedFrame();
    this.watching = attached;
    if (attached) this.watch.start();
    else this.watch.stop();
  }

  private noteStarting(): void {
    GLib.mkdir_with_parents(GLib.path_get_dirname(STARTING), 0o700);
    GLib.file_set_contents(STARTING, '');
  }

  private tooSlow(): void {
    const costliest = [...this.effects].filter(effect => effect.attached).sort((a, b) => b.cost - a.cost)[0];
    costliest?.fail('slow', '');
  }

  turnOff(): void {
    if (this.off) return;
    this.settings.set_boolean(OFF_KEY, true);
    this.sync();
    this.writeAppLines();
    if (this.effects.size) this.sayOff();
    this.offChanged();
  }

  private sayOff(): void {
    const source = MessageTray.getSystemSource();
    const notification = this.offNotice = new MessageTray.Notification({
      source,
      title: t('screen-effects-off-title'),
      body: t('screen-effects-off-body'),
      gicon: new Gio.ThemedIcon({ name: 'display-brightness-symbolic' }),
      privacyScope: MessageTray.PrivacyScope.SYSTEM,
    });
    notification.addAction(t('screen-effects-off-action'), () => this.turnBackOn());
    notification.connect('destroy', () => {
      if (this.offNotice === notification) this.offNotice = null;
    });
    source.addNotification(notification);
  }

  turnBackOn(): void {
    if (!this.off) return;
    this.settings.set_boolean(OFF_KEY, false);
    this.offNotice?.destroy();
    this.sync();
    this.writeAppLines();
    this.offChanged();
  }

  private offChanged(): void {
    for (const listener of [...this.offListeners]) listener();
  }

  watchOff(changed: () => void): () => void {
    this.offListeners.add(changed);
    return () => this.offListeners.delete(changed);
  }

  notice(extension: string, label: string, problem: 'shader' | 'slow', openSettings: () => void): void {
    noticeEffectOff(extension, label, problem, openSettings);
  }
}
