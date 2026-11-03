import type { Disposable, Extension, Sound } from '@luft/extension-api';

const LOOPS: readonly [name: string, intensity: number][] = [['drizzle', 0.25], ['rain', 0.6], ['downpour', 1]];
const THUNDERS = 5;
const STORM_FROM = 0.75;
const BUILD_UP_MS = 1400;
const WIND_DOWN_MS = 1000;
const GLIDE_MS = 1500;

const between = (low: number, high: number) => low + (high - low) * Math.random();

/** How loud each loop plays for how hard it rains: one loop, or two crossfaded with equal power. */
function gains(intensity: number): number[] {
  const levels = LOOPS.map(([, level]) => level);
  if (intensity <= levels[0]) return levels.map((_, index) => index === 0 ? intensity / levels[0] : 0);
  const upper = levels.findIndex(level => intensity <= level);
  if (upper === -1) return levels.map((_, index) => index === levels.length - 1 ? 1 : 0);
  const t = (intensity - levels[upper - 1]) / (levels[upper] - levels[upper - 1]);
  return levels.map((_, index) => index === upper - 1 ? Math.cos(t * Math.PI / 2) : index === upper ? Math.sin(t * Math.PI / 2) : 0);
}

/** Recorded rain while it rains and its sound is on, from drizzle to downpour, with thunder now and then in storms. */
export class RainSound {
  private readonly loops = new Map<string, Sound>();
  private thunder: Disposable | null = null;
  private lastThunder = Math.floor(Math.random() * THUNDERS);

  constructor(private readonly seasons: Extension<'sounds'>, private readonly raining: () => number | null) {}

  sync(): void {
    const { settings, sounds } = this.seasons;
    const intensity = this.raining();
    const volume = settings.get<number>('volume');
    if (intensity === null || !settings.get<boolean>('sound') || volume <= 0) {
      this.silence();
      return;
    }
    sounds.volume = volume;
    gains(intensity).forEach((gain, index) => this.play(LOOPS[index][0], gain));
    if (this.storm > 0) this.thunder ??= this.seasons.timers.timeout(between(6000, 15000), () => this.rumble());
    else this.stopThunder();
  }

  private play(name: string, gain: number): void {
    const playing = this.loops.get(name);
    if (gain <= 0) {
      playing?.stop(WIND_DOWN_MS);
      this.loops.delete(name);
      return;
    }
    if (playing) {
      playing.setVolume(gain, GLIDE_MS);
      return;
    }
    this.loops.set(name, this.seasons.sounds.play(`sounds/${name}.oga`, { loop: true, volume: gain, fadeIn: BUILD_UP_MS }));
  }

  private get storm(): number {
    const intensity = this.raining() ?? 0;
    return Math.min(Math.max((intensity - STORM_FROM) / (1 - STORM_FROM), 0), 1);
  }

  private rumble(): void {
    const storm = this.storm;
    this.lastThunder = (this.lastThunder + 1 + Math.floor(Math.random() * (THUNDERS - 1))) % THUNDERS;
    this.seasons.sounds.play(`sounds/thunder-${this.lastThunder + 1}.oga`, { volume: between(0.55, 1) * (0.4 + 0.6 * storm) });
    this.thunder = this.seasons.timers.timeout(between(20000, 60000) / Math.max(storm, 0.3), () => this.rumble());
  }

  private stopThunder(): void {
    this.thunder?.dispose();
    this.thunder = null;
  }

  private silence(): void {
    this.stopThunder();
    for (const loop of this.loops.values()) loop.stop(WIND_DOWN_MS);
    this.loops.clear();
  }
}
