import {checks} from '../lib/check.js';
import {drag, type Point} from '../lib/input/input.js';
import {withApp} from '../apps/lib/apps.js';

const {require, eventually} = checks('outer resize edges');
const OUTSIDE = 3;
const RESIZE = 60;

export async function run() {
  await withApp('settings', [], async app => {
    await app.settle(() => true);
    const window = app.window;
    const before = window.get_frame_rect();
    require(before.width === window.get_buffer_rect().width, 'Settings draws nothing outside its frame');
    const edge: Point = [before.x + before.width + OUTSIDE, before.y + before.height / 2];
    await drag(edge, [edge[0] + RESIZE, edge[1]]);
    await eventually(() => window.get_frame_rect().width === before.width + RESIZE && window.get_frame_rect().x === before.x,
      'dragging just outside a window\'s right edge widens it');
  });
}
