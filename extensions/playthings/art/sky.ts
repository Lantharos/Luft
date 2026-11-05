import { mixRgb, Picture, type Rgb, smooth } from './picture.js';

const round = (red: number, green: number, blue: number, spread: number, size = 128) => new Picture(size).paint((x, y) => {
  const reach = Math.hypot(x, y);
  return [red, green, blue, (1 - smooth(0, 1, reach)) ** spread];
});

/** Soft light around a lantern or a fire. */
export const glows = (): Picture[] => [
  round(1, 0.66, 0.26, 2.2),
  round(1, 0.42, 0.28, 2.2),
  round(0.42, 0.92, 0.7, 2.2),
  round(1, 0.44, 0.12, 2),
  round(0.72, 0.8, 1, 2.6),
];

/** A soft ring, around what can be moved while people arrange things. */
export const ring = () => new Picture(128).paint((x, y) => {
  const reach = Math.hypot(x, y);
  return [1, 1, 1, smooth(0.8, 0.9, reach) * smooth(0.98, 0.92, reach) * 0.85 + (1 - smooth(0, 0.9, reach)) * 0.1];
});

function glint(warm: Rgb, points: number): Picture {
  return new Picture(64).paint((x, y) => {
    const reach = Math.hypot(x, y);
    const angle = Math.atan2(y, x);
    const rays = Math.abs(Math.cos(angle * points / 2)) ** 14;
    const halo = (1 - smooth(0, 0.92, reach)) ** 3 * 0.55;
    const core = 1 - smooth(0.05, 0.2, reach);
    const beam = rays * (1 - smooth(0.05, 0.86, reach)) ** 2;
    const alpha = Math.min(1, halo + core + beam);
    return [...mixRgb(warm, [1, 1, 1], core + beam * 0.6), alpha];
  });
}

export const stars = (): Picture[] => [glint([0.72, 0.82, 1], 4), glint([1, 0.86, 0.66], 4), glint([0.82, 0.88, 1], 6)];

/** A small things sheet: a spark, a raindrop, the cord of a lantern and a line between stars. */
export function small(): Picture[] {
  const spark = new Picture(32).paint((x, y) => {
    const reach = Math.hypot(x, y);
    return [...mixRgb([1, 0.45, 0.1], [1, 0.93, 0.66], 1 - smooth(0.1, 0.5, reach)), (1 - smooth(0.1, 0.92, reach)) ** 1.5];
  });
  const drop = new Picture(32).paint((x, y) => {
    const width = 0.07 + 0.09 * smooth(-1, 0.7, y);
    return [0.46, 0.62, 0.9, (1 - smooth(width * 0.5, width, Math.abs(x))) * smooth(-1, -0.2, y) * smooth(0.96, 0.8, y) * 0.9];
  });
  const cord = new Picture(32).paint(x => [0.62, 0.52, 0.42, 1 - smooth(0.06, 0.14, Math.abs(x))]);
  const line = new Picture(32).paint((_x, y) => [0.82, 0.88, 1, (1 - smooth(0.03, 0.12, Math.abs(y))) * 0.9]);
  return [spark, drop, cord, line];
}

/** A shooting star, flying right, its head at the right edge of the frame. */
export const comet = () => [new Picture(128).paint((x, y) => {
  const along = (x + 1) / 2;
  const width = 0.02 + along ** 3 * 0.075;
  const tail = (1 - smooth(width * 0.3, width, Math.abs(y))) * along ** 2.2;
  const head = (1 - smooth(0.02, 0.2, Math.hypot(x - 0.84, y))) ** 1.4;
  const alpha = Math.min(1, tail * 0.9 + head);
  return [...mixRgb([0.62, 0.76, 1], [1, 1, 1], Math.min(1, along ** 2 + head)), alpha];
})];
