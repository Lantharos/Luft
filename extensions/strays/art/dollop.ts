import { type Canvas, type Color, framesOf } from './canvas.js';

const INK: Color = [36, 52, 58];
const JELLY: Color = [122, 214, 170];
const DEEP: Color = [82, 176, 146];
const SHINE: Color = [214, 248, 226];
const CHEEK: Color = [244, 160, 150];
const SPROUT: Color = [230, 196, 92];

type Eyes = 'open' | 'closed' | 'up' | 'back' | 'wide';

function sprout(canvas: Canvas, x: number, top: number, droop: number): void {
  canvas.rect(x, top, 1, 3, SPROUT);
  canvas.rect(x + 1 - droop * 2, top - 1 + droop, 2, 1, SPROUT);
  canvas.rect(x - 1 + droop, top + droop, 1, 1, SPROUT);
}

function face(canvas: Canvas, x: number, y: number, eyes: Eyes): void {
  if (eyes === 'closed') {
    canvas.rect(x - 3, y, 2, 1, INK);
    canvas.rect(x + 2, y, 2, 1, INK);
  } else if (eyes === 'wide') {
    canvas.rect(x - 3, y - 1, 2, 2, INK);
    canvas.rect(x + 2, y - 1, 2, 2, INK);
  } else {
    const [shift, lift] = eyes === 'back' ? [-2, 0] : eyes === 'up' ? [1, 1] : [1, 0];
    canvas.rect(x - 3 + shift, y - 1 - lift, 1, 2, INK);
    canvas.rect(x + 2 + shift, y - 1 - lift, 1, 2, INK);
  }
  canvas.rect(x - 4, y + 2, 2, 1, CHEEK);
  canvas.rect(x + 3, y + 2, 2, 1, CHEEK);
}

/** The blob as a dome on the ground: wider and lower as it squashes, with its bulge leaning the way it goes. */
function blob(canvas: Canvas, width: number, height: number, lean: number, eyes: Eyes): void {
  const ground = 22;
  const middle = 12 + lean / 2;
  canvas.ellipse(middle, ground - height * 0.62, width * 0.92, height * 0.62, JELLY);
  canvas.ellipse(12, ground - height * 0.3, width, height * 0.32, JELLY);
  canvas.ellipse(12, ground - 1, width * 0.86, 1.4, DEEP);
  canvas.dot(middle - width * 0.5, ground - height * 0.8, SHINE);
  canvas.rect(Math.round(middle - width * 0.6), ground - Math.round(height * 0.7), 2, 1, SHINE);
  sprout(canvas, Math.round(middle), ground - height - 2, 0);
  face(canvas, Math.round(middle + lean / 2), ground - Math.round(height * 0.5), eyes);
}

function sleep(canvas: Canvas, breath: number): void {
  const ground = 22;
  canvas.ellipse(12, ground - 3.4 - breath / 2, 9, 3.4 + breath / 2, JELLY);
  canvas.ellipse(12, ground - 1, 8.4, 1.4, DEEP);
  canvas.rect(7, ground - 5 - breath, 2, 1, SHINE);
  sprout(canvas, 12, ground - 9 - breath, 1);
  face(canvas, 12, ground - 3, 'closed');
}

function fall(canvas: Canvas, stretch: number, eyes: Eyes): void {
  canvas.ellipse(12, 11, 6 - stretch / 2, 6 + stretch, JELLY);
  canvas.ellipse(12, 15 + stretch, 4.4 - stretch / 2, 1.4, DEEP);
  canvas.rect(8, 7 - stretch, 2, 1, SHINE);
  sprout(canvas, 12, 2 - stretch, 1);
  face(canvas, 12, 10, eyes);
}

function climb(canvas: Canvas, reach: number): void {
  canvas.ellipse(15, 11, 4.4, 8 - reach, JELLY);
  canvas.ellipse(13, 15, 4, 4 + reach, JELLY);
  canvas.ellipse(18, 7 + reach * 2, 2, 2.4, DEEP);
  canvas.ellipse(18, 15 - reach, 2, 2.4, DEEP);
  canvas.rect(12, 6 + reach, 2, 1, SHINE);
  sprout(canvas, 13, 1 + reach, 1);
  face(canvas, 15, 9, 'up');
}

function held(canvas: Canvas, sway: number): void {
  canvas.ellipse(12, 6, 3, 3, JELLY);
  canvas.ellipse(12 + sway, 13, 5.4, 6, JELLY);
  canvas.ellipse(12 + sway * 2, 19, 5, 3, JELLY);
  canvas.ellipse(12 + sway * 2, 21, 3.4, 1.2, DEEP);
  sprout(canvas, 12, 0, 1);
  canvas.rect(9, 8, 2, 1, SHINE);
  face(canvas, 12 + sway, 13, 'wide');
}

const paints: ((canvas: Canvas) => void)[] = [
  canvas => blob(canvas, 8, 12, 0, 'open'),
  canvas => blob(canvas, 8, 12, 0, 'closed'),
  canvas => blob(canvas, 8, 13, 0, 'up'),
  canvas => blob(canvas, 8, 12, -1, 'back'),

  canvas => blob(canvas, 9, 10, 2, 'open'),
  canvas => blob(canvas, 8, 12, 3, 'open'),
  canvas => blob(canvas, 7, 14, 2, 'open'),
  canvas => blob(canvas, 8, 12, 0, 'open'),

  canvas => blob(canvas, 9, 10, 0, 'open'),
  canvas => blob(canvas, 9, 9, 0, 'open'),
  () => {},
  () => {},

  canvas => sleep(canvas, 2),
  canvas => sleep(canvas, 0),
  () => {},
  () => {},

  canvas => fall(canvas, 0, 'wide'),
  canvas => fall(canvas, 1, 'wide'),
  canvas => fall(canvas, 2, 'wide'),
  canvas => blob(canvas, 10, 6, 0, 'closed'),

  canvas => climb(canvas, 0),
  canvas => climb(canvas, 1),
  canvas => climb(canvas, 2),
  canvas => climb(canvas, 1),

  canvas => held(canvas, 0),
  canvas => held(canvas, 1),
  canvas => held(canvas, 0),
  canvas => held(canvas, -1),
];

/** Dollop, a soft green blob with a small sprout on top, as frames row by row. */
export const dollopFrames = () => framesOf(paints, INK);
