import {withApp} from './lib/apps.js';
import {showDark, withPalette} from './lib/palette.js';
import {checkLive} from './settings/live.js';
import {checkRecoveryKey} from './settings/security/recoveryKey.js';
import {checkAccessibility} from './settings/system/accessibility.js';
import {checkDictation} from './settings/system/dictation.js';
import {checkHardware} from './settings/system/hardware.js';
import {checkLongSleep} from './settings/system/power.js';
import {checkPrinters} from './settings/system/printers.js';
import {checkUpdates} from './settings/system/updates.js';

export async function run() {
  await withPalette(async palette => {
    await withApp('settings', [], async app => {
      await showDark(app, palette);
      await checkAccessibility(app);
      await checkLive(app);
      await checkHardware(app);
      await checkLongSleep(app);
      await checkPrinters(app);
      await checkRecoveryKey(app);
      await checkDictation(app);
    });
    await checkUpdates(palette);
  });
}
