import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { SpriteSheet, SpriteSheetOptions } from '../../types.js';

interface FrameFraction {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Mirrored {
  images: readonly [St.ImageContent, St.ImageContent];
  covered: readonly [readonly FrameFraction[], readonly FrameFraction[]];
}

const VISIBLE_ALPHA = 32;
const COVERED_BANDS = 8;

function coveredBy(pixels: Uint8Array, cell: number): FrameFraction[] {
  const bands = Math.min(COVERED_BANDS, cell);
  return Array.from({ length: bands }, (_, band): FrameFraction | null => {
    const [from, to] = [Math.floor(band * cell / bands), Math.floor((band + 1) * cell / bands)];
    let [left, right] = [cell, 0];
    for (let y = from; y < to; y++) {
      for (let x = 0; x < cell; x++) {
        if (pixels[(y * cell + x) * 4 + 3] < VISIBLE_ALPHA) continue;
        left = Math.min(left, x);
        right = Math.max(right, x + 1);
      }
    }
    return left < right ? { left: left / cell, top: from / cell, right: right / cell, bottom: to / cell } : null;
  }).filter(box => box !== null);
}

export const SpriteActor = GObject.registerClass(class ExtensionSprite extends Clutter.Actor {
  covered: readonly FrameFraction[] = [];

  vfunc_pick(context: Clutter.PickContext): void {
    if (!this.should_pick(context)) return;
    const { width, height } = this;
    for (const { left, top, right, bottom } of this.covered) {
      this.pick_box(context, new Clutter.ActorBox({ x1: left * width, y1: top * height, x2: right * width, y2: bottom * height }));
    }
  }
});

function content(context: Cogl.Context, pixels: Uint8Array, cell: number): St.ImageContent {
  const image = St.ImageContent.new_with_preferred_size(cell, cell) as St.ImageContent;
  image.set_data(context, pixels, Cogl.PixelFormat.RGBA_8888, cell, cell, cell * 4);
  return image;
}

export function cutFrames({ path, cell, smooth }: SpriteSheetOptions): { sheet: SpriteSheet; frames: Mirrored[] } {
  const loaded = GdkPixbuf.Pixbuf.new_from_file(path);
  const picture = loaded.get_has_alpha() ? loaded : loaded.add_alpha(false, 0, 0, 0)!;
  const columns = picture.width / cell;
  const rows = picture.height / cell;
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) throw new Error(`${path} isn't a whole number of ${cell} pixel frames`);
  const context = global.stage.context.get_backend().get_cogl_context();
  const pixels = picture.get_pixels();
  const frames = Array.from({ length: columns * rows }, (_, index): Mirrored => {
    const start = Math.floor(index / columns) * cell * picture.rowstride + (index % columns) * cell * 4;
    const tight = new Uint8Array(cell * cell * 4);
    const mirrored = smooth ? tight : new Uint8Array(cell * cell * 4);
    for (let row = 0; row < cell; row++) {
      const from = start + row * picture.rowstride;
      tight.set(pixels.subarray(from, from + cell * 4), row * cell * 4);
      if (smooth) continue;
      for (let column = 0; column < cell; column++) {
        mirrored.set(pixels.subarray(from + column * 4, from + (column + 1) * 4), (row * cell + cell - 1 - column) * 4);
      }
    }
    const image = content(context, tight, cell);
    const covered = coveredBy(tight, cell);
    return smooth
      ? { images: [image, image], covered: [covered, covered] }
      : { images: [image, content(context, mirrored, cell)], covered: [covered, coveredBy(mirrored, cell)] };
  });
  return { sheet: Object.freeze({ columns, rows, cell }), frames };
}
