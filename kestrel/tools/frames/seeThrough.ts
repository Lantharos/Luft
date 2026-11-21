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

type Look = {material: 'luca' | 'maris'; lucaBlurs: 'everything' | 'wallpaper'};

const GLASS_KEYS = ['see-through', 'luca-blurs'];
const TERMINAL_SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'terminal', 'settings.json']);
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const glass = new Gio.Settings({schema_id: 'com.lantharos.kestrel.glass'});

let terminal: LuftApp | null = null;

async function seeThroughTerminal({material, lucaBlurs}: Look) {
  if (!terminal) {
    GLib.mkdir_with_parents(GLib.path_get_dirname(TERMINAL_SETTINGS), 0o755);
    GLib.file_set_contents(TERMINAL_SETTINGS, '{"translucent": false}');
    terminal = await openApp('terminal', ['-e', 'sh', '-c', 'sleep 600']);
  }
  const app = Shell.WindowTracker.get_default().get_window_app(terminal.window)!;
  settings.set_strv('see-through-apps', [app.get_id()]);
  glass.set_string('see-through', material);
  glass.set_string('luca-blurs', lucaBlurs);
  const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  terminal.window.move_resize_frame(true, area.x + 120, area.y + 60, 900, 600);
  terminal.window.raise();
  await settled();
}

async function closeTerminal() {
  settings.reset('see-through-apps');
  for (const key of GLASS_KEYS) glass.reset(key);
  await terminal?.close();
  terminal = null;
  GLib.unlink(TERMINAL_SETTINGS);
}

const behind = (recorder: FrameRecorder) => slideWindow(findWindow((window: Meta.Window) => !!window.get_title()?.startsWith('Files'))!, recorder);

const interactions = (look: Look, label: string): Interaction[] => [
  {name: `see-through window moving, ${label}`, prepare: () => seeThroughTerminal(look), act: recorder => slideWindow(terminal!.window, recorder), finish: closeTerminal},
  {name: `window moving behind a see-through window, ${label}`, prepare: () => seeThroughTerminal(look), act: behind, finish: closeTerminal},
];

export const seeThroughInteractions: Interaction[] = [
  ...interactions({material: 'luca', lucaBlurs: 'everything'}, 'Luca'),
  ...interactions({material: 'luca', lucaBlurs: 'wallpaper'}, 'Luca over the wallpaper'),
  ...interactions({material: 'maris', lucaBlurs: 'everything'}, 'Maris'),
];
