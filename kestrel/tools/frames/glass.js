import {dismissImmediately, toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named} from '../checks/lib/actors.js';
import {rest, rightClick} from '../checks/lib/input/input.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import {findWindow, fixture, spawn, waitForWindow} from '../checks/lib/processes.js';
import {eachFrame} from './recorder.js';

const MOVE_FRAMES = 90;
const BLURRED_TITLE = 'Kestrel blurred window';
const BLURRED_SIZE = [900, 600];

let blurred = null;

async function stackGlass() {
  dismissImmediately();
  rest();
  await settled();
  toggleSurface('start');
  await settled();
  rightClick(startItem());
  await waitUntil(() => named('kestrel-context-menu')?.visible, 'a context menu opens over Start');
  await settled();
}

function startItem() {
  const start = named('kestrel-start');
  const visit = actor => actor.name?.startsWith('kestrel-start-item-') && actor.mapped ? actor : actor.get_children().map(visit).find(Boolean);
  return visit(start);
}

async function openBlurredWindow() {
  dismissImmediately();
  rest();
  blurred ??= spawn(['python3', fixture('clients', 'wayland', 'blurClient.py'), BLURRED_TITLE, ...BLURRED_SIZE.map(String)]);
  await waitForWindow(BLURRED_TITLE);
  await settled();
}

const titled = prefix => window => window.get_title()?.startsWith(prefix);

const slide = title => async recorder => {
  const window = findWindow(titled(title));
  const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  const frame = window.get_frame_rect();
  const travel = area.width - frame.width;
  const y = area.y + area.height - frame.height;
  recorder.start();
  await eachFrame(MOVE_FRAMES, step => window.move_frame(true, area.x + Math.round(travel * (0.5 - 0.5 * Math.cos(2 * Math.PI * step / MOVE_FRAMES))), y));
  await recorder.quiet();
};

export const glassInteractions = [
  {name: 'stacked glass over a moving window', prepare: stackGlass, act: slide('Files')},
  {name: 'blurred app window moving', prepare: openBlurredWindow, act: slide(BLURRED_TITLE)},
];
