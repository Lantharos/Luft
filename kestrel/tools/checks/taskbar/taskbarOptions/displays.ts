import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {dismissImmediately, type Monitor} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, named, ofType} from '../../lib/actors.js';
import {press, rightClick} from '../../lib/input/input.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {capture} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {edgeGap, eventually, HEIGHTS, otherMonitor, set} from './taskbar.js';
import {boxOf, farSide} from '../../lib/edge.js';

const within = (actor: Clutter.Actor, monitor: Monitor) => actor.x >= monitor.x && actor.x + actor.width <= monitor.x + monitor.width;

async function checkSecondaryPanel(monitor: Monitor) {
  const menu = existing('kestrel-context-menu');
  rightClick([monitor.x + 60, monitor.y + 60]);
  await eventually(() => menu.visible && within(menu, monitor), 'the desktop menu stays on the display it was opened on');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu.visible, 'Escape closes the desktop menu');

  const panel = existing('kestrel-secondary-panel');
  await eventually(() => panel.visible && within(panel, monitor) && farSide(boxOf(panel)) === farSide(monitor), 'every display has its own taskbar');
  ofType(named('Start', panel), St.Button).emit('clicked', Clutter.BUTTON_PRIMARY);
  const start = existing('kestrel-start');
  await eventually(() => start.visible && within(start, monitor), 'Start opens on the display whose taskbar was used');
  await capture('secondary-start');
  dismissImmediately();
}

async function checkTaskbarDisplays(monitor: Monitor) {
  await eventually(() => named('kestrel-secondary-panel') && edgeGap(monitor) === HEIGHTS.normal, 'every display reserves room for its taskbar');
  set('taskbar-displays', 'primary');
  await eventually(() => !named('kestrel-secondary-panel') && edgeGap(monitor) === 0, 'the taskbar can stay on the main display only');
  set('taskbar-displays', 'all');
  await eventually(() => named('kestrel-secondary-panel'), 'the other display gets its taskbar back');
  const secondary = existing('kestrel-secondary-panel');
  const slots = () => secondary.get_first_child()!.get_children()[1].get_children().filter(slot => slot.width > 0 && slot.height > 0);
  await settled();
  const pinned = slots().length;
  const app = gjs('clients/windows/window.js');
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
