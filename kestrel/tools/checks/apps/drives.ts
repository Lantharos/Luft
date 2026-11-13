import GLib from 'gi://GLib';

import {checkAppImages} from './drives/appImages.js';
import {checkFlatpaks} from './drives/flatpaks.js';

export const timeout = 600000;

export async function run() {
  if (GLib.find_program_in_path('squashfuse_ll')) await checkAppImages();
  else console.log('Kestrel Drive access: AppImages skipped without squashfuse');
  const flatpakHome = GLib.getenv('KESTREL_FLATPAK_HOME');
  if (flatpakHome) await checkFlatpaks(flatpakHome);
  else console.log('Kestrel Drive access: Flatpak apps skipped without KESTREL_FLATPAK_HOME');
}
