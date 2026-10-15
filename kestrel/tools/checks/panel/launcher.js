import Gio from 'gi://Gio';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {renderedFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {areaOf} from './backdrops/coverage.js';
import {sweepBackdrops} from './backdrops/sweep.js';
import {measureMark} from './launcher/layers.js';

const {require} = checks('Start button');
const STYLES = ['tinted', 'clear', 'default'];
const MIN_BACKDROP_CONTRAST = 2;
const MIN_PARTNER_CONTRAST = 1.4;
const CROP_ZOOM = 4;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

async function measure(label, style, scheme) {
  await settled();
  const button = named('Start');
  const area = areaOf(button);
  (await renderedFrame(area)).saveZoomed(`launcher-${label}`, CROP_ZOOM);
  const mark = await measureMark(button.child.get_children(), area);
  const painted = style !== 'default';
  const failures = [
    mark.secondary < MIN_BACKDROP_CONTRAST && `its back layer has ${mark.secondary.toFixed(2)}:1 against the taskbar`,
    painted && mark.partners < MIN_PARTNER_CONTRAST && `its layers differ by only ${mark.partners.toFixed(2)}:1`,
    painted && mark.darker !== (scheme === 'dark') && 'its back layer is not the quieter one',
  ].filter(Boolean);
  console.log(`Start button ${label}: back ${mark.secondary.toFixed(2)}, front ${mark.primary.toFixed(2)}, between ${mark.partners.toFixed(2)}`);
  return failures.map(failure => `${label}: ${failure}`);
}

export async function run() {
  const failures = [];
  try {
    await sweepBackdrops(async (label, scheme) => {
      for (const style of STYLES) {
        settings.set_string('app-icon-style', style);
        failures.push(...await measure(`${label}-${style}`, style, scheme));
      }
    });
  } finally {
    settings.reset('app-icon-style');
  }
  require(failures.length === 0, `the Start button stands out on every wallpaper and taskbar look${failures.length ? `\n${failures.join('\n')}` : ''}`);
}
