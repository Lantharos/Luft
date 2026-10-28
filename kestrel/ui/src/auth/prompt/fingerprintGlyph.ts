import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { reducedMotion } from '../../shared/motion/motion.js';
import type { FingerprintState } from './fingerprintState.js';
import { decelerate, shake } from '../../shared/motion/shake.js';
import { setColor } from './statusRing.js';

type Point = [number, number];

const VIEW: readonly [number, number, number] = [3, 1.5, 42];
const CENTER: Point = [24, 26];
const SQUASH = 1.15;
const ARC_STEPS = 40;
const STROKE = 2.2;
const CHECK: readonly Point[] = [[15, 24.5], [21.5, 31], [33.5, 18.5]];
const FOCUS: Point = [24, 24];
const BREATH_PERIOD = 3400;
const BREATH_STAGGER = 140;
const FILL_TIME = 300;
const FILL_STAGGER = 90;
const DRAIN_TIME = 240;
const DRAIN_STAGGER = 50;
const COLLAPSE_TIME = 220;
const COLLAPSE_STAGGER = 34;
const CHECK_DELAY = 230;
const CHECK_TIME = 260;
const TINT_TIME = 160;
const TINT_HOLD = 700;
const RETRY_HOLD = 520;
const COLLAPSED = 0.12;

function arc(rx: number, from: Point | null, to: Point | null): Point[] {
  const angle = ([x, y]: Point) => Math.atan2((y - CENTER[1]) / SQUASH, x - CENTER[0]);
  const start = from ? angle(from) : Math.PI;
  let end = to ? angle(to) : 2 * Math.PI;
  while (end <= start) end += 2 * Math.PI;
  return Array.from({ length: ARC_STEPS + 1 }, (_, index) => {
    const theta = start + (end - start) * index / ARC_STEPS;
    return [CENTER[0] + rx * Math.cos(theta), CENTER[1] + rx * SQUASH * Math.sin(theta)];
  });
}

const RIDGES: readonly (readonly Point[][])[] = [
  [[[21, 32.5], ...arc(3, null, null), [27, 30]]],
  [[[17, 38.5], ...arc(7, null, null), [31, 35]]],
  [[[13, 34], ...arc(11, null, [17.69, 15.64])], [...arc(11, [20.24, 14.11], null), [35, 41]]],
  [[[9, 31], ...arc(15, null, null), [39, 37.5]]],
  [arc(19, [6.78, 16.77], [41.22, 16.77])],
];

interface Path {
  ridge: number;
  points: Point[];
  lengths: number[];
}

const PATHS: readonly Path[] = RIDGES.flatMap((paths, ridge) => paths.map(points => {
  const lengths = [0];
  for (let index = 1; index < points.length; index++)
    lengths.push(lengths[index - 1] + Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]));
  return { ridge, points, lengths: lengths.map(length => length / lengths[lengths.length - 1]) };
}));

function trace(cr: Cairo.Context, { points, lengths }: Path, from: number, to: number): void {
  const at = (position: number): Point => {
    const index = Math.max(1, lengths.findIndex(length => length >= position));
    const span = lengths[index] - lengths[index - 1] || 1;
    const t = (position - lengths[index - 1]) / span;
    return [points[index - 1][0] + (points[index][0] - points[index - 1][0]) * t, points[index - 1][1] + (points[index][1] - points[index - 1][1]) * t];
  };
  cr.moveTo(...at(from));
  points.forEach((point, index) => {
    if (lengths[index] > from && lengths[index] < to) cr.lineTo(...point);
  });
  cr.lineTo(...at(to));
}

class Tween {
  private from = 0;
  private start = 0;
  private duration = 0;
  value = 0;
  target = 0;

  set(target: number, now: number, duration: number, delay = 0): void {
    this.from = this.at(now);
    this.target = target;
    this.start = now + delay * 1000;
    this.duration = duration * 1000;
  }

  at(now: number): number {
    const progress = this.duration ? (now - this.start) / this.duration : 1;
    this.value = progress <= 0 ? this.from : this.from + (this.target - this.from) * decelerate(progress);
    return this.value;
  }

  done(now: number): boolean {
    return now >= this.start + this.duration;
  }
}

export class FingerprintGlyph extends St.DrawingArea {
  static {
    GObject.registerClass(this);
  }

  private readonly fills = RIDGES.map(() => new Tween());
  private readonly collapses = RIDGES.map(() => new Tween());
  private readonly tint = new Tween();
  private readonly check = new Tween();
  private readonly frames: Clutter.Timeline;
  private breathing = false;
  private holdId = 0;
  private now = 0;

  constructor() {
    super({ style_class: 'kestrel-fingerprint-glyph', reactive: false });
    this.frames = new Clutter.Timeline({ actor: this, duration: 1000, repeat_count: -1 });
    this.frames.connect('new-frame', () => this.tick());
    this.connect('destroy', () => this.cancelHold());
  }

