import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {hold, press, release} from '../lib/input/input.js';
import {stopAll} from '../lib/processes.js';
import {openWindow} from '../tiling/lib/tiling.js';

const {eventually} = checks('rain');
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const KEYS = ['rain', 'rain-visible', 'rain-sound'];

const raining = () => {
  const sheet = named('kestrel-rain');
  return !!sheet?.visible && sheet.opacity === 255;
};
const dry = () => !named('kestrel-rain')?.visible;

// Super+number slides between workspaces like people switch
async function activate(index: number) {
  hold(Clutter.KEY_Super_L);
  press(Clutter.KEY_1 + index);
  release(Clutter.KEY_Super_L);
  await eventually(() => global.workspace_manager.get_active_workspace_index() === index, `Super+${index + 1} switches to workspace ${index + 1}`);
}

export async function run() {
  // Rain needs animations, which sessions without a GPU turn off
  const forced = global.force_animations;
  global.force_animations = true;
  settings.set_boolean('rain-sound', false);
  settings.set_boolean('rain-visible', true);
  settings.set_boolean('rain', true);
  try {
    await eventually(raining, 'rain falls over the wallpaper');
    const {window} = await openWindow('Covering');
    window.maximize();
    await eventually(dry, 'a maximized window hides the rain');

    const {window: small} = await openWindow('Small', 360, 240);
    small.change_workspace_by_index(1, false);
    await eventually(() => global.workspace_manager.n_workspaces > 2, 'the small window gets a workspace of its own');
    await activate(1);
    await eventually(raining, 'switching to a workspace whose window leaves the wallpaper showing brings the rain back');
    await activate(0);
    await eventually(dry, 'switching back to the maximized window hides it again');
  } finally {
    for (const key of KEYS) settings.reset(key);
    await activate(0).catch(() => {});
    await stopAll();
    global.force_animations = forced;
  }
}
