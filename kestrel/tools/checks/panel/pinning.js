import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press, rest, rightClick} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';

const {eventually} = checks('pinning');
const FILE_MANAGER = 'com.lantharos.rover.desktop';

export async function run() {
  const panel = named('kestrel-panel');
  const menu = named('kestrel-context-menu');
  rightClick(named('Rover', panel));
  await eventually(() => menu.visible, 'right-clicking a pinned app opens its menu');
  await capture('panel-context-menu');
  const favorites = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = favorites.get_strv('favorite-apps');
  click(named('Unpin from taskbar', menu));
  await eventually(() => !favorites.get_strv('favorite-apps').includes(FILE_MANAGER), 'Unpin from taskbar unpins the app');
  favorites.set_strv('favorite-apps', saved);
  await eventually(() => named('Rover', panel)?.mapped, 'pinning the app again brings its button back');

  rightClick([20, 20]);
  await eventually(() => menu.visible && named('Change wallpaper', menu), 'right-clicking the desktop offers to change the wallpaper');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the desktop menu');
  rest();
}

