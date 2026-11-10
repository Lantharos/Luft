import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';

const ATLAS_CELL = 128;
const ATLAS_PICTURES = 8;
const COLUMNS = 8;
const MOST_FRAMES = 64;
const FRAMES_EACH = 16;
const SLOWEST_FRAME_MS = 1000;

export interface Atlas {
  texture: Cogl.Texture;
  grid: [number, number];
  pictures: number[];
  count: number;
}

interface Picture {
  frames: GdkPixbuf.Pixbuf[];
  rate: number;
}

function stillFrames(path: string): Picture {
  return { frames: [GdkPixbuf.Pixbuf.new_from_file_at_scale(path, ATLAS_CELL, ATLAS_CELL, true)], rate: 0 };
}

function animatedFrames(animation: GdkPixbuf.PixbufAnimation, limit: number): Picture {
  const start = new GLib.TimeVal();
  const iterator = animation.get_iter(start);
  const frames: GdkPixbuf.Pixbuf[] = [];
  let elapsed = 0;
  for (let index = 0; index < limit; index++) {
    const frame = iterator.get_pixbuf();
    const scale = ATLAS_CELL / Math.max(frame.width, frame.height);
    frames.push(frame.scale_simple(Math.max(1, Math.round(frame.width * scale)), Math.max(1, Math.round(frame.height * scale)), GdkPixbuf.InterpType.BILINEAR)!);
    const delay = iterator.get_delay_time();
    if (delay < 0) break;
    elapsed += Math.min(Math.max(delay, 20), SLOWEST_FRAME_MS);
    start.tv_sec = Math.floor(elapsed / 1000);
    start.tv_usec = (elapsed % 1000) * 1000;
    iterator.advance(start);
  }
  return { frames, rate: frames.length > 1 ? 1000 * frames.length / elapsed : 0 };
}

function load(path: string, limit: number): Picture {
  const animation = GdkPixbuf.PixbufAnimation.new_from_file(path);
  return animation && !animation.is_static_image() ? animatedFrames(animation, limit) : stillFrames(path);
}

export function packAtlas(paths: readonly string[]): Atlas {
  const pictures: Picture[] = [];
  let cells = 0;
  for (const path of paths.slice(0, ATLAS_PICTURES)) {
    const picture = load(path, Math.min(FRAMES_EACH, MOST_FRAMES - cells));
    pictures.push(picture);
    cells += picture.frames.length;
    if (cells >= MOST_FRAMES) break;
  }
  const columns = Math.max(1, Math.min(COLUMNS, cells));
  const rows = Math.max(1, Math.ceil(cells / columns));
  const sheet = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, columns * ATLAS_CELL, rows * ATLAS_CELL)!;
  sheet.fill(0);
  const described: number[] = [];
  let cell = 0;
  for (const { frames, rate } of pictures) {
    described.push(cell, frames.length, rate, frames[0].width / frames[0].height);
    for (const frame of frames) {
      const rgba = frame.get_has_alpha() ? frame : frame.add_alpha(false, 0, 0, 0)!;
      const x = (cell % columns) * ATLAS_CELL + Math.floor((ATLAS_CELL - rgba.width) / 2);
      const y = Math.floor(cell / columns) * ATLAS_CELL + Math.floor((ATLAS_CELL - rgba.height) / 2);
      rgba.copy_area(0, 0, rgba.width, rgba.height, sheet, x, y);
      cell++;
    }
  }
  const context = global.stage.context.get_backend().get_cogl_context();
  const texture = Cogl.Texture2D.new_from_data(context, sheet.width, sheet.height, Cogl.PixelFormat.RGBA_8888, sheet.rowstride, sheet.get_pixels());
  while (described.length < ATLAS_PICTURES * 4) described.push(0);
  return { texture, grid: [columns, rows], pictures: described, count: pictures.length };
}

export function atlasDeclarations(names: readonly string[]): string {
  return names.map(name => `uniform sampler2D ${name};
uniform vec2 ${name}_grid;
uniform float ${name}_count;
uniform vec4 ${name}_pictures[${ATLAS_PICTURES}];
`).join('');
}
