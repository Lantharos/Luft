import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkAccessibility} from './settings/system/accessibility.js';
import {checkDictation} from './settings/system/dictation.js';
import {checkFonts} from './settings/desktop/fonts.js';
import {checkHardware} from './settings/system/hardware.js';
import {checkLive} from './settings/live.js';
import {checkPages} from './settings/pages.js';
import {checkTiling} from './settings/desktop/tiling.js';
import {checkLongSleep} from './settings/system/power.js';
import {checkTaskbarLooks} from './settings/desktop/taskbar.js';
import {checkWallpaper} from './settings/desktop/wallpaper.js';

export async function run() {
  await withPalette(async palette => {
    await withApp('settings', [], async app => {
      await checkPalette(app, palette);
      await checkPages(app);
      await checkTaskbarLooks(app);
      await checkTiling(app);
      await showDark(app, palette);
      await checkAccessibility(app);
      await checkLive(app);
      await checkHardware(app);
      await checkLongSleep(app);
      await checkFonts(app);
      await checkWallpaper(app);
      await checkDictation(app);
    });
  });
}
