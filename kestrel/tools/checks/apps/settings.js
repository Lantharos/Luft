import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkAccessibility} from './settings/accessibility.js';
import {checkDictation} from './settings/dictation.js';
import {checkFonts} from './settings/fonts.js';
import {checkHardware} from './settings/hardware.js';
import {checkLive} from './settings/live.js';
import {checkPages} from './settings/pages.js';
import {checkTiling} from './settings/tiling.js';
import {checkLongSleep} from './settings/power.js';
import {checkUpdates} from './settings/updates.js';
import {checkTaskbarLooks} from './settings/taskbar.js';
import {checkWallpaper} from './settings/wallpaper.js';

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
    await checkUpdates(palette);
  });
}
