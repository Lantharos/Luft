import Gio from 'gi://Gio';
import St from 'gi://St';

import {named, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {renderedFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {areaOf} from '../panel/backdrops/coverage.js';
import {sweepBackdrops} from '../panel/backdrops/sweep.js';
import {measureMark} from './button/layers.js';

const {require} = checks('Gust button');
const STYLES = ['default', 'tinted', 'clear', 'monochrome'] as const;
const MIN_BACKDROP_CONTRAST = 2;
const MIN_PARTNER_CONTRAST = 1.4;
const CROP_ZOOM = 4;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

async function measure(label: string) {
  await settled();
  const button = ofType(named('Gust', named('kestrel-panel')!), St.Button);
  const area = areaOf(button);
  const frame = await renderedFrame(area);
  const mark = await measureMark(button.child!.get_children().filter((layer): layer is St.Widget => layer instanceof St.Widget), area);
  const failures = [
    mark.secondary < MIN_BACKDROP_CONTRAST && `its back layer has ${mark.secondary.toFixed(2)}:1 against the taskbar`,
    mark.partners < MIN_PARTNER_CONTRAST && `its layers differ by only ${mark.partners.toFixed(2)}:1`,
    mark.darker !== mark.lightFront && 'its back layer is not the quieter one',
  ].filter(Boolean);
  console.log(`Gust button ${label}: back ${mark.secondary.toFixed(2)}, front ${mark.primary.toFixed(2)}, between ${mark.partners.toFixed(2)}`);
  if (failures.length) frame.saveZoomed(`gust-button-${label}`, CROP_ZOOM);
  return failures.map(failure => `${label}: ${failure}`);
}

export async function run() {
  const failures: string[] = [];
  try {
    await sweepBackdrops(async label => {
      for (const style of STYLES) {
        settings.set_string('app-icon-style', style);
        failures.push(...await measure(`${label}-${style}`));
      }
    });
  } finally {
    settings.reset('app-icon-style');
  }
  require(failures.length === 0, `the Gust button stands out on every wallpaper and taskbar look${failures.length ? `\n${failures.join('\n')}` : ''}`);
}
