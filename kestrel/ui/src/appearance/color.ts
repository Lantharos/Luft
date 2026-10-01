export type Rgb = [number, number, number];
type Oklab = [number, number, number];
type Oklch = [number, number, number];

export interface TonalPalette {
  hue: number;
  chroma: number;
}

export type Seed = TonalPalette;

const ACCENT_TONE = 0.72;
const HUE_BINS = 36;
const HUE_WINDOW = 18;
const MIN_LIGHTNESS = 0.25;
const MIN_CHROMA = 0.035;
const MIN_VIVID_SHARE = 0.05;
const ACCENT_CHROMA_FLOOR = 0.07;
const ACCENT_CHROMA_CEILING = 0.2;
const WHITE: Rgb = [255, 255, 255];
const INK: Rgb = [24, 24, 23];

export const NEUTRAL: Seed = { hue: 0, chroma: 0 };

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

const clampedLinear = (lightness: number, chroma: number, hue: number) =>
  oklchToLinear([lightness, gamutChroma(lightness, chroma, hue), hue]).map(channel => Math.min(1, Math.max(0, channel)));

const linearLuminance = ([red, green, blue]: number[]) => 0.2126 * red + 0.7152 * green + 0.0722 * blue;

function fromOklch([lightness, chroma, hue]: Oklch): Rgb {
  return clampedLinear(lightness, chroma, hue).map(fromLinear) as Rgb;
}

function withLuminance(hue: number, chroma: number, luminance: number): Rgb {
  if (luminance <= 0) return [0, 0, 0];
  if (luminance >= 1) return [255, 255, 255];
  let low = 0, high = 1;
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2;
    if (linearLuminance(clampedLinear(middle, chroma, hue)) < luminance) low = middle;
    else high = middle;
  }
  return fromOklch([(low + high) / 2, chroma, hue]);
}

const luminanceOfTone = (tone: number) => tone > 8 ? ((tone + 16) / 116) ** 3 : tone / 903.2962962;

export const atTone = ({ hue, chroma }: TonalPalette, tone: number): Rgb => withLuminance(hue, chroma, luminanceOfTone(tone));

const hueDistance = (first: number, second: number) => {
  const difference = Math.abs(first - second) % 360;
  return Math.min(difference, 360 - difference);
};

export function toHex(color: Rgb): string {
  return `#${color.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function dominantHue(colors: Oklch[]): number {
  const scores = new Float64Array(HUE_BINS);
  for (const [, chroma, hue] of colors) scores[Math.floor(hue / 360 * HUE_BINS) % HUE_BINS] += chroma * chroma;
  const smoothed = scores.map((score, bin) =>
    score + 0.5 * (scores[(bin + HUE_BINS - 1) % HUE_BINS] + scores[(bin + 1) % HUE_BINS]));
  const best = smoothed.indexOf(Math.max(...smoothed));
  return (best + 0.5) * 360 / HUE_BINS;
}

export function seedFromSamples(samples: Rgb[]): Seed {
  const colors = samples.map(toOklch).filter(([lightness]) => lightness >= MIN_LIGHTNESS);
  const vivid = colors.filter(([, chroma]) => chroma >= MIN_CHROMA);
  if (vivid.length <= colors.length * MIN_VIVID_SHARE) return NEUTRAL;
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
  return {
    hue: hueOf(sumA, sumB),
    chroma: Math.min(ACCENT_CHROMA_CEILING, Math.max(ACCENT_CHROMA_FLOOR, sumChroma / sumWeight)),
  };
}

export const isNeutral = ({ chroma }: Seed) => chroma === 0;

export const accentColor = (seed: Seed): Rgb => isNeutral(seed) ? WHITE : fromOklch([ACCENT_TONE, seed.chroma, seed.hue]);

const contrast = (first: Rgb, second: Rgb) => {
  const [lighter, darker] = [first, second].map(color => linearLuminance(color.map(toLinear))).sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

export const readableOn = (background: Rgb): Rgb => contrast(background, WHITE) >= contrast(background, INK) ? WHITE : INK;

export const fromHex = (hex: string): Rgb => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)) as Rgb;

export function seedFromColor(color: Rgb): Seed {
  const [, chroma, hue] = toOklch(color);
  return { hue, chroma: Math.min(ACCENT_CHROMA_CEILING, chroma) };
}

export function namedAccent({ hue, chroma }: Seed): string {
  if (chroma < ACCENT_CHROMA_FLOOR / 2) return 'slate';
  return NAMED_ACCENTS.reduce((best, entry) =>
    hueDistance(hue, toOklch(entry[1])[2]) < hueDistance(hue, toOklch(best[1])[2]) ? entry : best)[0];
}
