import {withApp} from './lib/apps.js';
import {checkPalette, withPalette} from './lib/palette.js';

export async function run() {
  await withPalette(palette => withApp('barometer', [], app => checkPalette(app, palette)));
}
