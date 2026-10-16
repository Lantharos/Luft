import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {rest} from '../lib/input.js';
import {inputMethodSettled} from '../lib/inputMethod.js';
import {capture, captureFrame, renderedFrame} from '../lib/screenshots.js';
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

const fadedIn = manager => manager._container.get_children().every(actor => actor === manager.backgroundActor);

async function showStripes() {
  const uri = STRIPES().get_uri();
  const before = await wallpaperAccent();
  const managers = Main.layoutManager._bgManagers;
  const shown = Promise.all(managers.map(loaded));
  for (const key of WALLPAPER_KEYS) background.set_string(key, uri);
  await within(shown, WALLPAPER_TIMEOUT, 'the striped wallpaper loads');
  await eventually(() => managers.every(fadedIn), 'the striped wallpaper fades in completely', WALLPAPER_TIMEOUT);
  await eventually(async () => await wallpaperAccent() !== before, 'the striped wallpaper sets the accent for both styles', WALLPAPER_TIMEOUT);
}

async function openScreenshotTool() {
  Main.screenshotUI.open();
  await eventually(() => Main.screenshotUI.visible && Main.screenshotUI.opacity === 255, 'the screenshot tool opens');
  Main.screenshotUI._screenButton.checked = true;
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

export async function run() {
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
