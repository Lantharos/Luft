import Clutter from 'gi://Clutter';
import {dismissImmediately} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named} from '../../lib/actors.js';
import {press, rightClick} from '../../lib/input.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {capture} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {bottomGap, eventually, HEIGHTS, otherMonitor, set} from './taskbar.js';

const within = (actor, monitor) => actor.x >= monitor.x && actor.x + actor.width <= monitor.x + monitor.width;

async function checkSecondaryPanel(monitor) {
  const menu = named('kestrel-context-menu');
  rightClick([monitor.x + 60, monitor.y + 60]);
  await eventually(() => menu.visible && within(menu, monitor), 'the desktop menu stays on the display it was opened on');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the desktop menu');

  const panel = named('kestrel-secondary-panel');
  await eventually(() => panel?.visible && panel.x === monitor.x && panel.y + panel.height === monitor.y + monitor.height, 'every display has its own taskbar');
  named('Start', panel).emit('clicked', Clutter.BUTTON_PRIMARY);
  const start = named('kestrel-start');
  await eventually(() => start.visible && within(start, monitor), 'Start opens on the display whose taskbar was used');
  await capture('secondary-start');
  dismissImmediately();
}

async function checkTaskbarDisplays(monitor) {
  await eventually(() => named('kestrel-secondary-panel') && bottomGap(monitor) === HEIGHTS.normal, 'every display reserves room for its taskbar');
  set('taskbar-displays', 'primary');
  await eventually(() => !named('kestrel-secondary-panel') && bottomGap(monitor) === 0, 'the taskbar can stay on the main display only');
  set('taskbar-displays', 'all');
  await eventually(() => named('kestrel-secondary-panel'), 'the other display gets its taskbar back');
  const secondary = named('kestrel-secondary-panel');
  const slots = () => secondary.get_first_child().get_children()[1].get_children().filter(slot => slot.width > 0);
  await settled();
  const pinned = slots().length;
  const app = gjs('clients/window.js');
  await waitForWindow('Kestrel window check');
  await eventually(() => slots().length === pinned + 1, 'the other taskbar lists apps running on any display');
  set('taskbar-windows-per-display', true);
  await eventually(() => slots().length === pinned, 'each display can show only its own windows on its taskbar');
  set('taskbar-windows-per-display', false);
  await stop(app);
}

export async function checkDisplays() {
  const monitor = otherMonitor();
  if (!monitor) return;
  await checkSecondaryPanel(monitor);
  await checkTaskbarDisplays(monitor);
}
