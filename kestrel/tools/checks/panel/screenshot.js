import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {rest} from '../lib/input.js';
import {capture, captureFrame, renderedFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {areaOf} from './backdrops/coverage.js';

const {require, eventually} = checks('screenshot');
const SCHEMES = [['dark', 'prefer-dark'], ['light', 'default']];
const TOLERANCE = 8;
const ZOOM = 2;
const PAST_SCREEN_OUTLINE = 4;

const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});

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
  rest();
  try {
    for (const [scheme, colorScheme] of SCHEMES) {
      interfaceSettings.set_string('color-scheme', colorScheme);
      await checkScheme(scheme);
    }
  } finally {
    interfaceSettings.set_string('color-scheme', saved);
  }
}
