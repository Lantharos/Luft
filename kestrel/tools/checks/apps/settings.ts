import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkExtensions} from './settings/look/extensions.js';
import {checkFonts} from './settings/look/fonts.js';
import {checkPages} from './settings/pages.js';
import {checkSeeThrough} from './settings/look/seeThrough.js';
import {checkTiling} from './settings/look/tiling.js';
import {checkTaskbarLooks, checkTaskbarLayouts} from './settings/look/taskbar.js';
import {checkWallpaper} from './settings/look/wallpaper.js';

export async function run() {
  await withApp('settings', [], checkExtensions);
  await withPalette(async palette => {
    await withApp('settings', [], async app => {
      await checkPalette(app, palette);
      await checkPages(app);
      await checkTaskbarLooks(app);
      await checkTaskbarLayouts(app);
      await checkTiling(app);
      await checkSeeThrough(app);
      await showDark(app, palette);
      await checkFonts(app);
      await checkWallpaper(app);
    });
  });
}
