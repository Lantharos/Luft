import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {shownAndRepainted} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require} = checks('repaints');
const TITLE = 'Kestrel repaints';
const stale = [];

async function matchesRepaint(label) {
  await settled();
  const [shown, repainted] = await shownAndRepainted();
  const {count, box} = shown.differences(repainted);
  if (!count) return;
  stale.push(`${label} (${count} pixels in ${box.x1},${box.y1} to ${box.x2},${box.y2})`);
  shown.save(`repaints-${stale.length}-shown`);
  repainted.save(`repaints-${stale.length}-repainted`);
}

function reachUnderTaskbar(window, depth) {
  const [, top] = named('kestrel-panel').get_transformed_position();
  const frame = window.get_frame_rect();
  window.move_frame(true, 120, Math.round(top + depth - frame.height));
}

async function animate(window, place) {
  reachUnderTaskbar(window, place.depth);
  await matchesRepaint(`moving a window ${place.name}`);
  window.maximize();
  await matchesRepaint(`maximizing a window ${place.name}`);
  window.unmaximize();
  await matchesRepaint(`restoring a window ${place.name}`);
  window.minimize();
  await matchesRepaint(`minimizing a window ${place.name}`);
  window.unminimize();
  await matchesRepaint(`unminimizing a window ${place.name}`);
  window.minimize();
  await pause(80);
  window.unminimize();
  await matchesRepaint(`unminimizing a window ${place.name} 80 ms into minimizing`);
}

export async function run() {
  const client = gjs('clients/windows/stripedWindow.js', [TITLE, '900', '520']);
  const window = await waitForWindow(TITLE);
  await matchesRepaint('opening a window');
  for (const place of [{name: 'halfway under the taskbar', depth: 260}, {name: 'just under the top of the taskbar', depth: 6}])
    await animate(window, place);
  window.delete(global.get_current_time());
  await matchesRepaint('closing a window under the taskbar');
  await stop(client);
  require(!stale.length, `the screen matches a full repaint after every window animation${stale.length ? `, but not after ${stale.join('; ')}` : ''}`);
}
