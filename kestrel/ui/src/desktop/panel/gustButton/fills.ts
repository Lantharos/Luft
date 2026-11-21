import { GUST_ON_DARK, GUST_ON_LIGHT, type GustFill, type GustFills } from '../../../../../../packages/web/ui/src/taskbar/gust';
import { atTone, contrast, fromHex, seedFromColor, toHex, toneOf, type Rgb } from '../../../appearance/color.js';
import type { Paint } from '../../../appearance/icons/paint.js';

const MIN_BACKDROP_CONTRAST = 2.2;
const MIN_WAVE_CONTRAST = 1.6;
const MID_TONE = 50;
const TONES = Array.from({ length: 101 }, (_, tone) => tone);

function over(hex: string, backdrop: Rgb): Rgb {
  const alpha = hex.length > 7 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return fromHex(hex).map((channel, index) => Math.round(channel * alpha + backdrop[index] * (1 - alpha))) as Rgb;
}

const average = (fill: GustFill): string => typeof fill === 'string' ? fill
  : toHex(fromHex(fill[0]).map((channel, index) => Math.round((channel + fromHex(fill[1])[index]) / 2)) as Rgb);

interface Rating {
  disc: Rgb;
  wave: number;
  backdrop: number;
}

const lowest = (disc: Rgb, others: Rgb[], target: number) => Math.min(...others.map(other => contrast(disc, other) / target));

function quieterTones(waveTone: number, preferredTone: number, quieter: number): number[] {
  return TONES.filter(tone => (tone - waveTone) * quieter > 0).sort((a, b) => Math.abs(a - preferredTone) - Math.abs(b - preferredTone));
}

function visibleDisc(waveHex: string, discHex: string, backdrops: Rgb[]): Rgb | null {
  const waves = backdrops.map(backdrop => over(waveHex, backdrop));
  const rate = (disc: Rgb): Rating => ({ disc, wave: lowest(disc, waves, MIN_WAVE_CONTRAST), backdrop: lowest(disc, backdrops, MIN_BACKDROP_CONTRAST) });
  const preferred = rate(over(discHex, backdrops[0]));
  if (preferred.wave >= 1 && preferred.backdrop >= 1) return null;
  const palette = seedFromColor(preferred.disc);
  const quieter = toneOf(fromHex(waveHex)) > MID_TONE ? -1 : 1;
  const candidates = quieterTones(toneOf(waves[0]), toneOf(preferred.disc), quieter).map(tone => rate(atTone(palette, tone)));
  const distinct = candidates.filter(candidate => candidate.wave >= 1);
  const pool = distinct.length ? distinct : candidates;
  const score = (candidate: Rating) => distinct.length ? candidate.backdrop : Math.min(candidate.wave, candidate.backdrop);
  return (pool.find(candidate => candidate.backdrop >= 1) ?? pool.reduce((best, candidate) => score(candidate) > score(best) ? candidate : best)).disc;
}

function shifted(fill: GustFill, by: number): GustFill {
  const move = (hex: string) => toHex(atTone(seedFromColor(fromHex(hex)), Math.min(100, Math.max(0, toneOf(fromHex(hex)) + by))));
  return typeof fill === 'string' ? move(fill) : [move(fill[0]), move(fill[1])];
}

export function gustFills(foreground: string, paint: Paint | null, backdrops: Rgb[]): GustFills {
  const chosen = paint ? { disc: paint.shade, wave: paint.ink } : toneOf(fromHex(foreground)) < MID_TONE ? GUST_ON_LIGHT : GUST_ON_DARK;
  const disc = average(chosen.disc);
  const visible = backdrops.length ? visibleDisc(average(chosen.wave), disc, backdrops) : null;
  if (!visible) return chosen;
  return { ...chosen, disc: typeof chosen.disc === 'string' ? toHex(visible) : shifted(chosen.disc, toneOf(visible) - toneOf(fromHex(disc))) };
}
