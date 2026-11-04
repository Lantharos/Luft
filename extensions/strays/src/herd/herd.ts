import type { Disposable, Extension, Sprites, SurfaceDisplay } from '@luft/extension-api';

import type { Pack } from '../packs/pack.js';
import { World } from '../world/world.js';
import { MOODS, STEP_S, Stray } from './stray.js';

type Granted = 'wallpaper' | 'calls';

const BODY_WIDTH = 0.72;
const HEIGHTS: Record<string, number> = { small: 24, medium: 48, large: 72 };
const NOTICE_AFTER_MS = 700;

const worldOn = (display: SurfaceDisplay, size: number) => new World(display, { width: size * BODY_WIDTH, height: size });

/** The strays on the desktop, stepping only while one of them does something and otherwise waking once for the next. */
export class Herd {
  private strays: Stray[] = [];
  private stepping: Disposable | null = null;
  private alarm: Disposable | null = null;
  private drowsy = false;
  private noticing: Disposable | null = null;

  constructor(private readonly extension: Extension<Granted>, private readonly sprites: Sprites) {
    const changed = () => this.conditionsChanged();
    const { desktop, power, appearance, calls, wallpaper } = extension;
    for (const source of [desktop, power, appearance, calls]) source.onChanged(changed);
    wallpaper.onSurfacesChanged(() => this.surfacesChanged());
  }

  get count(): number {
    return this.strays.length;
  }

  private displayOf(index: number): SurfaceDisplay {
    const { surfaces } = this.extension.wallpaper;
    return surfaces.find(display => display.index === index) ?? surfaces[0];
  }

  private worldFor(stray: Stray, index: number): World {
    const display = this.displayOf(index);
    return worldOn(display, stray.sprite.sizeOn(display.index));
  }

  private shouldDoze(): boolean {
    const { desktop, power, appearance, calls, wallpaper } = this.extension;
    return !desktop.wallpaperVisible || power.saving || appearance.reducedMotion || calls.active || wallpaper.surfaces.some(display => display.fullscreen);
  }

  /** Puts `roster` on the desktop, `count` of them in turn, at one of the sizes people can choose. */
  populate(roster: readonly Pack[], count: number, size: string): void {
    this.clear();
    if (!roster.length) return;
    const displays = this.extension.wallpaper.surfaces;
    this.drowsy = this.shouldDoze();
    for (let slot = 0; slot < count; slot++) {
      const pack = roster[slot % roster.length];
      const sprite = this.sprites.add({
        sheet: pack.frameSheet,
        height: HEIGHTS[size],
        onClick: () => this.poke(stray),
        onPicked: () => this.pick(stray),
        onCarried: ({ display, x, y }) => stray.carried(this.worldFor(stray, display), x, y),
        onDropped: ({ display, x, y }) => this.drop(stray, display, x, y),
      });
      const display = displays[slot % displays.length];
      const stray: Stray = new Stray(pack, sprite, worldOn(display, sprite.sizeOn(display.index)), mood => this.extension.t(MOODS[mood], { name: pack.name }));
      this.strays.push(stray);
      if (this.drowsy) stray.doze();
    }
    this.schedule();
  }

  /** Takes everyone away. */
  clear(): void {
    this.stepping?.dispose();
    this.alarm?.dispose();
    this.noticing?.dispose();
    this.stepping = this.alarm = this.noticing = null;
    for (const stray of this.strays) stray.sprite.dispose();
    this.strays = [];
  }

  private poke(stray: Stray): void {
    if (this.drowsy) return;
    stray.poke();
    this.schedule();
  }

  private pick(stray: Stray): void {
    stray.picked();
    this.schedule();
  }

  private drop(stray: Stray, display: number, x: number, y: number): void {
    stray.dropped(this.worldFor(stray, display), x, y, this.drowsy);
    this.schedule();
  }

  private conditionsChanged(): void {
    if (!this.strays.length) return;
    const drowsy = this.shouldDoze();
    if (drowsy !== this.drowsy) {
      this.drowsy = drowsy;
      for (const stray of this.strays) {
        if (drowsy) stray.doze();
        else stray.stir();
      }
    }
    this.schedule();
  }

  private surfacesChanged(): void {
    if (!this.strays.length) return;
    this.conditionsChanged();
    const worlds = new Map<string, World>();
    for (const stray of this.strays) {
      const display = this.displayOf(stray.display);
      const size = stray.sprite.sizeOn(display.index);
      const key = `${display.index}:${size}`;
      if (!worlds.has(key)) worlds.set(key, worldOn(display, size));
      stray.surfacesChanged(worlds.get(key)!, this.drowsy);
    }
    this.schedule();
    this.noticeOnceStill();
  }

  /** Lets strays look around once surfaces stop moving, not on every frame of a window being dragged. */
  private noticeOnceStill(): void {
    this.noticing?.dispose();
    this.noticing = this.drowsy ? null : this.extension.timers.timeout(NOTICE_AFTER_MS, () => {
      this.noticing = null;
      for (const stray of this.strays) stray.notice();
      this.schedule();
    });
  }

  /** Steps while someone moves, or sets one alarm for whoever wakes first, so nothing runs between. */
  private schedule(): void {
    const moving = this.strays.some(stray => stray.moving);
    if (moving && !this.stepping) this.stepping = this.extension.timers.interval(STEP_S * 1000, () => this.step());
    if (!moving) {
      this.stepping?.dispose();
      this.stepping = null;
    }
    this.alarm?.dispose();
    this.alarm = null;
    if (moving || this.drowsy) return;
    const next = Math.min(...this.strays.map(stray => stray.wakeAt));
    if (Number.isFinite(next)) this.alarm = this.extension.timers.timeout(Math.max(0, next - Date.now()), () => this.wake());
  }

  private wake(): void {
    const now = Date.now();
    for (const stray of this.strays) if (stray.wakeAt <= now) stray.decide();
    this.schedule();
  }

  private step(): void {
    for (const stray of this.strays) if (stray.moving) stray.step();
    if (!this.strays.some(stray => stray.moving)) this.schedule();
  }
}
