import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {write} from '../apps/lib/files.js';
import {existing, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, rest, restingPoint, rightClick} from '../lib/input/input.js';
import {fixture, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {dots} from './taskbarOptions/taskbar.js';

const {require, eventually} = checks('pinning');
const FILE_MANAGER = 'com.lantharos.rover.desktop';
const REWRITTEN = 'com.lantharos.KestrelRewrittenLauncher';

const launcher = (exec: string) => `[Desktop Entry]\nType=Application\nName=Rewritten launcher\nIcon=application-x-executable\nExec=${exec}\n`;

async function checkRewrittenLauncher(panel: Clutter.Actor, favorites: Gio.Settings, saved: string[]) {
  const id = `${REWRITTEN}.desktop`;
  const path = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', id]);
  const appSystem = Shell.AppSystem.get_default();
  write(path, launcher('true'));
  await eventually(() => appSystem.lookup_app(id), 'a new launcher is picked up');
  favorites.set_strv('favorite-apps', [...saved, id]);
  const client = spawn(['python3', fixture('clients', 'wayland', 'namedClient.py'), 'Rewritten launcher', REWRITTEN]);
  try {
    const window = await waitForWindow('Rewritten launcher');
    await eventually(() => dots(named(`kestrel-app-${id}`, panel)) === 1, 'a running pinned app shows its running dot');
    write(path, launcher('true --rewritten'));
    await eventually(() => appSystem.lookup_app(id)?.get_app_info().get_commandline()?.includes('--rewritten'), 'a rewritten launcher is picked up');
    await settled();
    require(appSystem.lookup_app(id) === Shell.WindowTracker.get_default().get_window_app(window) && dots(named(`kestrel-app-${id}`, panel)) === 1,
      'a pinned app keeps its running dot when its launcher is rewritten while it runs');
  } finally {
    await stop(client);
    favorites.set_strv('favorite-apps', saved);
    GLib.unlink(path);
  }
}

export async function run() {
  const panel = existing('kestrel-panel');
  const menu = existing('kestrel-context-menu');
  rightClick(existing('Rover', panel));
  await eventually(() => menu.visible, 'right-clicking a pinned app opens its menu');
  await capture('panel-context-menu');
  const favorites = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = favorites.get_strv('favorite-apps');
  click(existing('Unpin from taskbar', menu));
  await eventually(() => !favorites.get_strv('favorite-apps').includes(FILE_MANAGER), 'Unpin from taskbar unpins the app');
  favorites.set_strv('favorite-apps', saved);
  await eventually(() => named('Rover', panel)?.mapped, 'pinning the app again brings its button back');

  rightClick(restingPoint());
  await eventually(() => menu.visible && named('Change wallpaper', menu), 'right-clicking the desktop offers to change the wallpaper');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the desktop menu');
  rest();

  await checkRewrittenLauncher(panel, favorites, saved);
}
