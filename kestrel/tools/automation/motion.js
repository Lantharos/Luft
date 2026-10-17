import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {stopAll} from '../checks/lib/processes.js';
import {settled} from '../checks/lib/wait.js';
import {groups} from '../motion/clips.js';
import {clip} from '../motion/film.js';
import {endSession} from './runner.js';

const STARTUP_SETTLE = 3000;

export async function run() {
  await settled(STARTUP_SETTLE);
  const out = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), 'clips']);
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  session.set_uint('idle-delay', 0);
  interfaceSettings.set_boolean('cursor-blink', false);
  const only = (GLib.getenv('KESTREL_MOTION_ONLY') ?? '').split(',').filter(Boolean);
  const record = (name, action, options) => clip(out, name, action, options);
  try {
    for (const [name, group] of Object.entries(groups)) {
      if (only.length && !only.includes(name)) continue;
      try {
        await group(record);
      } catch (error) {
        logError(error, `motion group ${name}`);
      }
    }
  } finally {
    await stopAll();
    session.reset('idle-delay');
    interfaceSettings.reset('cursor-blink');
    await endSession();
  }
}
