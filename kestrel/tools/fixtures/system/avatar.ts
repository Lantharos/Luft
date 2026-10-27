import Cairo from 'cairo';

const SIZE = 256;

export type Color = [number, number, number];

export function drawAvatar(path: string, color: Color) {
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, SIZE, SIZE);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(...color);
  context.paint();
  context.setSourceRGB(1, 1, 1);
  context.arc(SIZE / 2, SIZE * 0.4, SIZE * 0.18, 0, 2 * Math.PI);
  context.fill();
  context.arc(SIZE / 2, SIZE * 1.02, SIZE * 0.38, 0, 2 * Math.PI);
  context.fill();
  surface.writeToPNG(path);
}
