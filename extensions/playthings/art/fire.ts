import { clamp, mix, mixRgb, noise, Picture, type Rgb, smooth } from './picture.js';

const CORE: Rgb = [1, 0.96, 0.72];
const MIDDLE: Rgb = [1, 0.66, 0.16];
const EDGE: Rgb = [0.95, 0.26, 0.07];
const DEEP_MIDDLE: Rgb = [1, 0.5, 0.12];
const DEEP_EDGE: Rgb = [0.78, 0.14, 0.09];

const FRAMES = 6;

/** A flame on the bottom edge of the frame. Frames loop, so they can flick through without a jump. */
export function flame(frame: number, seed: number, deep: boolean): Picture {
  const phase = frame / FRAMES * Math.PI * 2;
  const [orbitX, orbitY] = [Math.cos(phase) * 0.6, Math.sin(phase) * 0.6];
  const [middle, edge] = deep ? [DEEP_MIDDLE, DEEP_EDGE] : [MIDDLE, EDGE];
  return new Picture(160).paint((x, y) => {
    const up = (1 - y) / 2;
    const wander = (noise(x * 1.2 + orbitX + 9, y * 1.5 + orbitY, seed) - 0.5) * 0.95 * up;
    const bent = x + wander + Math.sin(up * 5 + phase) * 0.06 * up;
    const belly = 0.6 * (1 - smooth(0, 1, up) ** 0.7) * smooth(-0.02, 0.14, up) ** 0.45 + 0.015;
    const height = 0.88 + 0.08 * Math.sin(phase + seed);
    const lick = (noise(x * 2.5 + orbitX, y * 2.2 + orbitY * 1.3 + 3, seed + 4) - 0.5) * 0.3 * up;
    const across = Math.abs(bent) / belly + lick * 2;
    const heat = 1 - across - smooth(height * 0.72, height, up) * 1.05;
    const alpha = smooth(0, 0.2, heat);
    const hot = clamp(heat * 1.05 - up * 0.75);
    const color = hot > 0.5 ? mixRgb(middle, CORE, smooth(0.5, 0.92, hot)) : mixRgb(edge, middle, smooth(0.0, 0.42, hot));
    return [color[0], color[1], color[2], mix(0, 0.97, alpha)];
  });
}

export function flames(): Picture[] {
  return [
    ...Array.from({ length: FRAMES }, (_, frame) => flame(frame, 2, false)),
    ...Array.from({ length: FRAMES }, (_, frame) => flame(frame, 6, true)),
  ];
}

const BARK: Rgb = [0.3, 0.19, 0.13];
const BARK_DARK: Rgb = [0.13, 0.08, 0.08];
const CUT: Rgb = [0.72, 0.52, 0.34];
const CHAR: Rgb = [0.09, 0.07, 0.08];
const EMBER: Rgb = [1, 0.42, 0.1];

function log(picture: Picture, turn: number, centerY: number, length: number, radius: number, seed: number): void {
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  picture.paint((px, py) => {
    const [dx, dy] = [px, py - centerY];
    const [x, y] = [dx * cos + dy * sin, -dx * sin + dy * cos];
    const inside = 1 - smooth(-0.012, 0.012, Math.hypot(Math.max(0, Math.abs(x) - length), y) - radius);
    if (inside <= 0) return null;
    const round = y / radius;
    const streak = noise(x * 5, y * 30, seed, 3);
    const bark = mixRgb(BARK_DARK, BARK, smooth(0.8, -0.6, round) * (0.5 + streak * 0.9));
    const burn = smooth(0.42, 0, Math.abs(x)) * (0.45 + noise(x * 9, y * 14, seed + 3, 3) * 0.8);
    const charred = mixRgb(bark, CHAR, clamp(burn * 1.2));
    const glowing = mixRgb(charred, EMBER, smooth(0.62, 0.86, burn * smooth(1, 0.1, round)));
    const end = smooth(radius * 0.72, radius * 0.5, Math.hypot(Math.abs(x) - length, y));
    return [...mixRgb(glowing, CUT, end), inside];
  });
}

/** Two logs crossed on the ground, burnt in the middle. */
export function logs(): Picture {
  const picture = new Picture(192);
  picture.paint((x, y) => [0.05, 0.04, 0.05, 0.42 * (1 - smooth(0.5, 1, Math.hypot(x / 0.92, (y - 0.74) / 0.16)))]);
  log(picture, 0.2, 0.62, 0.62, 0.095, 4);
  log(picture, -0.22, 0.6, 0.66, 0.1, 8);
  log(picture, 0.03, 0.72, 0.56, 0.1, 12);
  return picture;
}
