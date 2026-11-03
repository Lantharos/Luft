import Shell from 'gi://Shell';

import type { ApiContext } from '../context.js';
import type { AudioLevels, AudioListener, AudioReading } from '../types.js';

const MAX_BANDS = 64;

/** Listens to what plays while any extension holds a listener and something plays, and only then. */
class Listening {
  private readonly mixer = Shell.Mixer.get_default();
  private readonly monitor = Shell.AudioMonitor.get_default();
  private readonly playingListeners = new Set<() => void>();
  private listeners = 0;
  private playingSignal = 0;

  get playing(): boolean {
    return this.mixer.playing;
  }

  watchPlaying(changed: () => void): () => void {
    this.playingListeners.add(changed);
    this.follow();
    return () => {
      this.playingListeners.delete(changed);
      this.follow();
    };
  }

  hold(): () => void {
    this.listeners++;
    this.follow();
    return () => {
      this.listeners--;
      this.follow();
    };
  }

  private follow(): void {
    const watching = this.listeners > 0 || this.playingListeners.size > 0;
    if (watching && !this.playingSignal) this.playingSignal = this.mixer.connect('notify::playing', () => this.changed());
    else if (!watching && this.playingSignal) {
      this.mixer.disconnect(this.playingSignal);
      this.playingSignal = 0;
    }
    this.monitor.set_listening(this.listeners > 0 && this.mixer.playing);
  }

  private changed(): void {
    this.monitor.set_listening(this.listeners > 0 && this.mixer.playing);
    for (const listener of [...this.playingListeners]) listener();
  }

  read(bands: number): AudioReading {
    if (!this.monitor.get_listening()) return { level: 0, bands: new Array<number>(bands).fill(0) };
    const [values, level] = this.monitor.read(bands);
    return { level, bands: values };
  }
}

let listening: Listening | null = null;

export function audioLevelsApi({ scope }: ApiContext): AudioLevels {
  const shared = listening ??= new Listening();
  return {
    get playing() {
      return shared.playing;
    },
    onPlayingChanged: changed => scope.disposable(shared.watchPlaying(scope.guard(changed))),
    listen: (bands: number): AudioListener => {
      const count = Math.round(bands);
      if (!(count >= 1 && count <= MAX_BANDS)) throw new Error(`listen takes 1 to ${MAX_BANDS} bands`);
      const handle = scope.disposable(shared.hold());
      return {
        read: () => shared.read(count),
        dispose: () => handle.dispose(),
      };
    },
  };
}
