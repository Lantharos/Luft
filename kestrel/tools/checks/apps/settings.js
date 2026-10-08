import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkAccessibility} from './settings/accessibility.js';
import {checkFonts} from './settings/fonts.js';
import {checkHardware} from './settings/hardware.js';
import {checkLive} from './settings/live.js';
import {checkPages} from './settings/pages.js';
import {checkUpdates} from './settings/updates.js';

export async function run() {
  await withPalette(async palette => {
    await withApp('settings', [], async app => {
      await checkPalette(app, palette);
      await checkPages(app);
      await showDark(app, palette);
      await checkAccessibility(app);
      await checkLive(app);
      await checkHardware(app);
      await checkFonts(app);
    });
    await checkUpdates(palette);
  });
}
