import Cairo from 'cairo';

import {type Color, drawAvatar} from '../system/avatar.js';

const [directory] = ARGV;

type Blob = [number, number, number, number, number, number];

const WALLPAPERS: Record<string, [Color, Blob[]]> = {
  sam: [[0.07, 0.09, 0.16], [[0.30, 0.42, 0.92, 0.3, 0.35, 0.5], [0.55, 0.25, 0.75, 0.75, 0.7, 0.45]]],
  mara: [[0.16, 0.08, 0.05], [[0.95, 0.55, 0.25, 0.25, 0.3, 0.5], [0.85, 0.30, 0.35, 0.7, 0.75, 0.45]]],
  theo: [[0.05, 0.12, 0.09], [[0.25, 0.75, 0.55, 0.35, 0.4, 0.55], [0.15, 0.45, 0.35, 0.8, 0.7, 0.4]]],
};

const AVATARS: Record<string, Color> = {
  mara: [0.93, 0.56, 0.32],
};

function wallpaper(name: string, [background, blobs]: [Color, Blob[]]) {
  const [width, height] = [1920, 1080];
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, width, height);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(...background);
  context.paint();
  for (const [red, green, blue, x, y, radius] of blobs) {
    context.setSourceRGB(red, green, blue);
    context.arc(x * width, y * height, radius * height, 0, 2 * Math.PI);
    context.fill();
  }
  surface.writeToPNG(`${directory}/${name}-wallpaper.png`);
}

for (const [name, spec] of Object.entries(WALLPAPERS)) wallpaper(name, spec);
for (const [name, color] of Object.entries(AVATARS)) drawAvatar(`${directory}/${name}-avatar.png`, color);
