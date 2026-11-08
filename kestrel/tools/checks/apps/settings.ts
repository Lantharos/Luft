import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkAccessibility} from './settings/system/accessibility.js';
import {checkDictation} from './settings/system/dictation.js';
import {checkExtensions} from './settings/look/extensions.js';
import {checkFonts} from './settings/look/fonts.js';
import {checkHardware} from './settings/system/hardware.js';
import {checkLive} from './settings/live.js';
import {checkPages} from './settings/pages.js';
import {checkRecoveryKey} from './settings/security/recoveryKey.js';
import {checkSeeThrough} from './settings/look/seeThrough.js';
import {checkTiling} from './settings/look/tiling.js';
import {checkLongSleep} from './settings/system/power.js';
import {checkPrinters} from './settings/system/printers.js';
import {checkTaskbarLooks, checkTaskbarLayouts} from './settings/look/taskbar.js';
import {checkUpdates} from './settings/system/updates.js';
import {checkWallpaper} from './settings/look/wallpaper.js';

export async function run() {
  await withPalette(async palette => {
    await withApp('settings', [], async app => {
      await checkExtensions(app);
      await checkPalette(app, palette);
      await checkPages(app);
      await checkTaskbarLooks(app);
      await checkTaskbarLayouts(app);
      await checkTiling(app);
      await checkSeeThrough(app);
      await showDark(app, palette);
      await checkAccessibility(app);
      await checkLive(app);
      await checkHardware(app);
      await checkLongSleep(app);
      await checkPrinters(app);
      await checkRecoveryKey(app);
      await checkFonts(app);
      await checkWallpaper(app);
      await checkDictation(app);
    });
    await checkUpdates(palette);
  });
}
