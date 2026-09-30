import Cairo from 'cairo';

const [directory] = ARGV;

const WALLPAPERS = {
  kristof: [[0.07, 0.09, 0.16], [[0.30, 0.42, 0.92, 0.3, 0.35, 0.5], [0.55, 0.25, 0.75, 0.75, 0.7, 0.45]]],
  ayesha: [[0.16, 0.08, 0.05], [[0.95, 0.55, 0.25, 0.25, 0.3, 0.5], [0.85, 0.30, 0.35, 0.7, 0.75, 0.45]]],
  sam: [[0.05, 0.12, 0.09], [[0.25, 0.75, 0.55, 0.35, 0.4, 0.55], [0.15, 0.45, 0.35, 0.8, 0.7, 0.4]]],
};

const AVATARS = {
  kristof: [0.36, 0.48, 0.92],
  ayesha: [0.93, 0.56, 0.32],
};

function wallpaper(name, [background, blobs]) {
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

function avatar(name, color) {
  const size = 256;
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, size, size);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(...color);
  context.paint();
  context.setSourceRGB(1, 1, 1);
  context.arc(size / 2, size * 0.4, size * 0.18, 0, 2 * Math.PI);
  context.fill();
  context.arc(size / 2, size * 1.02, size * 0.38, 0, 2 * Math.PI);
  context.fill();
  surface.writeToPNG(`${directory}/${name}-avatar.png`);
}

for (const [name, spec] of Object.entries(WALLPAPERS)) wallpaper(name, spec);
for (const [name, color] of Object.entries(AVATARS)) avatar(name, color);
