import Gio from 'gi://Gio';

import {named} from '../lib/actors.js';
import {checkAlways, checkWindows} from './taskbarOptions/autoHide.js';
import {checkDisplays} from './taskbarOptions/displays.js';
import {checkAlignment, checkFloating, checkLooks, checkSizes} from './taskbarOptions/looks.js';
import {bottomGap, eventually, HEIGHTS, KEYS, panel, require, set, settings} from './taskbarOptions/taskbar.js';
import {checkWorkspaceWindows} from './taskbarOptions/workspaces.js';

const slots = () => named('kestrel-panel-center', panel()).get_children()[1].get_children();

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
    require(bottomGap() === HEIGHTS.normal, 'the taskbar reserves its height at the bottom of the screen');
    await checkAlignment();
    await checkLooks();
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
