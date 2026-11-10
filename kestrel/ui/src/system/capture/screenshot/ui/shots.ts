import type Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';

import { captureScreenshot, type CursorCapture } from '../capture.js';
import type { Finished } from '../markup/markupEditor.js';
import type { Shot } from '../markup/shot.js';
import type { Geometry } from '../selection/areaCursor.js';
import type { UIWindowSelectorWindow } from '../selection/windowSelector.js';

export function areaShot(content: Clutter.TextureContent, area: Geometry, scale: number, cursor: CursorCapture): Shot {
  return {
    texture: content.get_texture(),
    area: area.map(value => value * scale) as Geometry,
    scale,
    cursor,
    placement: area,
  };
}

export function windowShot(window: UIWindowSelectorWindow, showCursor: boolean, cursorScale: number): Shot | null {
  const texture = window.windowContent?.get_texture();
  if (!texture) return null;
  const scale = window.bufferScale;
  const { x, y } = window.bufferRect;
  return {
    texture,
    area: null,
    scale,
    cursor: {
      texture: showCursor ? window.getCursorTexture()?.get_texture() ?? null : null,
      x: window.cursorPoint.x * scale,
      y: window.cursorPoint.y * scale,
      scale: cursorScale,
    },
    placement: [x, y, texture.get_width() / scale, texture.get_height() / scale],
  };
}

export async function saveShot({ texture, area, scale, cursor }: Shot, finished: Finished | null = null): Promise<Gio.File | null> {
  try {
    return await captureScreenshot(texture, finished?.area ?? area, scale, cursor, finished?.markup ?? null);
  } catch (e) {
    logError(e as object, 'Error capturing screenshot');
    return null;
  }
}