  present(state: FingerprintState): void {
    this.cancelHold();
    this.now = GLib.get_monotonic_time() / 1000;
    this.opacity = state.kind === 'unavailable' ? 64 : 255;
    switch (state.kind) {
    case 'retry':
      this.breathing = false;
      this.fillRidges(index => index < 2 ? 1 : 0);
      this.hold(RETRY_HOLD, () => this.drain());
      break;
    case 'no-match':
      this.breathing = false;
      this.fillRidges(() => 1);
      this.hold(FILL_TIME, () => {
        this.drain();
        this.tint.set(1, this.now, TINT_TIME);
        shake(this);
        this.hold(TINT_HOLD, () => this.tint.set(0, this.now, TINT_TIME));
      });
      break;
    case 'match':
      this.breathing = false;
      this.fillRidges(() => 1);
      this.hold(FILL_TIME, () => {
        this.collapses.forEach((tween, index) => tween.set(1, this.now, COLLAPSE_TIME, (RIDGES.length - 1 - index) * COLLAPSE_STAGGER));
        this.check.set(1, this.now, CHECK_TIME, CHECK_DELAY);
      });
      break;
    default:
      this.reset();
      this.breathing = state.kind === 'scanning';
    }
    this.animate();
  }

  private reset(): void {
    for (const tween of [...this.fills, ...this.collapses, this.tint, this.check]) tween.set(0, this.now, 0);
  }

  private fillRidges(target: (index: number) => number): void {
    this.collapses.forEach(tween => tween.set(0, this.now, 0));
    this.check.set(0, this.now, 0);
    this.fills.forEach((tween, index) => tween.set(target(index), this.now, FILL_TIME, index * FILL_STAGGER));
  }

  private drain(): void {
    this.fills.forEach((tween, index) => tween.set(0, this.now, DRAIN_TIME, (RIDGES.length - 1 - index) * DRAIN_STAGGER));
    this.breathing = true;
    this.animate();
  }

  private hold(milliseconds: number, then: () => void): void {
    this.holdId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
      this.holdId = 0;
      this.now = GLib.get_monotonic_time() / 1000;
      then();
      this.animate();
      return GLib.SOURCE_REMOVE;
    });
  }

  private cancelHold(): void {
    if (this.holdId) GLib.source_remove(this.holdId);
    this.holdId = 0;
  }

  private animate(): void {
    if (!this.frames.is_playing()) this.frames.start();
    this.queue_repaint();
  }

  private tick(): void {
    this.now = GLib.get_monotonic_time() / 1000;
    const tweens = [...this.fills, ...this.collapses, this.tint, this.check];
    const moving = tweens.some(tween => !tween.done(this.now));
    if (!moving && (!this.breathing || reducedMotion())) this.frames.stop();
    this.queue_repaint();
  }

  private breath(ridge: number): number {
    if (!this.breathing || reducedMotion()) return 1;
    const phase = ((this.now - ridge * BREATH_STAGGER) % BREATH_PERIOD) / BREATH_PERIOD;
    return 0.6 + 0.4 * (0.5 - 0.5 * Math.cos(2 * Math.PI * phase));
  }

  vfunc_repaint(): void {
    const cr = this.get_context();
    const [width] = this.get_surface_size();
    const theme = this.get_theme_node();
    const ink = theme.get_foreground_color();
    const [, danger] = theme.lookup_color('-kestrel-danger', false);
    const [x, y, size] = VIEW;
    cr.scale(width / size, width / size);
    cr.translate(-x, -y);
    cr.setLineCap(Cairo.LineCap.ROUND);
    cr.setLineJoin(Cairo.LineJoin.ROUND);
    cr.setLineWidth(STROKE);
    const tint = this.tint.at(this.now);
    const check = this.check.at(this.now);

    for (const path of PATHS) {
      const collapse = this.collapses[path.ridge].at(this.now);
      const fill = this.fills[path.ridge].at(this.now);
      cr.save();
      const scale = 1 - (1 - COLLAPSED) * collapse;
      cr.translate(FOCUS[0], FOCUS[1]);
      cr.scale(scale, scale);
      cr.translate(-FOCUS[0], -FOCUS[1]);
      const fade = 1 - collapse;
      const base = (0.5 + 0.4 * tint) * this.breath(path.ridge) * fade;
      setColor(cr, ink, base * (1 - tint));
      trace(cr, path, 0, 1);
      cr.stroke();
      if (tint > 0) {
        setColor(cr, danger, base * tint);
        trace(cr, path, 0, 1);
        cr.stroke();
      }
      if (fill > 0.001) {
        setColor(cr, ink, 0.95 * fade);
        trace(cr, path, 0.5 - fill / 2, 0.5 + fill / 2);
        cr.stroke();
      }
      cr.restore();
    }

    if (check > 0) {
      cr.setLineWidth(2.6);
      setColor(cr, ink, 0.95);
      const checkPath: Path = { ridge: 0, points: [...CHECK], lengths: [0, 0.35, 1] };
      trace(cr, checkPath, 0, check);
      cr.stroke();
    }
    cr.$dispose();
  }
}
