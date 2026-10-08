import GLib from 'gi://GLib';

import {read} from '../lib/files.js';
import {RULES, userLayouts} from './layout.js';
import {ENGINE} from './method.js';

const config = (...parts) => GLib.build_filenamev([GLib.get_user_config_dir(), ...parts]);

export function forgetCreated() {
  const before = userLayouts();
  const method = ENGINE.slice('keys:'.length);
  return () => {
    for (const layout of userLayouts().filter(name => !before.includes(name))) {
      GLib.unlink(config('xkb/symbols', layout));
      GLib.unlink(config('keys/layouts', `${layout}.toml`));
      GLib.file_set_contents(RULES, read(RULES).replace(/ *<layout>[\s\S]*?<\/layout>\n/g, block => block.includes(`<name>${layout}</name>`) ? '' : block));
    }
    GLib.unlink(config('keys', 'Compose'));
    GLib.unlink(GLib.build_filenamev([GLib.get_home_dir(), '.XCompose']));
    GLib.unlink(config('keys/input-methods', `${method}.toml`));
    GLib.unlink(GLib.build_filenamev([GLib.get_user_state_dir(), 'keys/learned', `${method}.json`]));
    GLib.unlink(config('autostart', 'com.lantharos.keys.input-methods.desktop'));
  };
}
