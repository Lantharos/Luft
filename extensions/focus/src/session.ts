import type { Disposable, Extension, HeldNotifications, NotificationHold } from '@luft/extension-api';

export type Granted = 'taskbar' | 'popups' | 'notifications' | 'do-not-disturb' | 'shortcuts';

export const SOUNDSCAPES = 'com.lantharos.Soundscapes';
const STORED = 'session';
const MINUTE_MS = 60_000;

/** A session as it's kept across restarts: when it ends while it runs, or how much was left when it was paused. */
type Saved = {
  minutes: number;
  endsAt: number | null;
  left: number | null;
  soundscapes: boolean;
};

export interface Ended {
  minutes: number;
  held: readonly HeldNotifications[];
}

/**
 * One work session at a time: it counts down, holds notifications back and asks Soundscapes to play while it runs,
 * and hands what came in to `ended` when it's over.
 */
export class FocusSession {
  private stored: Saved | null;
  private hold: NotificationHold | null = null;
  private ending: Disposable | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly extension: Extension<Granted>, private readonly ended: (session: Ended) => void) {
    this.stored = extension.storage.get<Saved>(STORED) ?? null;
    if (this.stored?.endsAt && this.stored.endsAt <= Date.now()) this.finish();
    else if (this.stored) this.follow();
  }

  get active(): boolean {
    return !!this.stored;
  }

  get paused(): boolean {
    return this.stored?.left != null;
  }

  get minutes(): number {
    return this.stored?.minutes ?? Number(this.extension.settings.get<string>('length'));
  }

  get endsAt(): number | null {
    return this.stored?.endsAt ?? null;
  }

  /** Milliseconds left, the whole length before it starts. */
  get left(): number {
    if (!this.stored) return this.minutes * MINUTE_MS;
    return this.stored.left ?? Math.max(0, this.stored.endsAt! - Date.now());
  }

  /** How far along it is, 0 to 1. */
  get progress(): number {
    return 1 - this.left / (this.minutes * MINUTE_MS);
  }

  get waiting(): number {
    return this.hold?.held.reduce((sum, app) => sum + app.count, 0) ?? 0;
  }

  onChanged(listener: () => void): void {
    this.listeners.add(listener);
  }

  start(minutes = this.minutes): void {
    if (this.stored) return;
    const soundscapes = this.extension.settings.get<boolean>('soundscapes') && this.extension.peers.handles(SOUNDSCAPES, 'play');
    this.store({ minutes, endsAt: Date.now() + minutes * MINUTE_MS, left: null, soundscapes: false });
    if (soundscapes) void this.playSoundscapes();
    this.follow();
  }

  pause(): void {
    if (!this.stored || this.paused) return;
    this.store({ ...this.stored, endsAt: null, left: this.left });
    this.follow();
  }

  resume(): void {
    if (!this.stored?.left) return;
    this.store({ ...this.stored, endsAt: Date.now() + this.stored.left, left: null });
    this.follow();
  }

  /** Ends it now, early or on time, and sums it up. */
  finish(): void {
    const stored = this.stored;
    if (!stored) return;
    const minutes = Math.round((stored.minutes * MINUTE_MS - this.left) / MINUTE_MS);
    const held = this.hold?.release() ?? [];
    this.hold = null;
    this.ending?.dispose();
    this.ending = null;
    if (stored.soundscapes && this.extension.peers.handles(SOUNDSCAPES, 'pause')) void this.extension.peers.request(SOUNDSCAPES, 'pause');
    this.store(null);
    this.changed();
    this.ended({ minutes, held });
  }

  private async playSoundscapes(): Promise<void> {
    const answer = await this.extension.peers.request(SOUNDSCAPES, 'play') as { wasPlaying?: boolean } | undefined;
    if (this.stored && !answer?.wasPlaying) this.store({ ...this.stored, soundscapes: true });
  }

  /** Holds notifications back while there's a session, paused or not, and waits for its end while it runs. */
  private follow(): void {
    this.ending?.dispose();
    this.ending = null;
    const running = !!this.stored && !this.paused;
    if (running) this.ending = this.extension.timers.timeout(this.left, () => this.finish());
    const holding = !!this.stored && this.extension.settings.get<boolean>('hold-notifications');
    if (holding && !this.hold) {
      this.hold = this.extension.doNotDisturb.hold();
      this.hold.onHeld(() => this.changed());
    }
    this.changed();
  }

  private store(stored: Saved | null): void {
    this.stored = stored;
    if (stored) this.extension.storage.set(STORED, { ...stored });
    else this.extension.storage.delete(STORED);
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}
