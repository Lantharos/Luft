import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {openApp} from '../checks/apps/lib/apps.js';
import type {LuftApp} from '../checks/lib/apps/luftApp.js';
import {findWindow} from '../checks/lib/processes.js';
import {settled} from '../checks/lib/wait.js';
import {slideWindow} from './glass.js';
import type {FrameRecorder, Interaction} from './recorder.js';

type Shows = 'everything' | 'wallpaper';

const KEYS = ['see-through-apps', 'see-through-shows'];
const TERN_SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'tern', 'settings.json']);
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

let tern: LuftApp | null = null;

async function seeThroughTern(shows: Shows) {
  if (!tern) {
    GLib.mkdir_with_parents(GLib.path_get_dirname(TERN_SETTINGS), 0o755);
    GLib.file_set_contents(TERN_SETTINGS, '{"translucent": false}');
    tern = await openApp('tern', ['-e', 'sh', '-c', 'sleep 600']);
  }
  const app = Shell.WindowTracker.get_default().get_window_app(tern.window)!;
  settings.set_strv('see-through-apps', [app.get_id()]);
  settings.set_string('see-through-shows', shows);
  const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  tern.window.move_resize_frame(true, area.x + 120, area.y + 60, 900, 600);
  tern.window.raise();
  await settled();
}

async function closeTern() {
  for (const key of KEYS) settings.reset(key);
  await tern?.close();
  tern = null;
  GLib.unlink(TERN_SETTINGS);
}

const behind = (recorder: FrameRecorder) => slideWindow(findWindow((window: Meta.Window) => !!window.get_title()?.startsWith('Files'))!, recorder);

const interactions = (shows: Shows, label: string): Interaction[] => [
  {name: `see-through window moving, ${label}`, prepare: () => seeThroughTern(shows), act: recorder => slideWindow(tern!.window, recorder), finish: closeTern},
  {name: `window moving behind a see-through window, ${label}`, prepare: () => seeThroughTern(shows), act: behind, finish: closeTern},
];

export const seeThroughInteractions: Interaction[] = [
  ...interactions('everything', 'everything behind'),
  ...interactions('wallpaper', 'only the wallpaper'),
];
