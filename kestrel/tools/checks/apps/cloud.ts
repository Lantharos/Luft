import GLib from 'gi://GLib';

import {withApp} from './lib/apps.js';
import {withPalette} from './lib/palette.js';
import {checkRover} from './cloud/rover.js';
import {signIn, startCloud} from './cloud/service.js';
import {checkSettings} from './cloud/settings.js';

export async function run() {
  const rclone = GLib.find_program_in_path('rclone');
  if (!rclone) {
    console.log('Kestrel Luft app check: cloud drives skipped without rclone');
    return;
  }
  await withPalette(async () => {
    const cloud = await startCloud(rclone);
    try {
      const drive = await signIn(cloud);
      await withApp('settings', [], app => checkSettings(app, drive));
      await withApp('rover', [], app => checkRover(app, drive));
    } finally {
      await cloud.stop();
    }
  });
}
