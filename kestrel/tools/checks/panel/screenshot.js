import Gio from 'gi://Gio';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {rest} from '../lib/input/input.js';
import {inputMethodSettled} from '../lib/input/inputMethod.js';
import {capture, captureFrame, renderedFrame, screenshot} from '../lib/screenshots.js';
import {settled, within} from '../lib/wait.js';
import {areaOf} from './backdrops/coverage.js';
import {WALLPAPERS} from './backdrops/wallpapers.js';

const {require, eventually} = checks('screenshot');
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']];
const TOLERANCE = 8;
const ZOOM = 2;
const PAST_SCREEN_OUTLINE = 4;
const WALLPAPER_KEYS = ['picture-uri', 'picture-uri-dark'];
const WALLPAPER_TIMEOUT = 10000;
const INPUT_METHOD_TIMEOUT = 15000;
const STRIPES = Object.fromEntries(WALLPAPERS).stripes;

const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});

const wallpaperAccent = () => property('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance', 'com.lantharos.Kestrel.Appearance', 'WallpaperAccentColor');

const loaded = manager => new Promise(resolve => {
  const id = manager.connect('loaded', () => {
    manager.disconnect(id);
    resolve();
  });
});

const fadedIn = manager => manager.container.get_children().every(actor => actor === manager.backgroundActor);

async function showStripes() {
  const uri = STRIPES().get_uri();
  const before = await wallpaperAccent();
  const managers = Main.layoutManager.backgrounds.managers;
  const shown = Promise.all(managers.map(loaded));
  for (const key of WALLPAPER_KEYS) background.set_string(key, uri);
  await within(shown, WALLPAPER_TIMEOUT, 'the striped wallpaper loads');
  await eventually(() => managers.every(fadedIn), 'the striped wallpaper fades in completely', WALLPAPER_TIMEOUT);
  await eventually(async () => await wallpaperAccent() !== before, 'the striped wallpaper sets the accent for both styles', WALLPAPER_TIMEOUT);
}

async function openScreenshotTool() {
  Main.screenshotUI.open();
  await eventually(() => Main.screenshotUI.visible && Main.screenshotUI.opacity === 255, 'the screenshot tool opens');
  Main.screenshotUI.panel.screenButton.checked = true;
  await settled();
}

async function closeScreenshotTool() {
  Main.screenshotUI.close(true);
  await eventually(() => !Main.screenshotUI.visible && Main.modalCount === 0, 'the screenshot tool closes');
}

const insideScreenOutline = ({x, y, width, height}) =>
  ({x: x + PAST_SCREEN_OUTLINE, y, width: width - 2 * PAST_SCREEN_OUTLINE, height: height - PAST_SCREEN_OUTLINE});

async function checkScheme(scheme) {
  await settled();
  const area = insideScreenOutline(areaOf(named('kestrel-panel')));
  const onScreen = await renderedFrame(area);
  const shot = await captureFrame(area);
  await openScreenshotTool();
  let frozen;
  try {
    await capture(`screenshot-tool-${scheme}`);
    frozen = await renderedFrame(area);
  } finally {
    await closeScreenshotTool();
  }
  for (const [frame, suffix] of [[onScreen, ''], [shot, '-saved'], [frozen, '-tool']])
    frame.saveZoomed(`screenshot-taskbar-${scheme}${suffix}`, ZOOM);
  require(shot.looksLike(onScreen, TOLERANCE), `a ${scheme} screenshot shows the taskbar as it is on screen`);
  require(frozen.looksLike(onScreen, TOLERANCE), `the ${scheme} taskbar keeps its look under the screenshot tool`);
}

const EMPTY_AREAS = [{x: 0, y: 0, width: 0, height: 0}, {x: 10, y: 10, width: -4, height: 20}];
const PROBE = {x: 0, y: 0, width: 16, height: 16};

async function refuses(area) {
  try {
    await screenshot(area);
    return false;
  } catch (error) {
    return error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.INVALID_ARGUMENT);
  }
}

async function checkEmptyAreas() {
  for (const area of EMPTY_AREAS)
    require(await refuses(area), `a ${area.width}x${area.height} screenshot fails with an error`);
  require((await screenshot(PROBE)).get_size() > 0, 'Kestrel keeps taking screenshots after refusing empty ones');
}

export async function run() {
  await checkEmptyAreas();
  const saved = interfaceSettings.get_string('color-scheme');
  const wallpapers = WALLPAPER_KEYS.map(key => [key, background.get_string(key)]);
  rest();
  try {
    await eventually(inputMethodSettled, 'IBus has settled, so the taskbar shows its final input source', INPUT_METHOD_TIMEOUT);
    await showStripes();
    for (const [scheme, colorScheme] of SCHEMES) {
      interfaceSettings.set_string('color-scheme', colorScheme);
      await checkScheme(scheme);
    }
  } finally {
    interfaceSettings.set_string('color-scheme', saved);
    for (const [key, uri] of wallpapers) background.set_string(key, uri);
  }
}
