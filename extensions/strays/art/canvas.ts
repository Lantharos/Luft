import { deflateSync } from 'node:zlib';

export const CELL = 24;
export const COLUMNS = 4;
export const ROWS = 7;

export type Color = readonly [red: number, green: number, blue: number];

/** One frame of a sprite, painted with whole pixels. */
export class Canvas {
  readonly pixels: (Color | null)[] = new Array(CELL * CELL).fill(null);

  dot(x: number, y: number, color: Color | null): void {
    const [column, row] = [Math.round(x), Math.round(y)];
    if (column >= 0 && column < CELL && row >= 0 && row < CELL) this.pixels[row * CELL + column] = color;
  }

  /** Writes rows of a pixel map, where each character is looked up in `colors` and a space leaves what's there. */
  map(x: number, y: number, rows: readonly string[], colors: Readonly<Record<string, Color>>): void {
    rows.forEach((row, down) => [...row].forEach((key, across) => {
      if (key !== ' ') this.dot(x + across, y + down, colors[key]);
    }));
  }

  ellipse(centerX: number, centerY: number, radiusX: number, radiusY: number, color: Color): void {
    for (let y = Math.floor(centerY - radiusY); y <= Math.ceil(centerY + radiusY); y++) {
      for (let x = Math.floor(centerX - radiusX); x <= Math.ceil(centerX + radiusX); x++) {
        if (((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2 <= 1) this.dot(x, y, color);
      }
    }
  }

  rect(x: number, y: number, width: number, height: number, color: Color): void {
    for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) this.dot(column, row, color);
  }

  /** Recolours what's painted so far inside an ellipse, for soft shading that follows the shape. */
  shade(centerX: number, centerY: number, radiusX: number, radiusY: number, from: Color, to: Color): void {
    this.pixels.forEach((color, index) => {
      const [x, y] = [index % CELL, Math.floor(index / CELL)];
      if (color === from && ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2 <= 1) this.pixels[index] = to;
    });
  }

  /** Puts a dark line around everything painted so far, so the shape reads on any wallpaper. */
  outline(color: Color): void {
    const painted = [...this.pixels];
    const at = (x: number, y: number) => x >= 0 && x < CELL && y >= 0 && y < CELL && painted[y * CELL + x] !== null;
    painted.forEach((pixel, index) => {
      const [x, y] = [index % CELL, Math.floor(index / CELL)];
      if (pixel === null && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) this.pixels[index] = color;
    });
  }
}

/** Paints each frame and puts the outline around it. */
export function framesOf(paints: readonly ((canvas: Canvas) => void)[], outline: Color): Canvas[] {
  return paints.map(paint => {
    const canvas = new Canvas();
    paint(canvas);
    canvas.outline(outline);
    return canvas;
  });
}

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return ~crc >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const typed = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const framed = Buffer.alloc(typed.length + 8);
  framed.writeUInt32BE(data.length, 0);
  typed.copy(framed, 4);
  framed.writeUInt32BE(crc32(typed), typed.length + 4);
  return framed;
}

/** Encodes RGBA pixels as a PNG, with no text or dates in it, so the same art always makes the same file. */
export function encodePng(rgba: Uint8Array, width: number, height: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const lines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) lines.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(lines, { level: 9 })),
    chunk('IEND', new Uint8Array()),
  ]);
}

/** Lays out frames, row by row, as one sprite sheet, and writes the sheet's pixels. */
export function sheetPixels(frames: readonly Canvas[], zoom = 1): { rgba: Uint8Array; width: number; height: number } {
  const width = COLUMNS * CELL * zoom;
  const height = ROWS * CELL * zoom;
  const rgba = new Uint8Array(width * height * 4);
  frames.forEach((frame, index) => {
    const [left, top] = [(index % COLUMNS) * CELL * zoom, Math.floor(index / COLUMNS) * CELL * zoom];
    frame.pixels.forEach((color, pixel) => {
      if (!color) return;
      const [x, y] = [pixel % CELL, Math.floor(pixel / CELL)];
      for (let down = 0; down < zoom; down++) {
        for (let across = 0; across < zoom; across++) {
          rgba.set([...color, 255], ((top + y * zoom + down) * width + left + x * zoom + across) * 4);
        }
      }
    });
  });
  return { rgba, width, height };
}
