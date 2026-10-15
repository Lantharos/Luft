import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {rest} from '../lib/input.js';
import {captureFrame, renderedFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {measureMark} from './launcher/layers.js';
import {WALLPAPERS} from './launcher/wallpapers.js';

const {require, eventually} = checks('Start button');
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']];
const LOOKS = [['glass', 'glass', false], ['solid', 'solid', false], ['transparent', 'transparent', false], ['accent', 'accent', false], ['black', 'glass', true]];
const STYLES = ['tinted', 'clear', 'default'];
const MIN_BACKDROP_CONTRAST = 2;
const MIN_PARTNER_CONTRAST = 1.4;
const CROP_ZOOM = 4;
const PROBE = 4;
const WALLPAPER_TIMEOUT = 10000;

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});

function launcherArea() {
  const button = named('Start');
  const [x, y] = button.get_transformed_position();
  return {x: Math.round(x), y: Math.round(y), width: Math.round(button.width), height: Math.round(button.height)};
}

const markLayers = () => named('Start').child.get_children();

async function showWallpaper(file) {
  const {x, y, width, height} = Main.layoutManager.primaryMonitor;
  const probe = {x: x + width / 2, y: y + height / 2, width: PROBE, height: PROBE};
  const before = await captureFrame(probe);
  background.set_string('picture-uri', file.get_uri());
  background.set_string('picture-uri-dark', file.get_uri());
  await eventually(async () => !(await captureFrame(probe)).same(before), `${file.get_basename()} becomes the wallpaper`, WALLPAPER_TIMEOUT);
}

function applyLook(look, pureBlack) {
  settings.set_string('taskbar-look', look);
  settings.set_boolean('pure-black', pureBlack);
}

async function measure(label, style, scheme) {
  await settled();
  const area = launcherArea();
  (await renderedFrame(area)).saveZoomed(`launcher-${label}`, CROP_ZOOM);
  const mark = await measureMark(markLayers(), area);
  const painted = style !== 'default';
  const failures = [
    mark.secondary < MIN_BACKDROP_CONTRAST && `its back layer has ${mark.secondary.toFixed(2)}:1 against the taskbar`,
    painted && mark.partners < MIN_PARTNER_CONTRAST && `its layers differ by only ${mark.partners.toFixed(2)}:1`,
    painted && mark.darker !== (scheme === 'dark') && 'its back layer is not the quieter one',
  ].filter(Boolean);
  console.log(`Start button ${label}: back ${mark.secondary.toFixed(2)}, front ${mark.primary.toFixed(2)}, between ${mark.partners.toFixed(2)}`);
  return failures.map(failure => `${label}: ${failure}`);
}

async function measureWallpaper(slug) {
  const failures = [];
  for (const [scheme, colorScheme] of SCHEMES) {
    interfaceSettings.set_string('color-scheme', colorScheme);
    for (const [name, look, pureBlack] of LOOKS) {
      if (pureBlack && scheme === 'light') continue;
      applyLook(look, pureBlack);
      for (const style of STYLES) {
        settings.set_string('app-icon-style', style);
        failures.push(...await measure(`${slug}-${scheme}-${name}-${style}`, style, scheme));
      }
    }
  }
  return failures;
}

export async function run() {
  const saved = {uri: background.get_string('picture-uri'), dark: background.get_string('picture-uri-dark'), scheme: interfaceSettings.get_string('color-scheme')};
  rest();
  const failures = [];
  try {
    for (const [slug, file] of WALLPAPERS) {
      await showWallpaper(file());
      failures.push(...await measureWallpaper(slug));
    }
  } finally {
    for (const key of ['taskbar-look', 'pure-black', 'app-icon-style']) settings.reset(key);
    background.set_string('picture-uri', saved.uri);
    background.set_string('picture-uri-dark', saved.dark);
    interfaceSettings.set_string('color-scheme', saved.scheme);
  }
  require(failures.length === 0, `the Start button stands out on every wallpaper and taskbar look${failures.length ? `\n${failures.join('\n')}` : ''}`);
}
