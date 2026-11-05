import { clamp, mix, mixRgb, noise, Picture, type Rgb, smooth } from './picture.js';

export interface Paper {
  dim: Rgb;
  shade: Rgb;
  lit: Rgb;
  core: Rgb;
}

const PAPERS: Record<string, Paper> = {
  amber: { dim: [0.86, 0.47, 0.2], shade: [0.42, 0.17, 0.09], lit: [1, 0.66, 0.24], core: [1, 0.95, 0.74] },
  coral: { dim: [0.84, 0.29, 0.25], shade: [0.38, 0.09, 0.14], lit: [1, 0.42, 0.3], core: [1, 0.87, 0.72] },
  jade: { dim: [0.25, 0.6, 0.52], shade: [0.07, 0.25, 0.28], lit: [0.42, 0.9, 0.72], core: [0.9, 1, 0.84] },
};
const METAL: Rgb = [0.2, 0.14, 0.13];
const METAL_LIGHT: Rgb = [0.52, 0.4, 0.3];
const BODY = { top: -0.68, bottom: 0.68, width: 0.74 };

/** How wide the lantern's paper is at a height, a plump barrel with flat ends. */
function halfWidth(y: number): number {
  const along = (y - (BODY.top + BODY.bottom) / 2) / ((BODY.bottom - BODY.top) / 2);
  return BODY.width * (1 - along * along * 0.62) ** 0.5;
}

function band(picture: Picture, centerY: number, height: number, width: number): void {
  picture.paint((x, y) => {
    const edge = Math.max(Math.abs(x) - width, Math.abs(y - centerY) - height);
    const alpha = 1 - smooth(-0.012, 0.012, edge);
    const light = mix(0.1, 1, smooth(-width, width, -x * 0.7 - 0.2 * width)) * (1 - smooth(-height, height, y - centerY) * 0.55);
    return [...mixRgb(METAL, METAL_LIGHT, light * 0.6), alpha];
  });
}

/** A paper lantern hanging straight, its top at the top of the frame: dim with a candle inside, or lit right up. */
export function lantern({ dim, shade, lit, core }: Paper, seed: number, glow: number): Picture {
  const picture = new Picture(192);
  picture.paint((x, y) => {
    const half = halfWidth(y);
    const inside = Math.abs(x) / half;
    const edge = Math.max(inside - 1, Math.abs(y) - BODY.bottom);
    const alpha = 1 - smooth(-0.015, 0.015, edge * half);
    if (alpha <= 0) return null;
    const round = Math.sqrt(clamp(1 - inside * inside));
    const ribs = Math.cos(Math.asin(clamp(x / half, -1, 1)) * 9) ** 8;
    const fibres = noise(x * 9, y * 26, seed, 3) * 0.14;
    const toLight = Math.hypot(x * 1.05, (y - 0.08) * 0.95);
    const candle = (1 - smooth(0.05, 0.92, toLight)) ** 1.6;
    const paper = mixRgb(shade, dim, smooth(0.1, 0.95, round) * (0.72 + 0.28 * smooth(0.6, -0.6, y)));
    const warmed = mixRgb(paper, lit, clamp(candle * (0.6 + glow * 0.5) + glow * 0.34));
    const hot = mixRgb(warmed, core, clamp(candle ** 2.2 * (0.34 + glow * 0.75)));
    const ribbed = mixRgb(hot, shade, ribs * (0.34 - glow * 0.14));
    return [...mixRgb(ribbed, [1, 1, 1], fibres * 0.3), alpha];
  });
  band(picture, BODY.top - 0.03, 0.05, 0.42);
  band(picture, BODY.bottom + 0.03, 0.045, 0.38);
  return picture;
}

export function lanterns(): Picture[] {
  const papers = Object.values(PAPERS);
  return [...papers.map((paper, index) => lantern(paper, index, 0)), ...papers.map((paper, index) => lantern(paper, index, 1))];
}

/** Soft threads hanging from a knot, their top at the top of the frame. */
export function tassels(): Picture[] {
  return Object.values(PAPERS).map(({ dim, shade }) => new Picture(64).paint((x, y) => {
    const knot = 1 - smooth(0.1, 0.17, Math.hypot(x, y + 0.82));
    const reach = smooth(0.92, 0.7, y) * smooth(-1, -0.86, y);
    const spread = 0.04 + (y + 0.8) * 0.13;
    const threads = (0.6 + 0.4 * Math.cos(x * 34)) * (1 - smooth(spread * 0.7, spread, Math.abs(x)));
    const alpha = Math.max(knot, threads * reach);
    return [...mixRgb(shade, dim, smooth(-0.3, 0.3, -x * 3 + 0.4) * 0.5 + knot * 0.4 + 0.2), alpha];
  }));
}
