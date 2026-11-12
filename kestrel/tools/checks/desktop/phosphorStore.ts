import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {installBuilt, listed, request} from '../extensions/lib/extensions.js';
import {attachedEffects, choose, nothingAttached, PHOSPHOR} from './phosphor/effects.js';

const {eventually} = checks('phosphor store pictures');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

type Choice = boolean | number | string | string[];

const OFF: [string, Choice][] = [['border', 'off'], ['overlay', 'off'], ['desktop-crt', false], ['crt-curvature', 0], ['grade', 'off'], ['bloom', 0], ['shadow-boost', 0], ['surface-lines', 'off'], ['app-lines', 'none']];

async function look(choices: [string, Choice][]) {
  for (const [key, value] of [...OFF, ...choices]) await choose(key, value);
  await settled();
  await pause(600);
}

function place(window: Meta.Window, x: number, y: number, width: number, height: number) {
  window.unmaximize();
  window.move_resize_frame(true, x, y, width, height);
}

async function pictures() {
  await choose('filters-captured', true);
  await look([['border', 'gradient'], ['border-color', '#8bf58a'], ['border-second-color', '#5fd4ff'], ['border-width', 3], ['overlay', 'bezel'], ['overlay-strength', 0.5]]);
  await eventually(() => attachedEffects().overlays > 0, 'borders are on');
  await capture('store-windows');
  await look([['desktop-crt', true], ['crt-curvature', 0.6], ['crt-scanlines', 0.6], ['crt-mask', 0.35]]);
  await eventually(() => attachedEffects().views > 0, 'the CRT is on');
  await capture('store-crt');
  await look([['bloom', 0.7], ['grade', 'teal-orange'], ['shadow-boost', 0.3]]);
  await capture('store-bloom');
  await look([['surface-lines', 'shimmer'], ['surface-color', '#8bf58a'], ['surface-places', ['taskbar', 'quick-settings']], ['app-lines', 'scanlines']]);
  toggleSurface('quick');
  await pause(800);
  await capture('store-taskbar');
  toggleSurface('quick');
  await look([]);
  await eventually(nothingAttached, 'everything comes off');
}

export async function run() {
  await installBuilt(PHOSPHOR);
  await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
  try {
    await withApp('rover', [], rover => withApp('settings', [], async settings => {
      place(rover.window, 80, 70, 860, 560);
      place(settings.window, 500, 190, 860, 620);
      await settled();
      await pictures();
      rover.window.minimize();
      place(settings.window, 192, 90, 1056, 720);
      await settled();
      (await show(settings, `extensions/${PHOSPHOR.toLowerCase()}`)).save('store-settings');
    }));
  } finally {
    await request('Remove', PHOSPHOR);
    for (const key of ['extension-settings', 'disabled-extensions']) kestrel.reset(key);
  }
}
