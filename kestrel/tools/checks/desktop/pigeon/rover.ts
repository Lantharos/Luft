import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {press, type Point} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {settled} from '../../lib/wait.js';
import {changes, withApp} from '../../apps/lib/apps.js';
import {saveEveryLook} from '../../apps/lib/corners.js';
import {write} from '../../apps/lib/files.js';
import {menuItem} from '../../apps/rover/places.js';
import {listed, request} from '../../extensions/lib/extensions.js';

const {eventually} = checks('Pigeon');
const PIGEON = 'com.lantharos.Pigeon';
const FILE: Point = [330, 104];
const SEND_TO_DEVICE = menuItem(FILE, 10, 2);

/**
 * Opens Send to device in Rover's menu, then turns Pigeon off and finds the
 * entry gone. It never picks a device here: Pigeon also finds real computers on the network, in any order.
 */
export async function checkRover() {
  const file = GLib.build_filenamev([scratch('pigeon', 'Rover'), 'Boarding pass.txt']);
  write(file, 'Gate 14, seat 22A\n');
  await withApp('rover', [GLib.path_get_dirname(file)], async app => {
    await changes(app, 'right-clicking a file in Rover opens its menu', () => app.click(FILE, Clutter.BUTTON_SECONDARY));
    await saveEveryLook(app, 'pigeon-rover-menu');
    await changes(app, 'Send to device shows with Pigeon on and opens the devices', () => app.click(SEND_TO_DEVICE));
    await saveEveryLook(app, 'pigeon-rover-devices');
    press(Clutter.KEY_Escape);
    await request('Disable', PIGEON);
    await settled();
    await changes(app, 'right-clicking the file with Pigeon off opens its menu', () => app.click(FILE, Clutter.BUTTON_SECONDARY));
    await saveEveryLook(app, 'pigeon-rover-off');
    press(Clutter.KEY_Escape);
  });
  await request('Enable', PIGEON);
  await eventually(async () => (await listed(PIGEON))?.state === 'running', 'Pigeon runs again once turned back on');
}
