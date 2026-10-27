import Clutter from 'gi://Clutter';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {rest, scroll, type Point} from '../lib/input/input.js';
import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette, type Palette} from './lib/palette.js';

const PAGES = {discover: [], search: ['schelf:search?gcompris']};
const CONTENT: Point = [700, 400];
const SCROLL_STEPS = 40;

async function saveEnd(app: LuftApp, palette: Palette, name: string) {
  await showDark(app, palette);
  await app.settle(() => true);
  for (let step = 0; step < SCROLL_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(CONTENT));
  rest();
  (await app.settle(() => true)).save(name);
}

export async function run() {
  await withPalette(async palette => {
    await withApp('schelf', [], app => checkPalette(app, palette));
    for (const [page, args] of Object.entries(PAGES))
      await withApp('schelf', args, app => saveEnd(app, palette, `schelf-${page}-dark`));
  });
}
