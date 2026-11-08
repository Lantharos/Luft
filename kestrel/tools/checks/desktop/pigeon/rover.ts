import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {descendants, named} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {press, type Point} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {settled} from '../../lib/wait.js';
import {changes, withApp} from '../../apps/lib/apps.js';
import {saveEveryLook} from '../../apps/lib/corners.js';
import {write} from '../../apps/lib/files.js';
import {menuItem} from '../../apps/rover/places.js';
import {listed, request} from '../../extensions/lib/extensions.js';

const {require, eventually} = checks('Pigeon');
const PIGEON = 'com.lantharos.Pigeon';
const FILE: Point = [330, 104];
const SEND_TO_DEVICE = menuItem(FILE, 10, 2);

const icons = (actor: Clutter.Actor) => descendants(actor).filter(child => child instanceof St.Icon && child.mapped);
const left = (actor: Clutter.Actor) => Math.round(actor.get_transformed_extents().get_x());
const right = (actor: Clutter.Actor) => left(actor) + Math.round(actor.get_transformed_extents().get_width());

function islandOf(actor: Clutter.Actor): Clutter.Actor {
  for (let parent = actor.get_parent(); parent; parent = parent.get_parent())
    if (parent instanceof St.BoxLayout && parent.has_style_class_name('kestrel-taskbar')) return parent;
  throw new Error('The element sits in no taskbar island');
}

/** Pigeon's icon sits as far in from the edges of its element as the network and volume icons sit in their button. */
export async function checkSpacing(element: Clutter.Actor) {
  await eventually(() => element.get_transition('width') === null, 'Pigeon has finished coming into the taskbar');
  const status = named('kestrel-taskbar-status')!;
  const [own] = icons(element);
  const statusIcons = icons(status).sort((a, b) => left(a) - left(b));
  const inset = [left(own!) - left(element), right(element) - right(own!)];
  const statusInset = [left(statusIcons[0]!) - left(status), right(status) - right(statusIcons.at(-1)!)];
  const island = icons(islandOf(element)).sort((a, b) => left(a) - left(b));
  const gaps = island.slice(1).map((icon, index) => left(icon) - right(island[index]!));
  console.log(`Pigeon spacing: its icon ${inset.join('/')}px in from its edges, the status icons ${statusInset.join('/')}px, gaps between the icons of its island ${gaps.join(', ')}px`);
  require(inset.join() === statusInset.join(), 'Pigeon’s icon sits as far from its edges as the status icons do');
}

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
