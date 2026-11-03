import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import type {Point} from '../../../lib/input/input.js';
import {installBuilt, RAIN, request, setSetting, setting} from '../../../extensions/lib/extensions.js';
import {show, showEnd} from '../navigation.js';

const {eventually} = checks('Luft app');
const RAIN_SWITCH: Point = [972, 308];
const VISUALIZER = 'com.lantharos.Visualizer';
const NOW_PLAYING = 'com.lantharos.NowPlaying';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

async function checkOwnPage(app: LuftApp) {
  await installBuilt(VISUALIZER);
  await installBuilt(NOW_PLAYING);
  try {
    (await show(app, `extensions/${VISUALIZER.toLowerCase()}`)).save('settings-extension-visualizer');
    (await showEnd(app, 'appearance')).save('settings-appearance-extension-rows');
    (await show(app, `extensions/${NOW_PLAYING.toLowerCase()}`)).save('settings-extension-now-playing');
    (await showEnd(app, `extensions/${NOW_PLAYING.toLowerCase()}`)).save('settings-extension-now-playing-place');
    const bar = await app.settle(() => true);
    kestrel.set_string('taskbar-style', 'separate');
    await app.changes(bar, 'with separate islands, the place points to editing the taskbar');
    (await app.settle(() => true)).save('settings-extension-now-playing-islands');
  } finally {
    kestrel.reset('taskbar-style');
    await request('Remove', VISUALIZER);
    await request('Remove', NOW_PLAYING);
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
