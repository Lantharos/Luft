import { clamp, mix, mixRgb, noise, Picture, type Rgb, smooth } from './picture.js';

const LIGHT: Rgb = [0.98, 0.97, 0.97];
const SOFT: Rgb = [0.88, 0.9, 0.95];
const UNDER: Rgb = [0.62, 0.67, 0.78];

/** One puff of a cloud: rounded on top, thinner at the base, with wisps at its edge. */
export function puff(seed: number): Picture {
  const blobs = Array.from({ length: 6 }, (_, index) => {
    const angle = index / 6 * Math.PI * 2 + seed;
    const reach = 0.42 + 0.1 * Math.sin(seed * 3 + index * 2.1);
    return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach * 0.62 + 0.04, radius: 0.42 + 0.07 * Math.cos(seed + index * 1.7) };
  });
  return new Picture(256).paint((x, y) => {
    const warpX = x + (noise(x * 2.4 + 3, y * 2.4, seed) - 0.5) * 0.42;
    const warpY = y + (noise(x * 2.4, y * 2.4 + 7, seed + 2) - 0.5) * 0.42;
    let field = 0;
    for (const blob of blobs) field += Math.exp(-((warpX - blob.x) ** 2 + (warpY - blob.y) ** 2) / (blob.radius ** 2 * 0.62));
    const body = smooth(0.42, 1.25, field);
    const fade = smooth(1, 0.8, Math.hypot(x, y));
    const alpha = body * fade * (0.62 + 0.38 * noise(x * 4, y * 4, seed + 5, 3));
    const lit = clamp(0.7 - warpY * 0.8 + (noise(x * 3.3, y * 3.3, seed + 9) - 0.5) * 0.7);
    const color = lit > 0.5 ? mixRgb(SOFT, LIGHT, smooth(0.5, 0.92, lit)) : mixRgb(UNDER, SOFT, smooth(0.08, 0.5, lit));
    return [color[0], color[1], color[2], mix(0, 0.96, alpha)];
  });
}

export const puffs = () => [1, 2.3, 3.7, 5.1, 6.4, 7.8].map(puff);
