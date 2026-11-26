import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {press} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {changes, withApp} from '../../apps/lib/apps.js';
import {write} from '../../apps/lib/files.js';
import type {Nearby} from './nearby.js';
import {NEARBY, nearbyId} from './transfers.js';

const {eventually} = checks('Post');

export async function checkRover(nearby: Nearby) {
  await nearbyId();
  const file = GLib.build_filenamev([scratch('post', 'Rover'), 'Boarding pass.txt']);
  write(file, 'Gate 14, seat 22A\n');
  await withApp('rover', [GLib.path_get_dirname(file)], async app => {
    await changes(app, 'right-clicking a file in Rover opens its menu', async () => app.click(await app.find({text: 'Boarding pass.txt'}), Clutter.BUTTON_SECONDARY));
    await changes(app, `Send to device opens the devices nearby, ${NEARBY} among them`, async () => app.click(await app.find({role: 'menuitem', name: 'Send to device'})));
    (await app.settle(() => true)).save('post-rover-devices');
    press(Clutter.KEY_Escape);
  });
  await eventually(async () => (await nearby.devices()).length > 0, 'the computer nearby is still there');
}
