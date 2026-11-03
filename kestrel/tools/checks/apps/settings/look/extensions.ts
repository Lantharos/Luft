import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import type {Point} from '../../../lib/input/input.js';
import {installBuilt, RAIN, request, setSetting, setting} from '../../../extensions/lib/extensions.js';
import {show, showEnd} from '../navigation.js';

const {eventually} = checks('Luft app');
const RAIN_SWITCH: Point = [972, 308];
const VISUALIZER = 'com.lantharos.Visualizer';

async function checkOwnPage(app: LuftApp) {
  await installBuilt(VISUALIZER);
  try {
    (await show(app, `extensions/${VISUALIZER.toLowerCase()}`)).save('settings-extension-visualizer');
    (await showEnd(app, 'appearance')).save('settings-appearance-extension-rows');
  } finally {
    await request('Remove', VISUALIZER);
  }
}

export async function checkExtensions(app: LuftApp) {
  try {
    (await show(app, 'extensions')).save('settings-extensions');
    (await show(app, `extensions/${RAIN}`)).save('settings-extension-rain');
    const off = await app.settle(() => true);
    await setSetting(RAIN, 'rain', new GLib.Variant('b', true));
    await app.changes(off, 'turning rain on elsewhere shows its other settings in Settings');
    (await app.settle(() => true)).save('settings-extension-rain-on');
    app.click(RAIN_SWITCH);
    await eventually(async () => await setting(RAIN, 'rain') === false, 'the switch in Settings turns rain off in Kestrel');
    await checkOwnPage(app);
  } finally {
    await setSetting(RAIN, 'rain', new GLib.Variant('b', false));
  }
}
