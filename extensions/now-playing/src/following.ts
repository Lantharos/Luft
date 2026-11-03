import type { Extension, MediaPlayer } from '@luft/extension-api';

type Granted = 'taskbar' | 'media' | 'popups';

const IGNORED = 'ignored-players';
const SEEN = 'seen-players';
const TICK_MS = 1000;

/** Which player it follows, and where that player's track is, counted along between asks so it moves smoothly. */
export class Following {
  private chosen: string | null = null;
  private known = { id: '', position: 0, at: 0 };
  private ticking: { dispose(): void } | null = null;
  private watchers = 0;

  constructor(private readonly extension: Extension<Granted>, private readonly changed: () => void) {}

  get ignored(): string[] {
    return this.extension.storage.get<string[]>(IGNORED) ?? [];
  }

  get seen(): string[] {
    return this.extension.storage.get<string[]>(SEEN) ?? [];
  }

  setIgnored(appName: string, ignored: boolean): void {
    const rest = this.ignored.filter(name => name !== appName);
    this.extension.storage.set(IGNORED, ignored ? [...rest, appName] : rest);
    this.extension.settingsPage.refresh();
    this.changed();
  }

  /** The players people want followed, remembering every one that showed up for Settings. */
  get players(): readonly MediaPlayer[] {
    const players = this.extension.media.players;
    const seen = this.seen;
    const fresh = players.map(player => player.appName).filter(name => name && !seen.includes(name));
    if (fresh.length) {
      this.extension.storage.set(SEEN, [...seen, ...new Set(fresh)]);
      this.extension.settingsPage.refresh();
    }
    const ignored = this.ignored;
    return players.filter(player => !ignored.includes(player.appName));
  }

  get player(): MediaPlayer | null {
    const players = this.players;
    const chosen = players.find(player => player.id === this.chosen);
    const playing = players.find(player => player.playing);
    return (chosen?.playing ? chosen : playing ?? chosen) ?? players.at(-1) ?? null;
  }

  choose(id: string): void {
    this.chosen = id;
    this.changed();
  }

  /** Seconds into the track, without asking the player every frame. */
  position(player: MediaPlayer): number {
    if (this.known.id !== player.id) return 0;
    const moved = player.playing ? (Date.now() - this.known.at) / 1000 : 0;
    return Math.min(player.length || Infinity, this.known.position + moved);
  }

  /** Asks the player where it is now, after a jump or a new track. */
  sync(): void {
    const player = this.player;
    if (!player) return;
    void player.position().then(position => {
      this.known = { id: player.id, position, at: Date.now() };
      this.changed();
    }, () => {});
  }

  /** Counts the position along while something shows it, and stops when nothing does. */
  watch(): () => void {
    if (!this.watchers++) {
      this.sync();
      this.ticking = this.extension.timers.interval(TICK_MS, () => this.changed());
    }
    return () => {
      if (--this.watchers) return;
      this.ticking?.dispose();
      this.ticking = null;
    };
  }
}
