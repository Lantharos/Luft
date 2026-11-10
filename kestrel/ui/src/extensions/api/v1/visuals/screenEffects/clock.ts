import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';

import { PlaybackConditions } from '../../../../../desktop/wallpaper/conditions.js';
import { reducedMotion } from '../../../../../shared/motion/motion.js';

const RESTS_AFTER_IDLE_MS = 30000;
const TIME_WRAP_S = 3600;

export const effectTime = () => (GLib.get_monotonic_time() / GLib.USEC_PER_SEC) % TIME_WRAP_S;

type Tick = (time: number) => void;

interface Rate {
  ticks: Set<Tick>;
  timer: number;
}

export class EffectClock {
  private readonly rates = new Map<number, Rate>();
  private readonly shell = St.Settings.get();
  private readonly conditions: PlaybackConditions;
  private readonly signals: number[];
  private readonly idle: Meta.IdleMonitor = global.backend.get_core_idle_monitor();
  private readonly idleWatch: number;
  private activeWatch = 0;
  private resting = false;

  constructor() {
    this.conditions = new PlaybackConditions(() => this.sync(), null);
    this.signals = [this.shell.connect('notify::enable-animations', () => this.sync()), this.shell.connect('notify::reduced-motion', () => this.sync())];
    this.idleWatch = this.idle.add_idle_watch(RESTS_AFTER_IDLE_MS, () => {
      this.resting = true;
      this.sync();
      this.activeWatch = this.idle.add_user_active_watch(() => {
        this.activeWatch = 0;
        this.resting = false;
        this.sync();
      });
    });
  }

  private get running(): boolean {
    return !this.resting && this.conditions.allowed && this.shell.enable_animations && !reducedMotion();
  }

  add(framesPerSecond: number, tick: Tick): () => void {
    let rate = this.rates.get(framesPerSecond);
    if (!rate) this.rates.set(framesPerSecond, rate = { ticks: new Set(), timer: 0 });
    rate.ticks.add(tick);
    this.syncRate(framesPerSecond, rate);
    return () => {
      rate.ticks.delete(tick);
      this.syncRate(framesPerSecond, rate);
    };
  }

  private sync(): void {
    for (const [framesPerSecond, rate] of this.rates) this.syncRate(framesPerSecond, rate);
  }

  private syncRate(framesPerSecond: number, rate: Rate): void {
    const wanted = this.running && rate.ticks.size > 0;
    if (wanted && !rate.timer) {
      rate.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, Math.round(1000 / framesPerSecond), () => {
        const time = effectTime();
        for (const tick of [...rate.ticks]) tick(time);
        return GLib.SOURCE_CONTINUE;
      });
    } else if (!wanted && rate.timer) {
      GLib.source_remove(rate.timer);
      rate.timer = 0;
    }
  }

  destroy(): void {
    for (const rate of this.rates.values()) if (rate.timer) GLib.source_remove(rate.timer);
    for (const id of this.signals) this.shell.disconnect(id);
    this.idle.remove_watch(this.idleWatch);
    if (this.activeWatch) this.idle.remove_watch(this.activeWatch);
    this.conditions.destroy();
  }
}
