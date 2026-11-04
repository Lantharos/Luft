import { type Canvas, type Color, framesOf } from './canvas.js';

const INK: Color = [38, 40, 62];
const FEATHER: Color = [92, 148, 200];
const WING: Color = [62, 106, 164];
const BELLY: Color = [248, 226, 190];
const CHEEK: Color = [244, 148, 132];
const BEAK: Color = [244, 186, 72];
const LEG: Color = [200, 120, 70];

type Eyes = 'open' | 'closed' | 'back';

interface Pose {
  y?: number;
  lean?: number;
  wing?: 'folded' | 'up' | 'down' | 'wide';
  eyes?: Eyes;
  legs?: readonly [number, number];
  legLength?: number;
  tail?: number;
}

function legs(canvas: Canvas, [back, front]: readonly [number, number], length: number, bottom: number): void {
  for (const x of [10 + back, 14 + front]) {
    canvas.rect(x, bottom - length, 1, length, LEG);
    canvas.rect(x, bottom - 1, 2, 1, LEG);
  }
}

function wing(canvas: Canvas, kind: NonNullable<Pose['wing']>, x: number, y: number): void {
  if (kind === 'folded') canvas.ellipse(x, y + 1, 3.6, 2.4, WING);
  if (kind === 'down') canvas.ellipse(x - 1, y + 3, 2.4, 3.4, WING);
  if (kind === 'up') {
    canvas.ellipse(x - 1, y - 3, 2.4, 3.6, WING);
    canvas.rect(x - 2, y - 1, 3, 2, WING);
  }
  if (kind === 'wide') canvas.ellipse(x - 4, y - 1, 5, 2, WING);
}

function bird(canvas: Canvas, { y = 0, lean = 0, wing: pose = 'folded', eyes = 'open', legs: feet = [0, 0], legLength = 3, tail = 0 }: Pose): void {
  const middle = 15 + y;
  legs(canvas, feet, legLength, y < -2 ? middle + 7 : 23);
  canvas.rect(3, middle - 1 + tail, 4, 2, WING);
  canvas.rect(2, middle - 2 + tail * 2, 3, 2, WING);
  canvas.ellipse(12, middle, 6.4, 5, FEATHER);
  canvas.ellipse(13.5, middle + 2, 4.4, 2.8, BELLY);
  canvas.ellipse(14 + lean, middle - 4, 4.4, 4, FEATHER);
  wing(canvas, pose, 10, middle - 1);
  canvas.map(18 + lean, middle - 5, ['##', ' '], { '#': BEAK });
  canvas.dot(18 + lean, middle - 4, BEAK);
  canvas.dot(16 + lean, middle - 2, CHEEK);
  if (eyes === 'closed') canvas.rect(14 + lean, middle - 5, 3, 1, INK);
  else if (eyes === 'back') canvas.rect(12 + lean, middle - 6, 1, 2, INK);
  else canvas.rect(16 + lean, middle - 6, 1, 2, INK);
}

function sleep(canvas: Canvas, breath: number): void {
  const ground = 23;
  canvas.rect(3, ground - 4, 4, 2, WING);
  canvas.ellipse(12, ground - 5 - breath / 2, 7.4, 5.2 + breath / 2, FEATHER);
  canvas.ellipse(13.5, ground - 2.6, 5, 2, BELLY);
  canvas.ellipse(9, ground - 6, 4.6, 3.2, WING);
  canvas.rect(14, ground - 8, 3, 1, INK);
  canvas.rect(18, ground - 7, 2, 1, BEAK);
  canvas.dot(16, ground - 6, CHEEK);
}

