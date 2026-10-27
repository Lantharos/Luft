import Gly from 'gi://Gly';

import type { Rgb } from '../../../appearance/color.js';

const SAMPLE_GRID = 48;

export interface FrameData {
  width: number;
  height: number;
  stride: number;
  format: Gly.MemoryFormat;
}

export const EIGHT_BIT_CHANNELS = new Map<Gly.MemoryFormat, [red: number, green: number, blue: number, bytesPerPixel: number]>([
  [Gly.MemoryFormat.B8G8R8A8_PREMULTIPLIED, [2, 1, 0, 4]],
  [Gly.MemoryFormat.A8R8G8B8_PREMULTIPLIED, [1, 2, 3, 4]],
  [Gly.MemoryFormat.R8G8B8A8_PREMULTIPLIED, [0, 1, 2, 4]],
  [Gly.MemoryFormat.B8G8R8A8, [2, 1, 0, 4]],
  [Gly.MemoryFormat.A8R8G8B8, [1, 2, 3, 4]],
  [Gly.MemoryFormat.R8G8B8A8, [0, 1, 2, 4]],
  [Gly.MemoryFormat.A8B8G8R8, [3, 2, 1, 4]],
  [Gly.MemoryFormat.R8G8B8, [0, 1, 2, 3]],
  [Gly.MemoryFormat.B8G8R8, [2, 1, 0, 3]],
]);

export function sampleColors({ width, height, stride, format }: FrameData, data: Uint8Array): Rgb[] {
  const channels = EIGHT_BIT_CHANNELS.get(format);
  if (!channels) return [];

  const [red, green, blue, bytesPerPixel] = channels;
  const samples: Rgb[] = [];
  for (let row = 0; row < SAMPLE_GRID; row++) {
    const y = Math.floor((row + 0.5) * height / SAMPLE_GRID);
    for (let column = 0; column < SAMPLE_GRID; column++) {
      const offset = y * stride + Math.floor((column + 0.5) * width / SAMPLE_GRID) * bytesPerPixel;
      samples.push([data[offset + red], data[offset + green], data[offset + blue]]);
    }
  }
  return samples;
}

export function packSamples(samples: Rgb[]): Uint8Array {
  return Uint8Array.from(samples.flat());
}

export function unpackSamples(metadata: Uint8Array): Rgb[] {
  const samples: Rgb[] = [];
  for (let i = 0; i + 2 < metadata.length; i += 3)
    samples.push([metadata[i], metadata[i + 1], metadata[i + 2]]);
  return samples;
}
