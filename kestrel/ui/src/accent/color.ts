export type Rgb = [number, number, number];
export type Hsl = [number, number, number];

const HUE_BINS = 24;
const MIN_VALUE = 0.18;
const MIN_CHROMA = 0.16;
const NEUTRAL: Rgb = [138, 148, 164];

const NAMED_ACCENTS: [string, number][] = [
  ['red', 353], ['orange', 22], ['yellow', 41], ['green', 130],
  ['teal', 189], ['blue', 213], ['purple', 285], ['pink', 330],
];

export function rgbToHsl([red, green, blue]: Rgb): Hsl {
  const r = red / 255, g = green / 255, b = blue / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return [0, 0, lightness];
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  const hue = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [hue * 60, saturation, lightness];
}

export function hslToRgb([hue, saturation, lightness]: Hsl): Rgb {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness - chroma / 2;
  const [r, g, b] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x]
    : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return [r, g, b].map(channel => Math.round((channel + m) * 255)) as Rgb;
}

export function toHex(color: Rgb): string {
  return `#${color.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

export function withLightness(color: Rgb, lightness: number): Rgb {
  const [hue, saturation] = rgbToHsl(color);
  return hslToRgb([hue, saturation, lightness]);
}

export function accentFromSamples(samples: Rgb[]): Rgb {
  const weights = new Float64Array(HUE_BINS);
  const sums = Array.from({ length: HUE_BINS }, () => [0, 0, 0]);
  for (const sample of samples) {
    const value = Math.max(...sample) / 255;
    const chroma = (Math.max(...sample) - Math.min(...sample)) / 255;
    if (value < MIN_VALUE || chroma < MIN_CHROMA) continue;
    const bin = Math.floor(rgbToHsl(sample)[0] / 360 * HUE_BINS) % HUE_BINS;
    weights[bin] += chroma;
    sample.forEach((channel, index) => sums[bin][index] += channel * chroma);
  }
  let best = -1;
  weights.forEach((weight, bin) => { if (weight > 0 && (best < 0 || weight > weights[best])) best = bin; });
  if (best < 0) return NEUTRAL;
  const [hue, saturation] = rgbToHsl(sums[best].map(sum => sum / weights[best]) as Rgb);
  return hslToRgb([hue, Math.min(0.85, Math.max(0.5, saturation)), 0.56]);
}

export function namedAccent(color: Rgb): string {
  const [hue, saturation] = rgbToHsl(color);
  if (saturation < 0.25) return 'slate';
  const distance = (target: number) => Math.min(Math.abs(hue - target), 360 - Math.abs(hue - target));
  return NAMED_ACCENTS.reduce((best, entry) => distance(entry[1]) < distance(best[1]) ? entry : best)[0];
}
