import Cairo from 'cairo';
import type Cogl from 'gi://Cogl';
import Pango from 'gi://Pango';
import PangoCairo from 'gi://PangoCairo';
import type St from 'gi://St';

import { levelLayout, type BatteryGeometry, type Rect } from './geometry.js';

const OUTLINE_ALPHA = 0.55;
const TRACK_ALPHA = 0.3;
const HALO_STEPS = 3;
const BOLT: [number, number][] = [[0.68, 0], [0.04, 0.57], [0.46, 0.57], [0.32, 1], [0.96, 0.43], [0.54, 0.43]];

export type Glyph = 'none' | 'inside' | 'outside';

export interface Paint {
  geometry: BatteryGeometry;
  level: number;
  text: string | null;
  glyph: Glyph;
  ink: Cogl.Color;
  fill: Cogl.Color;
  halo: St.Shadow | null;
  family: string;
  scale: number;
}

class Pixels {
  readonly line: number;

  constructor(private readonly scale: number) {
    this.line = Math.max(1, Math.round(scale)) / scale;
  }

  snap(value: number): number {
    return Math.round(value * this.scale) / this.scale;
  }

  rect({ x, y, width, height }: Rect): Rect {
    const left = this.snap(x);
    const top = this.snap(y);
    return { x: left, y: top, width: this.snap(x + width) - left, height: this.snap(y + height) - top };
  }
}

function setColor(cr: Cairo.Context, color: Cogl.Color, alpha = 1): void {
  cr.setSourceRGBA(color.red / 255, color.green / 255, color.blue / 255, color.alpha / 255 * alpha);
}

function roundedRect(cr: Cairo.Context, { x, y, width, height }: Rect, radius: number): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  cr.newSubPath();
  cr.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
  cr.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
  cr.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
  cr.arc(x + r, y + r, r, Math.PI, 3 * Math.PI / 2);
  cr.closePath();
}

function nubPath(cr: Cairo.Context, { x, y, width, height }: Rect): void {
  const r = Math.min(width, height / 2);
  cr.newSubPath();
  cr.moveTo(x, y);
  cr.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
  cr.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
  cr.lineTo(x, y + height);
  cr.closePath();
}

function boltPath(cr: Cairo.Context, { x, y, width, height }: Rect): void {
  cr.newSubPath();
  BOLT.forEach(([px, py], index) => {
    if (index) cr.lineTo(x + px * width, y + py * height);
    else cr.moveTo(x + px * width, y + py * height);
  });
  cr.closePath();
}

function silhouette(cr: Cairo.Context, paint: Paint, body: Rect, nub: Rect, bolt: Rect): void {
  roundedRect(cr, body, paint.geometry.radius);
  nubPath(cr, nub);
  if (paint.glyph === 'outside') boltPath(cr, bolt);
}

function paintHalo(cr: Cairo.Context, paint: Paint, body: Rect, nub: Rect, bolt: Rect): void {
  const halo = paint.halo!;
  cr.save();
  cr.translate(halo.xoffset, halo.yoffset);
  silhouette(cr, paint, body, nub, bolt);
  const path = cr.copyPath();
  setColor(cr, halo.color, 1 / HALO_STEPS);
  cr.setLineJoin(Cairo.LineJoin.ROUND);
  for (let step = 1; step <= HALO_STEPS; step++) {
    cr.newPath();
    cr.appendPath(path);
    cr.setLineWidth(2 * halo.blur * step / HALO_STEPS);
    cr.strokePreserve();
    cr.fill();
  }
  cr.restore();
}

function levelWidth(pixels: Pixels, inner: Rect, level: number): number {
  return Math.min(inner.width, Math.max(pixels.line * 2, pixels.snap(inner.width * level / 100)));
}

