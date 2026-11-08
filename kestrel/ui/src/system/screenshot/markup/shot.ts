import type Cogl from 'gi://Cogl';
import Mtk from 'gi://Mtk';
import Clutter from 'gi://Clutter';

import type { CursorCapture } from '../capture.js';
import type { Geometry } from '../selection/areaCursor.js';

/**
 * A capture before it's saved: the part of a texture it takes, how many of
 * the texture's pixels make one of the stage's, and where it sits on the stage.
 */
export interface Shot {
  texture: Cogl.Texture;
  area: Geometry | null;
  scale: number;
  cursor: CursorCapture;
  placement: Geometry;
}

function textureArea({ texture, area }: Shot): Geometry {
  return area ?? [0, 0, texture.get_width(), texture.get_height()];
}

export function shotContent(shot: Shot): Clutter.Content {
  const [x, y, width, height] = textureArea(shot);
  return Clutter.TextureContent.new_from_texture(shot.texture, new Mtk.Rectangle({ x, y, width, height }));
}

/** The texture pixels under part of the shot, given in stage pixels from its corner. */
export function croppedArea(shot: Shot, [x, y, width, height]: Geometry): Geometry {
  const [left, top] = textureArea(shot);
  const { scale } = shot;
  return [
    Math.round(left + x * scale),
    Math.round(top + y * scale),
    Math.max(1, Math.round(width * scale)),
    Math.max(1, Math.round(height * scale)),
  ];
}
