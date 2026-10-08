import Clutter from 'gi://Clutter';

import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, press} from '../lib/input.js';
import {gjs, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';

const {eventually} = checks('tray');

async function choose(menu, name) {
  const item = await waitUntil(() => named(name, menu), `${name} shows in the tray menu`);
  await settled();
  click(item);
}

async function openApp(tray, menu) {
  click(tray);
  await eventually(() => menu.visible && named('Chatter', menu), 'the tray panel lists apps by name');
  await choose(menu, 'Chatter');
  await eventually(() => named('Open Chatter', menu) && named('Mute', menu) && !named('Hidden', menu), 'an app opens into its own actions');
}

export async function run() {
  const app = gjs('clients/trayApp.js');
  const tray = named('kestrel-tray');
  await eventually(() => tray.visible && tray.child.get_n_children() === 1, 'the tray shows one grouped button with an app preview');
  await capture('tray');

  const menu = named('kestrel-context-menu');
  await openApp(tray, menu);
  await choose(menu, 'Status');
  await eventually(() => named('Away', menu) && named('Back', menu), 'tray submenus open in place');
  await capture('tray-menu');
  await choose(menu, 'Back');
  await choose(menu, 'Mute');
  await eventually(() => !menu.visible, 'choosing a tray action closes the menu');

  await openApp(tray, menu);
  await eventually(() => descendants(named('Mute', menu)).some(actor => actor.icon_name === 'object-select-symbolic'), 'the tray menu reflects toggled items');
  await choose(menu, 'Open Chatter');
  await eventually(() => !menu.visible, 'Open closes the menu');
  click(tray);
  await eventually(() => menu.visible && named('Chatter open', menu), 'Open activates the app');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the tray menu');

  await stop(app);
  await eventually(() => !tray.visible, 'the tray hides when its last app exits');
}
