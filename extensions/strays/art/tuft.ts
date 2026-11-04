import { Canvas, type Color, framesOf } from './canvas.js';

const INK: Color = [44, 36, 46];
const FUR: Color = [232, 170, 102];
const SHADE: Color = [201, 128, 78];
const STRIPE: Color = [170, 96, 62];
const CREAM: Color = [250, 232, 200];
const EAR: Color = [240, 150, 140];
const NOSE: Color = [216, 96, 104];

type Eyes = 'open' | 'closed' | 'up' | 'back';

interface Pose {
  /** How far the body sits from the ground. */
  rise: number;
  headX?: number;
  headY?: number;
  /** Paw offsets along the ground, back then front, and each paw's lift. */
  back?: number;
  front?: number;
  backLift?: number;
  frontLift?: number;
  tail?: 'up' | 'curl' | 'down' | 'flat';
  eyes?: Eyes;
}

function tail(canvas: Canvas, pose: NonNullable<Pose['tail']>, baseY: number): void {
  const shapes: Record<typeof pose, readonly [number, number][]> = {
    up: [[6, 0], [5, -1], [4, -2], [4, -3], [4, -4], [4, -5], [5, -6]],
    curl: [[6, 0], [5, -1], [4, -2], [3, -3], [3, -4], [4, -5], [5, -5]],
    down: [[6, 0], [5, 1], [4, 1], [3, 2], [2, 3]],
    flat: [[6, 0], [5, 0], [4, 0], [3, -1], [2, -1], [1, -2]],
  };
  const trail = shapes[pose];
  trail.forEach(([x, y], index) => {
    canvas.rect(x, baseY + y, 2, 2, index >= trail.length - 2 ? STRIPE : FUR);
  });
}

function head(canvas: Canvas, x: number, y: number, eyes: Eyes): void {
  canvas.map(x - 4, y - 7, ['#.    #', '##   ##', '#%# #%#'], { '#': FUR, '%': EAR, '.': FUR });
  canvas.ellipse(x, y - 1.5, 4.6, 3.8, FUR);
  canvas.ellipse(x + 1.4, y + 0.6, 2.6, 1.6, CREAM);
  canvas.map(x - 1, y - 5, ['# #'], { '#': STRIPE });
  canvas.dot(x + 2, y, NOSE);
  if (eyes === 'closed') {
    canvas.rect(x - 2, y - 2, 2, 1, INK);
    canvas.rect(x + 2, y - 2, 2, 1, INK);
  } else if (eyes === 'back') {
    canvas.rect(x - 4, y - 3, 1, 2, INK);
    canvas.rect(x - 1, y - 3, 1, 2, INK);
  } else {
    const lift = eyes === 'up' ? 1 : 0;
    canvas.rect(x - 2, y - 3 - lift, 1, 2, INK);
    canvas.rect(x + 2, y - 3 - lift, 1, 2, INK);
  }
}

function stand(canvas: Canvas, pose: Pose): void {
  const ground = 23;
  const body = ground - 5 - pose.rise;
  tail(canvas, pose.tail ?? 'up', body - 1);
  const paw = (x: number, lift: number) => canvas.rect(x, ground - 2 - lift, 2, 2 + (lift ? 0 : 0), SHADE);
  paw(8 + (pose.back ?? 0), pose.backLift ?? 0);
  paw(14 + (pose.front ?? 0), pose.frontLift ?? 0);
  canvas.ellipse(11.5, body, 6.2, 3.6, FUR);
  canvas.map(9, body - 3, ['# #'], { '#': STRIPE });
  canvas.map(12, body - 3, ['#'], { '#': STRIPE });
  canvas.ellipse(12.5, body + 2, 3.6, 1.4, CREAM);
  paw(6 + (pose.back ?? 0) * -1, pose.frontLift ?? 0);
  paw(16 + (pose.front ?? 0) * -1, pose.backLift ?? 0);
  head(canvas, 16 + (pose.headX ?? 0), body - 3 + (pose.headY ?? 0), pose.eyes ?? 'open');
}

function sit(canvas: Canvas, eyes: Eyes, tailPose: NonNullable<Pose['tail']>, low: number): void {
  const ground = 23;
  canvas.ellipse(11, ground - 4, 5.4, 4, FUR);
  tail(canvas, tailPose, ground - 3);
  canvas.ellipse(11, ground - 7 + low, 4.6, 4.4, FUR);
  canvas.ellipse(12.5, ground - 5 + low, 2.6, 3, CREAM);
  canvas.rect(11, ground - 2, 2, 2, SHADE);
  canvas.rect(14, ground - 2, 2, 2, SHADE);
  canvas.rect(6, ground - 2, 4, 2, SHADE);
  head(canvas, 14, ground - 10 + low, eyes);
}

