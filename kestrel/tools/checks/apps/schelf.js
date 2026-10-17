import Clutter from 'gi://Clutter';

import {fixture} from '../lib/processes.js';
import {rest, scroll} from '../lib/input.js';
import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';

const SYSTEMS = {
  packages: {LUFT_KERNEL_COMMAND_LINE: '/dev/null'},
  image: {LUFT_KERNEL_COMMAND_LINE: fixture('system', 'image.cmdline')},
};
const PAGES = {discover: [], search: ['schelf:search?gcompris']};
const CONTENT = [700, 400];
const SCROLL_STEPS = 40;

async function saveEnd(app, palette, name) {
  await showDark(app, palette);
  await app.settle(() => true);
  for (let step = 0; step < SCROLL_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(CONTENT));
  rest();
  (await app.settle(() => true)).save(name);
}

export async function run() {
  await withPalette(async palette => {
    await withApp('schelf', [], app => checkPalette(app, palette));
    for (const [system, env] of Object.entries(SYSTEMS)) {
      for (const [page, args] of Object.entries(PAGES))
        await withApp('schelf', args, app => saveEnd(app, palette, `schelf-${page}-${system}-dark`), env);
    }
  });
}