function paintOutlined(cr: Cairo.Context, paint: Paint, pixels: Pixels, body: Rect, bolt: Rect): void {
  const line = pixels.line;
  setColor(cr, paint.ink, OUTLINE_ALPHA);
  cr.setLineWidth(line);
  roundedRect(cr, { x: body.x + line / 2, y: body.y + line / 2, width: body.width - line, height: body.height - line }, paint.geometry.radius - line / 2);
  cr.stroke();

  const inset = line * 2;
  const inner = { x: body.x + inset, y: body.y + inset, width: body.width - inset * 2, height: body.height - inset * 2 };
  const innerRadius = Math.max(paint.geometry.radius - inset, line);
  cr.save();
  roundedRect(cr, inner, innerRadius);
  cr.clip();
  setColor(cr, paint.fill);
  cr.rectangle(inner.x, inner.y, levelWidth(pixels, inner, paint.level), inner.height);
  cr.fill();
  cr.restore();

  if (paint.glyph !== 'inside') return;
  boltPath(cr, bolt);
  const path = cr.copyPath();
  cr.save();
  roundedRect(cr, inner, innerRadius);
  cr.clip();
  cr.setOperator(Cairo.Operator.CLEAR);
  cr.setLineWidth(line * 2);
  cr.setLineJoin(Cairo.LineJoin.ROUND);
  cr.appendPath(path);
  cr.stroke();
  cr.restore();
  cr.newPath();
  cr.appendPath(path);
  setColor(cr, paint.ink);
  cr.fill();
}

function textPath(cr: Cairo.Context, paint: Paint, pixels: Pixels, body: Rect): Cairo.Path {
  const layout = PangoCairo.create_layout(cr);
  const levelText = levelLayout(layout.get_context(), paint.text!, paint.family, paint.geometry.fontSize);
  const [ink] = levelText.get_extents();
  const x = pixels.snap(body.x + (body.width - ink!.width / Pango.SCALE) / 2) - ink!.x / Pango.SCALE;
  const y = pixels.snap(body.y + (body.height - ink!.height / Pango.SCALE) / 2) - ink!.y / Pango.SCALE;
  cr.moveTo(x, y);
  PangoCairo.layout_path(cr, levelText);
  const path = cr.copyPath();
  cr.newPath();
  return path;
}

function paintNumbered(cr: Cairo.Context, paint: Paint, pixels: Pixels, body: Rect): void {
  const end = body.x + levelWidth(pixels, body, paint.level);
  const radius = paint.geometry.radius;
  setColor(cr, paint.ink, TRACK_ALPHA);
  roundedRect(cr, body, radius);
  cr.fill();
  cr.save();
  roundedRect(cr, body, radius);
  cr.clip();
  setColor(cr, paint.fill);
  cr.rectangle(body.x, body.y, end - body.x, body.height);
  cr.fill();
  cr.restore();

  const text = textPath(cr, paint, pixels, body);
  cr.save();
  cr.rectangle(body.x, body.y, end - body.x, body.height);
  cr.clip();
  cr.setOperator(Cairo.Operator.CLEAR);
  cr.appendPath(text);
  cr.fill();
  cr.restore();
  cr.save();
  cr.rectangle(end, body.y, body.x + body.width - end, body.height);
  cr.clip();
  setColor(cr, paint.ink);
  cr.appendPath(text);
  cr.fill();
  cr.restore();
}

export function paintBattery(cr: Cairo.Context, paint: Paint): void {
  const pixels = new Pixels(paint.scale);
  const body = pixels.rect(paint.geometry.body);
  const nub = pixels.rect(paint.geometry.nub);
  const bolt = paint.geometry.bolt;
  cr.setOperator(Cairo.Operator.CLEAR);
  cr.paint();
  cr.setOperator(Cairo.Operator.OVER);
  if (paint.halo) paintHalo(cr, paint, body, nub, bolt);

  if (paint.text) paintNumbered(cr, paint, pixels, body);
  else paintOutlined(cr, paint, pixels, body, bolt);

  setColor(cr, paint.ink, paint.text ? TRACK_ALPHA : OUTLINE_ALPHA);
  nubPath(cr, nub);
  cr.fill();

  if (paint.glyph !== 'outside') return;
  setColor(cr, paint.ink);
  boltPath(cr, bolt);
  cr.fill();
}