function sleep(canvas: Canvas, breath: number): void {
  const ground = 23;
  tail(canvas, 'flat', ground - 3);
  canvas.ellipse(10.5, ground - 3.5 - breath / 2, 6.6, 3.2 + breath / 2, FUR);
  canvas.map(7, ground - 6 - breath, ['# # #'], { '#': STRIPE });
  canvas.rect(5, ground - 2, 8, 2, SHADE);
  canvas.map(13, ground - 9, ['#.  .#', '##  ##'], { '#': FUR, '.': EAR });
  canvas.ellipse(16, ground - 4, 4.2, 3.2, FUR);
  canvas.ellipse(17, ground - 2.6, 2.4, 1.2, CREAM);
  canvas.rect(14, ground - 5, 2, 1, INK);
  canvas.rect(17, ground - 5, 2, 1, INK);
  canvas.dot(18, ground - 3, NOSE);
  canvas.rect(14, ground - 2, 3, 2, SHADE);
}

function fall(canvas: Canvas, spread: number): void {
  canvas.ellipse(11.5, 12, 6, 4, FUR);
  tail(canvas, spread ? 'up' : 'curl', 9);
  canvas.rect(5 - spread, 14 + spread, 2, 2 + spread, SHADE);
  canvas.rect(16 + spread, 14 + spread, 2, 2 + spread, SHADE);
  canvas.rect(8, 15, 2, 2, SHADE);
  canvas.rect(13, 15, 2, 2, SHADE);
  canvas.ellipse(12.5, 14, 3.6, 1.4, CREAM);
  head(canvas, 15, 8, 'up');
}

function land(canvas: Canvas): void {
  const ground = 23;
  tail(canvas, 'flat', ground - 4);
  canvas.ellipse(11.5, ground - 3, 7.2, 2.8, FUR);
  canvas.rect(4, ground - 1, 3, 1, SHADE);
  canvas.rect(16, ground - 1, 3, 1, SHADE);
  canvas.ellipse(12.5, ground - 2, 4, 1, CREAM);
  head(canvas, 16, ground - 4, 'closed');
}

function climb(canvas: Canvas, reach: number): void {
  const wall = 21;
  tail(canvas, 'down', 16);
  canvas.ellipse(13, 13, 4, 6, FUR);
  canvas.map(10, 11, ['#', ' ', '#'], { '#': STRIPE });
  canvas.ellipse(15, 14, 1.6, 3.6, CREAM);
  canvas.rect(wall - 3, 5 + reach, 3, 2, SHADE);
  canvas.rect(wall - 3, 16 - reach, 3, 2, SHADE);
  canvas.rect(wall - 3, 11 - reach, 3, 2, SHADE);
  canvas.rect(11, 19 + reach, 3, 2, SHADE);
  head(canvas, 14, 7, 'up');
}

function held(canvas: Canvas, sway: number): void {
  canvas.ellipse(12 + sway, 14, 3.8, 5, FUR);
  canvas.ellipse(13 + sway, 15, 1.8, 3.2, CREAM);
  canvas.rect(8 + sway * 2, 18, 2, 3, SHADE);
  canvas.rect(14 + sway * 2, 18, 2, 3, SHADE);
  canvas.rect(8, 10, 2, 3, SHADE);
  canvas.rect(15, 10, 2, 3, SHADE);
  tail(canvas, 'down', 18);
  head(canvas, 12, 8, 'closed');
}

const paints: ((canvas: Canvas) => void)[] = [
  canvas => stand(canvas, { rise: 0, tail: 'up' }),
  canvas => stand(canvas, { rise: 0, tail: 'curl', eyes: 'closed' }),
  canvas => stand(canvas, { rise: 0, tail: 'up', eyes: 'up', headY: -1 }),
  canvas => stand(canvas, { rise: 0, tail: 'curl', eyes: 'back', headX: -1 }),

  canvas => stand(canvas, { rise: 0, tail: 'up', back: -1, front: 1 }),
  canvas => stand(canvas, { rise: 1, tail: 'curl', back: 0, front: 0, backLift: 1 }),
  canvas => stand(canvas, { rise: 0, tail: 'up', back: 1, front: -1 }),
  canvas => stand(canvas, { rise: 1, tail: 'curl', back: 0, front: 0, frontLift: 1 }),

  canvas => sit(canvas, 'open', 'flat', 1),
  canvas => sit(canvas, 'open', 'flat', 0),
  () => {},
  () => {},

  canvas => sleep(canvas, 2),
  canvas => sleep(canvas, 0),
  () => {},
  () => {},

  canvas => fall(canvas, 0),
  canvas => fall(canvas, 1),
  canvas => fall(canvas, 2),
  land,

  canvas => climb(canvas, 0),
  canvas => climb(canvas, 1),
  canvas => climb(canvas, 2),
  canvas => climb(canvas, 1),

  canvas => held(canvas, 0),
  canvas => held(canvas, 1),
  canvas => held(canvas, 0),
  canvas => held(canvas, -1),
];

/** Tuft, a ginger cat-like creature with tufted ears, as frames row by row. */
export const tuftFrames = () => framesOf(paints, INK);
