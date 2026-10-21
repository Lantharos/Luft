import type { MarkFills } from '../../../../../../packages/web/ui/src/taskbar/mark';
import { atTone, contrast, fromHex, seedFromColor, toHex, toneOf, type Rgb } from '../../../appearance/color.js';
import type { Paint } from '../../../appearance/icons/paint.js';

const MIN_BACKDROP_CONTRAST = 2.2;
const MIN_INK_CONTRAST = 1.6;
const MID_TONE = 50;
const TONES = Array.from({ length: 101 }, (_, tone) => tone);

function over(hex: string, backdrop: Rgb): Rgb {
  const alpha = hex.length > 7 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return fromHex(hex).map((channel, index) => Math.round(channel * alpha + backdrop[index] * (1 - alpha))) as Rgb;
}

interface Rating {
  shade: Rgb;
  ink: number;
  backdrop: number;
}

const lowest = (shade: Rgb, others: Rgb[], target: number) => Math.min(...others.map(other => contrast(shade, other) / target));

function quieterTones(inkTone: number, preferredTone: number, quieter: number): number[] {
  return TONES.filter(tone => (tone - inkTone) * quieter > 0).sort((a, b) => Math.abs(a - preferredTone) - Math.abs(b - preferredTone));
}

function markShade(inkHex: string, shadeHex: string, backdrops: Rgb[]): string {
  const inks = backdrops.map(backdrop => over(inkHex, backdrop));
  const rate = (shade: Rgb): Rating => ({ shade, ink: lowest(shade, inks, MIN_INK_CONTRAST), backdrop: lowest(shade, backdrops, MIN_BACKDROP_CONTRAST) });
  const preferred = rate(over(shadeHex, backdrops[0]));
  if (preferred.ink >= 1 && preferred.backdrop >= 1) return toHex(preferred.shade);
  const palette = seedFromColor(preferred.shade);
  const quieter = toneOf(fromHex(inkHex)) > MID_TONE ? -1 : 1;
  const candidates = quieterTones(toneOf(inks[0]), toneOf(preferred.shade), quieter).map(tone => rate(atTone(palette, tone)));
  const distinct = candidates.filter(candidate => candidate.ink >= 1);
  const pool = distinct.length ? distinct : candidates;
  const score = (candidate: Rating) => distinct.length ? candidate.backdrop : Math.min(candidate.ink, candidate.backdrop);
  const best = pool.find(candidate => candidate.backdrop >= 1) ?? pool.reduce((best, candidate) => score(candidate) > score(best) ? candidate : best);
  return toHex(best.shade);
}

const monochromeShade = (inkHex: string, backdrops: Rgb[]): string =>
  backdrops.every(backdrop => contrast(over(inkHex, backdrop), backdrop) >= MIN_BACKDROP_CONTRAST) ? inkHex : markShade(inkHex, inkHex, backdrops);

export function markFills(foreground: string, paint: Paint | null, backdrops: Rgb[]): MarkFills {
  const ink = paint?.ink ?? foreground;
  if (!backdrops.length) return { shade: paint?.shade ?? ink, ink };
  return { shade: paint ? markShade(ink, paint.shade, backdrops) : monochromeShade(ink, backdrops), ink };
}
