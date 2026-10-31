import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {withApp} from '../apps/lib/apps.js';

const {require, eventually} = checks('see-through windows');
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const KEYS = ['see-through-apps', 'see-through-keep-text', 'see-through-blur'];
const TERN_SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'tern', 'settings.json']);
const TEXT = 'Text stays solid while the background lets the desktop through';

export async function run() {
  GLib.mkdir_with_parents(GLib.path_get_dirname(TERN_SETTINGS), 0o755);
  GLib.file_set_contents(TERN_SETTINGS, '{"translucent": false}');
  try {
    await withApp('tern', ['-e', 'sh', '-c', `printf '%s\\n' '${TEXT}'; sleep 600`], async tern => {
      const app = require(Shell.WindowTracker.get_default().get_window_app(tern.window), 'Tern has an app');
      const seeThrough = () => tern.window.get_compositor_private<Meta.WindowActor>()!.get_children().some(child => child.get_effect('see-through'));
      settings.set_strv('see-through-apps', [app.get_id()]);
      await eventually(seeThrough, 'choosing an app makes its windows see-through');
      await settled();
      await capture('see-through');
      settings.set_boolean('see-through-keep-text', false);
      settings.set_boolean('see-through-blur', false);
      await settled();
      await capture('see-through-whole-window');
      settings.reset('see-through-apps');
      await eventually(() => !seeThrough(), 'taking the app off makes its windows solid again');
    });
  } finally {
    for (const key of KEYS) settings.reset(key);
    GLib.unlink(TERN_SETTINGS);
  }
}
