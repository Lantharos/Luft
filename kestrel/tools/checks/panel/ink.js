import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {gjs, stop} from '../lib/processes.js';
import {renderedFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {contrast} from '../system/lib/colors.js';
import {areaOf, measureInk} from './backdrops/coverage.js';
import {sweepBackdrops} from './backdrops/sweep.js';

const {require, eventually} = checks('taskbar ink');
const TEXT_CONTRAST = 4.5;
const ICON_CONTRAST = 3;
const CROP_ZOOM = 3;
const TRAY_ICON = 'audio-volume-high-symbolic';

const PARTS = [
  ['clock', TEXT_CONTRAST, 'Notifications and date', button => button.child],
  ['status icon', ICON_CONTRAST, 'Quick settings', button => button.child.get_first_child()],
  ['tray icon', ICON_CONTRAST, 'kestrel-tray', button => button.child.get_first_child()],
];

async function measure(label) {
  await settled();
  const status = named('kestrel-panel-status');
  (await renderedFrame(areaOf(status))).saveZoomed(`ink-${label}`, CROP_ZOOM);
  const failures = [];
  const readings = [];
  for (const [part, target, name, glyph] of PARTS) {
    const button = named(name, status);
    const {fill, around} = await measureInk(glyph(button), areaOf(button));
    const ratio = contrast(fill, around);
    readings.push(`${part} ${ratio.toFixed(2)}`);
    if (ratio < target) failures.push(`${label}: the ${part} has ${ratio.toFixed(2)}:1 against the taskbar`);
  }
  console.log(`Taskbar ink ${label}: ${readings.join(', ')}`);
  return failures;
}

export async function run() {
  const app = gjs('clients/trayApp.js', [TRAY_ICON]);
  const failures = [];
  try {
    await eventually(() => named('kestrel-tray')?.child.get_first_child()?.gicon, 'the tray shows a symbolic app icon');
    await sweepBackdrops(async label => failures.push(...await measure(label)));
  } finally {
    await stop(app);
  }
  require(failures.length === 0, `the clock, status and tray icons stay readable on every wallpaper and taskbar look${failures.length ? `\n${failures.join('\n')}` : ''}`);
}
