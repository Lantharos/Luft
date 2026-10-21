import Clutter from 'gi://Clutter';

import {scroll} from '../../lib/input/input.js';
import {changes, followLink} from '../lib/apps.js';

const SCROLL_POINT = [650, 400];
const SCROLL_STEPS = 5;

export async function show(app, page, label = `settings shows ${page} from a kestrel-settings link`, area = null) {
  await changes(app, label, () => followLink('settings', `kestrel-settings:${page}`), area);
  return app.settle(() => true);
}

export async function showEnd(app, page) {
  let after = await show(app, page);
  let before;
  do {
    before = after;
    for (let step = 0; step < SCROLL_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(SCROLL_POINT));
    after = await app.settle(frame => !frame.looksLike(before));
  } while (!after.looksLike(before));
  return after;
}
