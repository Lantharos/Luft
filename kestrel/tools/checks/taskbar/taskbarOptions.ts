import Gio from 'gi://Gio';

import {existing} from '../lib/actors.js';
import {checkAlways, checkWindows} from './taskbarOptions/autoHide.js';
import {checkDisplays} from './taskbarOptions/displays.js';
import {checkAlignment, checkFloating, checkLooks, checkSizes, checkWallpaperGlass} from './taskbarOptions/looks.js';
import {edgeGap, eventually, HEIGHTS, KEYS, panel, require, set, settings} from './taskbarOptions/taskbar.js';
import {checkPositions} from './taskbarOptions/positions.js';
import {checkWorkspaceWindows} from './taskbarOptions/workspaces.js';

const slots = () => existing('kestrel-panel-center', panel()).get_children()[1].get_children();

async function checkPinned() {
  const pinned = settings.get_strv('favorite-apps').length;
  set('taskbar-show-pinned', false);
  await eventually(() => slots().length < pinned, 'the taskbar can show only running apps');
  set('taskbar-show-pinned', true);
}

export async function run() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  try {
    require(edgeGap() === HEIGHTS.normal, 'the taskbar reserves its thickness along its edge of the screen');
    await checkAlignment();
    await checkPositions();
    await checkLooks();
    await checkWallpaperGlass();
    styles.set_string('color-scheme', scheme);
    await checkFloating();
    await checkSizes();
    await checkAlways();
    await checkWindows();
    await checkPinned();
    await checkWorkspaceWindows();
    await checkDisplays();
  } finally {
    for (const key of KEYS) settings.reset(key);
    styles.set_string('color-scheme', scheme);
  }
}
