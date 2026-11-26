import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {changes} from '../lib/apps.js';
import {repository} from '../../lib/processes.js';
import {exists, read} from '../lib/files.js';

const {eventually} = checks('Luft app');
const SIDEBAR = {role: 'navigation', name: 'Places'};
const SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'rover', 'settings.json']);

const USER_DIRS = GLib.build_filenamev([GLib.get_user_config_dir(), 'user-dirs.dirs']);

export async function withUserFolders(run: () => Promise<void>) {
  const defaults = read(repository('os/image/files/etc/xdg', 'user-dirs.defaults')).trim().split('\n');
  GLib.file_set_contents(USER_DIRS, defaults.map(line => {
    const [name, folder] = line.split('=');
    return `XDG_${name}_DIR="$HOME/${folder}"\n`;
  }).join(''));
  try {
    await run();
  } finally {
    GLib.unlink(USER_DIRS);
  }
}

const documentsShown = (): boolean => !exists(SETTINGS) || JSON.parse(read(SETTINGS)).sidebar.some((entry: {place?: string}) => entry.place === 'documents');

export async function checkPlaces(app: LuftApp) {
  await changes(app, "right-clicking Documents in Rover's sidebar opens its menu", async () => app.click(await app.find({role: 'button', name: 'Documents', within: SIDEBAR}), Clutter.BUTTON_SECONDARY));
  await changes(app, 'Rover takes Documents out of the sidebar', async () => app.click(await app.find({role: 'menuitem', name: 'Remove from sidebar'})));
  await eventually(() => !documentsShown(), 'Rover remembers that Documents left the sidebar');

  await changes(app, "right-clicking Home in Rover's sidebar opens its menu", async () => app.click(await app.find({role: 'button', name: 'Home', within: SIDEBAR}), Clutter.BUTTON_SECONDARY));
  (await app.settle(() => true)).save('rover-sidebar-restore-dark');
  await changes(app, 'Rover puts Documents back in its place', async () => app.click(await app.find({role: 'menuitem', name: 'Show Documents'})));
  await eventually(documentsShown, 'Rover remembers that Documents is back in the sidebar');
  (await app.settle(() => true)).save('rover-sidebar-restored-dark');
}