function perch(canvas: Canvas, eyes: Eyes, tail: number, y: number): void {
  const ground = 23;
  canvas.rect(3, ground - 5 + tail, 4, 2, WING);
  canvas.ellipse(12, ground - 6 - y, 6.8, 5.8, FEATHER);
  canvas.ellipse(13.5, ground - 3.5 - y, 4.6, 3, BELLY);
  canvas.ellipse(14, ground - 10 - y, 4.4, 3.8, FEATHER);
  canvas.ellipse(10, ground - 7 - y, 3.6, 2.6, WING);
  canvas.rect(18, ground - 11 - y, 2, 1, BEAK);
  canvas.dot(18, ground - 10 - y, BEAK);
  canvas.dot(16, ground - 8 - y, CHEEK);
  if (eyes === 'closed') canvas.rect(14, ground - 11 - y, 3, 1, INK);
  else canvas.rect(16, ground - 12 - y, 1, 2, INK);
  canvas.rect(11, ground - 1, 2, 1, LEG);
  canvas.rect(15, ground - 1, 2, 1, LEG);
}

function land(canvas: Canvas): void {
  const ground = 23;
  canvas.rect(3, ground - 3, 4, 2, WING);
  canvas.ellipse(12, ground - 3, 7.6, 3, FEATHER);
  canvas.ellipse(13.5, ground - 1.6, 5, 1.2, BELLY);
  canvas.ellipse(14, ground - 6, 4.4, 3, FEATHER);
  canvas.ellipse(7, ground - 4, 4, 1.8, WING);
  canvas.rect(18, ground - 6, 2, 1, BEAK);
  canvas.rect(15, ground - 7, 2, 1, INK);
}

function flutter(canvas: Canvas, up: boolean): void {
  canvas.ellipse(11, 12, 5, 6, FEATHER);
  canvas.ellipse(13, 13, 2.6, 4, BELLY);
  canvas.ellipse(13, 6, 4, 3.6, FEATHER);
  canvas.ellipse(6, up ? 7 : 13, 2.4, 4.4, WING);
  canvas.rect(17, 5, 2, 1, BEAK);
  canvas.rect(15, 4, 1, 2, INK);
  canvas.rect(12, 18, 1, 3, LEG);
  canvas.rect(9, 18, 1, 3, LEG);
  canvas.rect(8, 18, 4, 1, WING);
}

function dangle(canvas: Canvas, sway: number): void {
  canvas.ellipse(12 + sway, 11, 5.4, 5.4, FEATHER);
  canvas.ellipse(13 + sway, 13, 3.4, 3, BELLY);
  canvas.ellipse(6 + sway, 11, 3, 2, WING);
  canvas.ellipse(18 + sway, 11, 3, 2, WING);
  canvas.rect(17 + sway, 8, 2, 1, BEAK);
  canvas.rect(11 + sway, 8, 3, 1, INK);
  canvas.rect(10 + sway, 16, 1, 4, LEG);
  canvas.rect(14 + sway, 16, 1, 4, LEG);
}

const paints: ((canvas: Canvas) => void)[] = [
  canvas => bird(canvas, {}),
  canvas => bird(canvas, { eyes: 'closed' }),
  canvas => bird(canvas, { lean: 1, tail: -1 }),
  canvas => bird(canvas, { eyes: 'back', lean: -1 }),

  canvas => bird(canvas, { legs: [-1, 1] }),
  canvas => bird(canvas, { y: -1, legs: [0, 0], tail: -1 }),
  canvas => bird(canvas, { legs: [1, -1] }),
  canvas => bird(canvas, { y: -1, legs: [0, 0], tail: 1 }),

  canvas => perch(canvas, 'open', 0, 1),
  canvas => perch(canvas, 'open', 0, 0),
  () => {},
  () => {},

  canvas => sleep(canvas, 2),
  canvas => sleep(canvas, 0),
  () => {},
  () => {},

  canvas => bird(canvas, { y: -5, wing: 'up', legLength: 2 }),
  canvas => bird(canvas, { y: -5, wing: 'wide', legLength: 2 }),
  canvas => bird(canvas, { y: -5, wing: 'down', legLength: 2 }),
  land,

  canvas => flutter(canvas, true),
  canvas => flutter(canvas, false),
  canvas => flutter(canvas, true),
  canvas => flutter(canvas, false),

  canvas => dangle(canvas, 0),
  canvas => dangle(canvas, 1),
  canvas => dangle(canvas, 0),
  canvas => dangle(canvas, -1),
];

/** Pip, a round little blue bird with a warm belly, as frames row by row. */
export const pipFrames = () => framesOf(paints, INK);
