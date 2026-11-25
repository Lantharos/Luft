import { chromaOf, type Rgb } from '../color.js';
import { softKnee } from '../../shared/math.js';

const BLOCK = 3;
const KNEE = 0.035;
const CEILING = 0.04;

function blockChroma(samples: Rgb[], grid: number, row: number, column: number): number {
  const mean: Rgb = [0, 0, 0];
  for (let y = row * BLOCK; y < (row + 1) * BLOCK; y++)
    for (let x = column * BLOCK; x < (column + 1) * BLOCK; x++)
      samples[y * grid + x].forEach((channel, index) => mean[index] += channel / BLOCK ** 2);
  return chromaOf(mean);
}

export function castScale(samples: Rgb[]): number {
  const grid = Math.round(Math.sqrt(samples.length));
  const blocks = Math.floor(grid / BLOCK);
  let chroma = 0;
  for (let row = 0; row < blocks; row++)
    for (let column = 0; column < blocks; column++) chroma += blockChroma(samples, grid, row, column);
  const cast = chroma / Math.max(1, blocks ** 2);
  return cast <= KNEE ? 1 : softKnee(cast, KNEE, CEILING) / cast;
}
