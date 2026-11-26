import Gio from 'gi://Gio';

import {existing} from '../lib/actors.js';
import {remember} from '../lib/settings.js';
import {checkAlways, checkWindows} from './taskbarOptions/autoHide.js';
import {checkEdgeLine} from './taskbarOptions/edgeLine.js';
import {checkAlignment, checkFloating, checkLooks, checkSizes, checkWallpaperGlass} from './taskbarOptions/looks.js';
import {taskbarEdge} from '../lib/edge.js';
import {edgeGap, eventually, HEIGHTS, KEYS, panel, require, set, settings} from './taskbarOptions/taskbar.js';
import {checkPositions} from './taskbarOptions/positions.js';

const slots = () => existing('kestrel-taskbar-dock', panel()).get_children();

async function checkPinned() {
  const pinned = settings.get_strv('favorite-apps').length;
  set('taskbar-show-pinned', false);
  await eventually(() => slots().length < pinned, 'the taskbar can show only running apps');
  set('taskbar-show-pinned', true);
}

export async function run() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  const restore = remember(settings, KEYS);
  try {
    require(edgeGap() === HEIGHTS.normal, 'the taskbar reserves its thickness along its edge of the screen');
    await checkAlignment();
    if (taskbarEdge() === 'bottom') {
      await checkPositions();
      await checkLooks();
      await checkWallpaperGlass();
      styles.set_string('color-scheme', scheme);
      await checkPinned();
    }
    await checkEdgeLine();
    await checkFloating();
    await checkSizes();
    await checkAlways();
    await checkWindows();
  } finally {
    restore();
    styles.set_string('color-scheme', scheme);
  }
}
