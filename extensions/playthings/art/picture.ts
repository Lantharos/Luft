import { deflateSync } from 'node:zlib';

export type Rgb = readonly [red: number, green: number, blue: number];
export type Ink = readonly [red: number, green: number, blue: number, alpha: number];

export const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
export const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
export const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => [mix(from[0], to[0], amount), mix(from[1], to[1], amount), mix(from[2], to[2], amount)];
export const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

/** A square picture of premultiplied colour, painted with soft shapes given as functions of where each pixel is, from -1 to 1. */
export class Picture {
  readonly pixels: Float32Array;

  constructor(readonly size: number) {
    this.pixels = new Float32Array(size * size * 4);
  }

  paint(ink: (x: number, y: number) => Ink | null): this {
    const { size, pixels } = this;
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const painted = ink((column + 0.5) / size * 2 - 1, (row + 0.5) / size * 2 - 1);
        if (!painted || painted[3] <= 0) continue;
        const [red, green, blue, alpha] = painted;
        const at = (row * size + column) * 4;
        const under = 1 - alpha;
        pixels[at] = red * alpha + pixels[at] * under;
        pixels[at + 1] = green * alpha + pixels[at + 1] * under;
        pixels[at + 2] = blue * alpha + pixels[at + 2] * under;
        pixels[at + 3] = alpha + pixels[at + 3] * under;
      }
    }
    return this;
  }

  /** Lays another picture over this one, with where its middle goes, how big it is and how far it's turned. */
  stamp(other: Picture, centerX = 0, centerY = 0, scale = 1, turn = 0, strength = 1): this {
    const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
    return this.paint((x, y) => {
      const [dx, dy] = [(x - centerX) / scale, (y - centerY) / scale];
      const [u, v] = [dx * cos + dy * sin, -dx * sin + dy * cos];
      if (Math.abs(u) >= 1 || Math.abs(v) >= 1) return null;
      const [red, green, blue, alpha] = other.sample(u, v);
      return alpha ? [red / alpha, green / alpha, blue / alpha, alpha * strength] : null;
    });
  }

  private sample(x: number, y: number): Ink {
    const { size, pixels } = this;
    const [u, v] = [(x + 1) / 2 * size - 0.5, (y + 1) / 2 * size - 0.5];
    const [left, top] = [clamp(Math.floor(u), 0, size - 2), clamp(Math.floor(v), 0, size - 2)];
    const [across, down] = [clamp(u - left), clamp(v - top)];
    const at = (column: number, row: number, channel: number) => pixels[(row * size + column) * 4 + channel];
    const channel = (index: number) => mix(mix(at(left, top, index), at(left + 1, top, index), across), mix(at(left, top + 1, index), at(left + 1, top + 1, index), across), down);
    return [channel(0), channel(1), channel(2), channel(3)];
  }
}

function crc32(bytes: Uint8Array): number {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(name: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(name), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** Lays pictures out in a grid, row by row, as a PNG with straight alpha. */
export function sheet(pictures: readonly Picture[], columns: number): Uint8Array {
  const { size } = pictures[0];
  const rows = Math.ceil(pictures.length / columns);
  const [width, height] = [columns * size, rows * size];
  const raw = new Uint8Array((width * 4 + 1) * height);
  pictures.forEach(({ pixels }, index) => {
    const [offsetX, offsetY] = [index % columns * size, Math.floor(index / columns) * size];
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const from = (row * size + column) * 4;
        const to = (offsetY + row) * (width * 4 + 1) + 1 + (offsetX + column) * 4;
        const alpha = pixels[from + 3];
        for (let channel = 0; channel < 3; channel++) raw[to + channel] = alpha ? Math.round(clamp(pixels[from + channel] / alpha) * 255) : 0;
        raw[to + 3] = Math.round(clamp(alpha) * 255);
      }
    }
  });
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header.set([8, 6, 0, 0, 0], 8);
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}

function lattice(x: number, y: number, seed: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function valueNoise(x: number, y: number, seed: number): number {
  const [left, top] = [Math.floor(x), Math.floor(y)];
  const [across, down] = [smooth(0, 1, x - left), smooth(0, 1, y - top)];
  return mix(mix(lattice(left, top, seed), lattice(left + 1, top, seed), across), mix(lattice(left, top + 1, seed), lattice(left + 1, top + 1, seed), across), down);
}

/** Layered noise from 0 to 1, soft and blotchy like cloud or smoke. */
export function noise(x: number, y: number, seed: number, layers = 4): number {
  let [sum, weight, total] = [0, 0.5, 0];
  for (let layer = 0; layer < layers; layer++) {
    sum += valueNoise(x, y, seed + layer * 13) * weight;
    total += weight;
    weight /= 2;
    x *= 2.03;
    y *= 2.03;
  }
  return sum / total;
}
