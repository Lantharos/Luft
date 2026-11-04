import { CELL, COLUMNS, ROWS, type Color } from './canvas.js';

const SCALE = 10;
const GUTTER = 7 * 8 * 2 + 16;
const PAPER: Color = [250, 247, 240];
const LINE: Color = [176, 168, 154];
const GROUND: Color = [200, 96, 60];
const INK: Color = [50, 44, 40];
const LETTER_ZOOM = 2;

const LETTERS: Record<string, readonly string[]> = {
  A: ['###', '# #', '###', '# #', '# #'],
  B: ['## ', '# #', '## ', '# #', '## '],
  C: ['###', '#  ', '#  ', '#  ', '###'],
  D: ['## ', '# #', '# #', '# #', '## '],
  E: ['###', '#  ', '## ', '#  ', '###'],
  F: ['###', '#  ', '## ', '#  ', '#  '],
  G: ['###', '#  ', '# #', '# #', '###'],
  H: ['# #', '# #', '###', '# #', '# #'],
  I: ['###', ' # ', ' # ', ' # ', '###'],
  K: ['# #', '# #', '## ', '# #', '# #'],
  L: ['#  ', '#  ', '#  ', '#  ', '###'],
  M: ['# #', '###', '###', '# #', '# #'],
  N: ['## ', '# #', '# #', '# #', '# #'],
  O: ['###', '# #', '# #', '# #', '###'],
  P: ['###', '# #', '###', '#  ', '#  '],
  R: ['## ', '# #', '## ', '# #', '# #'],
  S: ['###', '#  ', '###', '  #', '###'],
  T: ['###', ' # ', ' # ', ' # ', ' # '],
  U: ['# #', '# #', '# #', '# #', '###'],
  W: ['# #', '# #', '###', '###', '# #'],
  Y: ['# #', '# #', ' # ', ' # ', ' # '],
};

const ROW_LABELS = ['IDLE', 'WALK', 'SIT', 'SLEEP', 'FALL LAND', 'CLIMB', 'HELD'];
const ROW_NOTES = ['STAND LOOK', 'LOOP', 'DOWN STAY', 'DOWN STAY', 'LOOP', 'LOOP WALL RIGHT', 'LOOP'];

class Page {
  readonly rgba: Uint8Array;

  constructor(readonly width: number, readonly height: number) {
    this.rgba = new Uint8Array(width * height * 4);
    this.rect(0, 0, width, height, PAPER);
  }

  rect(x: number, y: number, width: number, height: number, color: Color): void {
    for (let row = y; row < y + height; row++) {
      for (let column = x; column < x + width; column++) this.rgba.set([...color, 255], (row * this.width + column) * 4);
    }
  }

  text(x: number, y: number, words: string, color: Color): void {
    [...words].forEach((letter, index) => (LETTERS[letter] ?? []).forEach((line, down) => [...line].forEach((mark, across) => {
      if (mark === '#') this.rect(x + (index * 4 + across) * LETTER_ZOOM, y + down * LETTER_ZOOM, LETTER_ZOOM, LETTER_ZOOM, color);
    })));
  }
}

/** The sheet's grid enlarged, with what goes in each row and where the ground is, to draw beside or over. */
export function guidePicture(): { rgba: Uint8Array; width: number; height: number } {
  const size = CELL * SCALE;
  const page = new Page(GUTTER + COLUMNS * size + 1, ROWS * size + 1);
  for (let row = 0; row <= ROWS; row++) page.rect(GUTTER, row * size, COLUMNS * size + 1, 1, LINE);
  for (let column = 0; column <= COLUMNS; column++) page.rect(GUTTER + column * size, 0, 1, ROWS * size + 1, LINE);
  for (let row = 0; row < ROWS; row++) {
    page.rect(GUTTER, (row + 1) * size - SCALE, COLUMNS * size, 1, GROUND);
    page.text(8, row * size + 16, ROW_LABELS[row], INK);
    page.text(8, row * size + 36, ROW_NOTES[row], LINE);
  }
  page.text(8, 76, 'FEET ON RED', GROUND);
  return { rgba: page.rgba, width: page.width, height: page.height };
}
