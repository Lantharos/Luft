import { describe, expect, test } from 'bun:test';

import { isNeutral, namedAccent, seedFromSamples, type Rgb } from './color.js';

const ROWS = 48;
const SKY: Rgb = [70, 130, 210];
const ROCK: Rgb = [128, 126, 122];
const MEADOW: Rgb = [90, 150, 60];
const SUNSET: Rgb = [235, 120, 50];

// A wallpaper sampled the way Kestrel samples it: a square grid, row by row from the top.
function wallpaper(colorAt: (depth: number) => Rgb): Rgb[] {
  const samples: Rgb[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let column = 0; column < ROWS; column++) samples.push(colorAt((row + 0.5) / ROWS));
  return samples;
}

describe('the accent follows the bottom of the wallpaper', () => {
  test('a blue sky over grey rock gives no accent', () => {
    expect(isNeutral(seedFromSamples(wallpaper(depth => depth < 0.45 ? SKY : ROCK)))).toBe(true);
  });

  test('a green meadow under a blue sky gives green', () => {
    expect(namedAccent(seedFromSamples(wallpaper(depth => depth < 0.5 ? SKY : MEADOW)))).toBe('green');
  });

  test('a sunset sky over blue water gives blue', () => {
    expect(namedAccent(seedFromSamples(wallpaper(depth => depth < 0.5 ? SUNSET : SKY)))).toBe('blue');
  });

  test('a wallpaper of one colour still gives that colour', () => {
    expect(namedAccent(seedFromSamples(wallpaper(() => SUNSET)))).toBe('orange');
  });

  test('a wallpaper the sampler cannot read gives no accent', () => {
    expect(isNeutral(seedFromSamples([]))).toBe(true);
  });
});
