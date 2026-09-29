export type Rgb = [number, number, number];
type Oklab = [number, number, number];
type Oklch = [number, number, number];

export const ACCENT_TONE = 0.72;
export const STRONG_TONE = 0.5;
export const LIGHT_TONE = 0.8;

const HUE_BINS = 36;
const HUE_WINDOW = 18;
const MIN_LIGHTNESS = 0.25;
const MIN_CHROMA = 0.035;
const ACCENT_CHROMA_FLOOR = 0.07;
const ACCENT_CHROMA_CEILING = 0.2;
const NEUTRAL_CHROMA = 0.02;

const NAMED_ACCENTS: [string, Rgb][] = [
  ['blue', [53, 132, 228]], ['teal', [33, 144, 164]], ['green', [58, 148, 74]],
  ['yellow', [200, 136, 0]], ['orange', [237, 91, 0]], ['red', [230, 45, 66]],
  ['pink', [213, 97, 153]], ['purple', [145, 65, 172]],
];

const toLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (value: number) =>
  Math.round(255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055));

function toOklab([red, green, blue]: Rgb): Oklab {
  const r = toLinear(red), g = toLinear(green), b = toLinear(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function linearFromOklab([lightness, a, b]: Oklab): [number, number, number] {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const hueOf = (a: number, b: number) => (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;

const toOklch = (color: Rgb): Oklch => {
  const [lightness, a, b] = toOklab(color);
  return [lightness, Math.hypot(a, b), hueOf(a, b)];
};

const oklabFromOklch = ([lightness, chroma, hue]: Oklch): Oklab => {
  const radians = hue * Math.PI / 180;
  return [lightness, chroma * Math.cos(radians), chroma * Math.sin(radians)];
};

const oklchToLinear = (color: Oklch) => linearFromOklab(oklabFromOklch(color));

const inGamut = (channels: number[]) => channels.every(channel => channel >= -1e-4 && channel <= 1 + 1e-4);

function gamutChroma(lightness: number, chroma: number, hue: number): number {
  if (inGamut(oklchToLinear([lightness, chroma, hue]))) return chroma;
  let low = 0, high = chroma;
  for (let step = 0; step < 20; step++) {
    const middle = (low + high) / 2;
    if (inGamut(oklchToLinear([lightness, middle, hue]))) low = middle;
    else high = middle;
  }
  return low;
}

function fromOklch([lightness, chroma, hue]: Oklch): Rgb {
  const linear = oklchToLinear([lightness, gamutChroma(lightness, chroma, hue), hue]);
  return linear.map(channel => fromLinear(Math.min(1, Math.max(0, channel)))) as Rgb;
}

const hueDistance = (first: number, second: number) => {
  const difference = Math.abs(first - second) % 360;
  return Math.min(difference, 360 - difference);
};

export function toHex(color: Rgb): string {
  return `#${color.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

export function withTone(color: Rgb, tone: number): Rgb {
  const [, chroma, hue] = toOklch(color);
  return fromOklch([tone, chroma, hue]);
}

function dominantHue(colors: Oklch[]): number {
  const scores = new Float64Array(HUE_BINS);
  for (const [, chroma, hue] of colors) scores[Math.floor(hue / 360 * HUE_BINS) % HUE_BINS] += chroma * chroma;
  const smoothed = scores.map((score, bin) =>
    score + 0.5 * (scores[(bin + HUE_BINS - 1) % HUE_BINS] + scores[(bin + 1) % HUE_BINS]));
  const best = smoothed.indexOf(Math.max(...smoothed));
  return (best + 0.5) * 360 / HUE_BINS;
}

export function accentFromSamples(samples: Rgb[]): Rgb {
  const colors = samples.map(toOklch).filter(([lightness]) => lightness >= MIN_LIGHTNESS);
  const vivid = colors.filter(([, chroma]) => chroma >= MIN_CHROMA);
  if (!vivid.length) {
    const [a, b] = colors.map(oklabFromOklch).reduce(([sumA, sumB], [, a, b]) => [sumA + a, sumB + b], [0, 0]);
    return fromOklch([ACCENT_TONE, NEUTRAL_CHROMA, hueOf(a, b)]);
  }
  const center = dominantHue(vivid);
  let sumA = 0, sumB = 0, sumChroma = 0, sumWeight = 0;
  for (const color of vivid) {
    if (hueDistance(color[2], center) > HUE_WINDOW) continue;
    const weight = color[1] * color[1];
    const [, a, b] = oklabFromOklch(color);
    sumA += a * weight;
    sumB += b * weight;
    sumChroma += color[1] * weight;
    sumWeight += weight;
  }
  const hue = hueOf(sumA, sumB);
  const chroma = Math.min(ACCENT_CHROMA_CEILING, Math.max(ACCENT_CHROMA_FLOOR, sumChroma / sumWeight));
  return fromOklch([ACCENT_TONE, chroma, hue]);
}

export function namedAccent(color: Rgb): string {
  const [, chroma, hue] = toOklch(color);
  if (chroma < ACCENT_CHROMA_FLOOR / 2) return 'slate';
  return NAMED_ACCENTS.reduce((best, entry) =>
    hueDistance(hue, toOklch(entry[1])[2]) < hueDistance(hue, toOklch(best[1])[2]) ? entry : best)[0];
}
