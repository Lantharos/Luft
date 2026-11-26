import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkExtensions} from './settings/look/extensions.js';
import {checkFonts} from './settings/look/fonts.js';
import {checkPages} from './settings/pages.js';
import {checkWallpaper} from './settings/look/wallpaper.js';

export async function run() {
  await withApp('settings', [], checkExtensions);
  await withPalette(async palette => {
    await withApp('settings', [], async app => {
      await checkPalette(app, palette);
      await checkPages(app);
      await showDark(app, palette);
      await checkFonts(app);
      await checkWallpaper(app);
    });
  });
}
