import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {dismissImmediately, type Monitor} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, firstStyled, named, ofType} from '../../lib/actors.js';
import {press, rightClick} from '../../lib/input/input.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {capture} from '../../lib/screenshots.js';
import {settled} from '../../lib/wait.js';
import {edgeGap, eventually, HEIGHTS, otherMonitor, panel, set, settings} from './taskbar.js';
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
  const slots = () => secondary.get_first_child()!.get_first_child()!.get_children()[1].get_children().filter(slot => slot.width > 0 && slot.height > 0);
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

type DirectInput = {has_direct_input?: (logicalMonitor: {get_number(): number}) => boolean};

function pretendPenDisplay(monitor: Monitor | null) {
  const backend = global.backend as unknown as DirectInput;
  if (monitor) backend.has_direct_input = logicalMonitor => logicalMonitor.get_number() === monitor.index;
  else delete backend.has_direct_input;
  global.backend.emit('direct-input-changed');
}

async function checkPenDisplay(monitor: Monitor) {
  set('taskbar-position', 'left');
  const secondary = existing('kestrel-secondary-panel');
  await eventually(() => panel().height > panel().width && secondary.height > secondary.width, 'both taskbars start on the chosen edge');
  pretendPenDisplay(monitor);
  try {
    await eventually(() => firstStyled('kestrel-tablet-strip', secondary)?.visible === true && secondary.width === monitor.width &&
      secondary.y > monitor.y + monitor.height / 2, 'a pen display gets the touch taskbar along its bottom');
    await eventually(() => panel().height > panel().width && !firstStyled('kestrel-tablet-strip', panel()),
      'the other display keeps the taskbar as it was chosen');
    await capture('pen-display-taskbar');
  } finally {
    pretendPenDisplay(null);
  }
  await eventually(() => !firstStyled('kestrel-tablet-strip', secondary)?.visible && secondary.height > secondary.width,
    'the taskbar goes back to the chosen edge once the pen display is gone');
  settings.reset('taskbar-position');
}

export async function checkDisplays() {
  const monitor = otherMonitor();
  if (!monitor) return;
  await checkSecondaryPanel(monitor);
  await checkPenDisplay(monitor);
  await checkTaskbarDisplays(monitor);
}
