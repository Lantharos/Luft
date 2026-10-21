import Clutter from 'gi://Clutter';

import {checks} from '../../lib/check.js';
import {press, type} from '../../lib/input/input.js';
import {waitUntil} from '../../lib/wait.js';
import {changes} from '../lib/apps.js';
import {keep, states} from './service.js';

const {require} = checks('Luft app');
const KEEP_TIMEOUT = 30000;

async function open(app, path) {
  await changes(app, 'Ctrl+L lets Rover take an address', () => press(Clutter.KEY_Control_L, Clutter.KEY_l));
  type(path);
  await changes(app, `Rover opens ${path}`, () => press(Clutter.KEY_Return));
}

export async function checkRover(app, drive) {
  await open(app, drive.path);
  const online = await states(drive.path);
  require(online.Documents === 'online' && online['Notes.txt'] === 'online', 'files in a cloud drive start out online only');
  (await app.settle(() => true)).save('rover-cloud-online-dark');
  await keep([`${drive.path}/Documents`]);
  await waitUntil(async () => (await states(drive.path)).Documents === 'local', 'keeping a folder brings it to this device', KEEP_TIMEOUT);
  (await app.settle(() => true)).save('rover-cloud-kept-dark');
  await changes(app, 'right-clicking a cloud folder opens its menu', () => app.click([330, 140], Clutter.BUTTON_SECONDARY));
  (await app.frame()).save('rover-cloud-menu-dark');
  press(Clutter.KEY_Escape);
}
