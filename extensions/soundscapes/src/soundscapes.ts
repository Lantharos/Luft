import type { Extension, Popup } from '@luft/extension-api';

import { mixer } from './mixer.js';
import { Mixes, type Mix } from './mixes.js';
import { Player } from './player.js';
import { SleepTimer } from './sleep.js';

export type Granted = 'sounds' | 'locked-sounds' | 'media' | 'calls' | 'quick-settings' | 'popups';

const RESUME_DELAY_MS = 2000;

/** Everything the tile, the pop-up mixer and the Settings page show, and what they change. */
export class Soundscapes {
  readonly player: Player;
  readonly mixes: Mixes;
  readonly sleep: SleepTimer;
  private readonly listeners = new Set<() => void>();
  private popup: Popup | null = null;
  private resuming: { dispose(): void } | null = null;
  private waitingFor: 'media' | 'call' | null = null;

  constructor(readonly extension: Extension<Granted>) {
    this.mixes = new Mixes(extension.storage, extension.t, () => this.changed());
    this.player = new Player(extension, () => {
      this.sleep.sync();
      this.changed();
    });
    this.sleep = new SleepTimer(extension, this.player);
    extension.settings.onChanged(key => {
      if (key === 'sleep-timer') this.sleep.restart();
      if (key === 'volume') extension.sounds.volume = extension.settings.get<number>('volume');
      if (key === 'pause-for-media' || key === 'pause-for-calls') this.follow();
      this.changed();
    });
    extension.media.onChanged(() => this.follow());
    extension.calls.onChanged(() => this.follow());
    extension.sounds.volume = extension.settings.get<number>('volume');
    this.follow();
  }

  onChanged(listener: () => void): void {
    this.listeners.add(listener);
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
    if (this.popup?.open) this.popup.update(mixer(this));
  }

  get currentMix(): Mix | null {
    return this.mixes.matching(this.player.levels);
  }

  readonly mixName = (): string => {
    const mix = this.currentMix;
    return mix ? this.mixes.name(mix) : this.extension.t('custom-mix');
  };

  /** Why it's quiet while on, or when the sleep timer stops it. */
  readonly detail = (): string | null => {
    const { t } = this.extension;
    if (this.player.held) return t(this.waitingFor === 'call' ? 'held-call' : 'held');
    const deadline = this.sleep.deadline;
    return deadline ? t('stops-at', { time: new Date(deadline).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }) : null;
  };

  readonly status = (): string => this.detail() ?? this.extension.t(this.player.playing ? 'playing' : 'paused');

  choose(mix: Mix): void {
    this.player.choose(mix.levels);
    this.player.play();
  }

  openMixer(): void {
    if (this.popup?.open) return;
    this.popup = this.extension.popups.open({
      anchor: 'bottom-right',
      kind: 'window',
      title: this.extension.t('soundscapes'),
      width: 340,
      content: mixer(this),
      onClosed: () => (this.popup = null),
    });
  }

  /**
   * Waits during a call, or while another app plays music or a video, and comes back a moment after it ends, so it
   * doesn't jump in between tracks.
   */
  private follow(): void {
    const { settings, media, calls } = this.extension;
    const inCall = settings.get<boolean>('pause-for-calls') && calls.active;
    const othersPlay = settings.get<boolean>('pause-for-media') && media.players.some(player => player.playing);
    const waitingFor = inCall ? 'call' : othersPlay ? 'media' : null;
    const reasonChanged = waitingFor !== this.waitingFor;
    this.waitingFor = waitingFor;
    this.resuming?.dispose();
    this.resuming = null;
    if (this.waitingFor) this.player.wait(true);
    else if (this.player.held) this.resuming = this.extension.timers.timeout(RESUME_DELAY_MS, () => this.player.wait(false));
    else this.player.wait(false);
    if (reasonChanged) this.changed();
  }
}
