import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import type {Point} from '../../../lib/input/input.js';
import {installBuilt, request, SEASONS, setSetting, setting} from '../../../extensions/lib/extensions.js';
import {show, showEnd} from '../navigation.js';

const {eventually} = checks('Luft app');
const HEAVY: Point = [955, 318];
const VISUALIZER = 'com.lantharos.Visualizer';
const NOW_PLAYING = 'com.lantharos.NowPlaying';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const SOUNDSCAPES = 'com.lantharos.Soundscapes';

async function checkOwnPages(app: LuftApp) {
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
  await installBuilt(SOUNDSCAPES);
  try {
    (await show(app, `extensions/${SOUNDSCAPES.toLowerCase()}`)).save('settings-extension-soundscapes');
  } finally {
    await request('Remove', SOUNDSCAPES);
  }
}

export async function checkExtensions(app: LuftApp) {
  await installBuilt(SEASONS);
  try {
    (await show(app, 'extensions')).save('settings-extensions');
    (await show(app, `extensions/${SEASONS}`)).save('settings-extension-seasons');
    const off = await app.settle(() => true);
    await setSetting(SEASONS, 'on', new GLib.Variant('b', true));
    await app.changes(off, 'turning Seasons on elsewhere shows its other settings in Settings');
    (await app.settle(() => true)).save('settings-extension-seasons-on');
    app.click(HEAVY);
    await eventually(async () => await setting(SEASONS, 'intensity') === 'heavy', 'choosing heavy in Settings makes Seasons heavier in Kestrel');
  } finally {
    await request('Remove', SEASONS);
  }
  await checkOwnPages(app);
}
