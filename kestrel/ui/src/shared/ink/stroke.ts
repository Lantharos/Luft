import Cairo from 'cairo';

import type { InkSample } from './sample.js';

export interface InkStyle {
  color: [number, number, number];
  width: number;
  pressure: boolean;
  opacity: number;
}

interface Bounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const LIGHTEST = 0.25;
const PER_PRESSURE = 1.25;

export function widthAt(style: InkStyle, pressure: number): number {
  return style.pressure ? style.width * (LIGHTEST + PER_PRESSURE * pressure) : style.width;
}

function distanceToSegment(px: number, py: number, a: InkSample, b: InkSample): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / length));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

export class Stroke {
  readonly samples: InkSample[] = [];
  readonly bounds: Bounds = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };

  constructor(readonly style: InkStyle) {}

  add(sample: InkSample): void {
    const last = this.samples.at(-1);
    if (last && last.x === sample.x && last.y === sample.y) {
      last.pressure = Math.max(last.pressure, sample.pressure);
      return;
    }
    this.samples.push(sample);
    const reach = widthAt(this.style, sample.pressure) / 2;
    this.bounds.x1 = Math.min(this.bounds.x1, sample.x - reach);
    this.bounds.y1 = Math.min(this.bounds.y1, sample.y - reach);
    this.bounds.x2 = Math.max(this.bounds.x2, sample.x + reach);
    this.bounds.y2 = Math.max(this.bounds.y2, sample.y + reach);
  }

  touches(x: number, y: number, radius: number): boolean {
    const { x1, y1, x2, y2 } = this.bounds;
    if (x < x1 - radius || x > x2 + radius || y < y1 - radius || y > y2 + radius) return false;
    if (this.samples.length === 1) return Math.hypot(x - this.samples[0].x, y - this.samples[0].y) <= radius + this.style.width / 2;
    for (let i = 1; i < this.samples.length; i++) {
      const reach = radius + widthAt(this.style, this.samples[i].pressure) / 2;
      if (distanceToSegment(x, y, this.samples[i - 1], this.samples[i]) <= reach) return true;
    }
    return false;
  }

  /** Paints the stroke opaque; the caller applies the style's opacity to the result. */
  paint(cr: Cairo.Context): void {
    const [r, g, b] = this.style.color;
    cr.setSourceRGBA(r, g, b, 1);
    cr.setLineCap(Cairo.LineCap.ROUND);
    cr.setLineJoin(Cairo.LineJoin.ROUND);
    const points = this.samples;
    if (points.length === 1) {
      cr.arc(points[0].x, points[0].y, widthAt(this.style, points[0].pressure) / 2, 0, 2 * Math.PI);
      cr.fill();
      return;
    }
    if (!this.style.pressure) {
      this.trace(cr, 0, points.length - 1);
      cr.setLineWidth(this.style.width);
      cr.stroke();
      return;
    }
    for (let i = 0; i < points.length - 1; i++) {
      this.trace(cr, i, i + 1);
      cr.setLineWidth((widthAt(this.style, points[i].pressure) + widthAt(this.style, points[i + 1].pressure)) / 2);
      cr.stroke();
    }
  }

  /** Smooths the polyline from sample `from` to `to` through the midpoints between samples. */
  private trace(cr: Cairo.Context, from: number, to: number): void {
    const points = this.samples;
    const mid = (i: number) => i <= 0 ? points[0] : i >= points.length - 1 ? points[points.length - 1]
      : { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    let { x, y } = mid(from);
    cr.moveTo(x, y);
    for (let i = from + 1; i <= to; i++) {
      const end = mid(i);
      const control = points[i];
      cr.curveTo(x + 2 / 3 * (control.x - x), y + 2 / 3 * (control.y - y),
        end.x + 2 / 3 * (control.x - end.x), end.y + 2 / 3 * (control.y - end.y), end.x, end.y);
      ({ x, y } = end);
    }
  }
}
