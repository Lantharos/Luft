import St from 'gi://St';
import {battery} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, named, ofType, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {gjs, stop} from '../lib/processes.js';
import {renderedFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {contrast} from '../lib/colors.js';
import {areaOf, measureInk} from '../panel/backdrops/coverage.js';
import {sweepBackdrops} from '../panel/backdrops/sweep.js';

const {require, eventually} = checks('taskbar ink');
const TEXT_CONTRAST = 4.5;
const ICON_CONTRAST = 3;
const CROP_ZOOM = 3;
const TRAY_ICON = 'audio-volume-high-symbolic';
const BATTERY = {percentage: 50, status: 'discharging', secondsLeft: 0} as const;

const PARTS: [string, number, string, (button: St.Button) => St.Widget][] = [
  ['clock', TEXT_CONTRAST, 'Notifications and date', button => ofType(button.child, St.Widget)],
  ['status icon', ICON_CONTRAST, 'Quick settings', button => ofType(button.child.get_children().find(child => child instanceof St.Icon && child.visible) ?? null, St.Icon)],
  ['battery', ICON_CONTRAST, 'Quick settings', button => styled('kestrel-battery', button)[0]],
  ['tray icon', ICON_CONTRAST, 'kestrel-tray', button => ofType(button.child.get_first_child(), St.Widget)],
];

function trayIcon() {
  const tray = named('kestrel-tray');
  return tray && ofType(tray, St.Bin).child.get_first_child();
}

async function measure(label: string) {
  await settled();
  const status = existing('kestrel-panel-status');
  (await renderedFrame(areaOf(status))).saveZoomed(`ink-${label}`, CROP_ZOOM);
  const failures: string[] = [];
  const readings = [];
  for (const [part, target, name, glyph] of PARTS) {
    const button = ofType(named(name, status), St.Button);
    const {fill, around} = await measureInk(glyph(button), areaOf(button));
    const ratio = contrast(fill, around);
    readings.push(`${part} ${ratio.toFixed(2)}`);
    if (ratio < target) failures.push(`${label}: the ${part} has ${ratio.toFixed(2)}:1 against the taskbar`);
  }
  console.log(`Taskbar ink ${label}: ${readings.join(', ')}`);
  return failures;
}

export async function run() {
  const app = gjs('clients/apps/trayApp.js', [TRAY_ICON]);
  const failures: string[] = [];
  battery.pin(BATTERY);
  try {
    await eventually(() => {
      const icon = trayIcon();
      return icon instanceof St.Icon && icon.gicon;
    }, 'the tray shows a symbolic app icon');
    await sweepBackdrops(async label => {
      failures.push(...await measure(label));
    });
  } finally {
    battery.pin(undefined);
    await stop(app);
  }
  require(failures.length === 0, `the clock, status icons, battery and tray icons stay readable on every wallpaper and taskbar look${failures.length ? `\n${failures.join('\n')}` : ''}`);
}
