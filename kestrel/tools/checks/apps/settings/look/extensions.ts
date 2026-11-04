import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {pause} from '../../../lib/wait.js';
import type {Point} from '../../../lib/input/input.js';
import {installBuilt, request, SEASONS, setSetting, setting} from '../../../extensions/lib/extensions.js';
import {scrollToEnd, show, showEnd} from '../navigation.js';

const {eventually, require} = checks('Luft app');
const HEAVY: Point = [955, 318];
const LEFT_EDGE: Point = [902, 291];
const RIGHT_EDGE: Point = [962, 291];
const VISUALIZER = 'com.lantharos.Visualizer';
const NOW_PLAYING = 'com.lantharos.NowPlaying';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const SOUNDSCAPES = 'com.lantharos.Soundscapes';
const STRAYS = 'com.lantharos.Strays';

async function checkOwnPages(app: LuftApp) {
  await installBuilt(VISUALIZER);
  await installBuilt(NOW_PLAYING);
  try {
    const top = await show(app, `extensions/${VISUALIZER.toLowerCase()}`);
    top.save('settings-extension-visualizer');
    const oneEdge = await scrollToEnd(app, top);
    oneEdge.save('settings-extension-visualizer-one-edge');
    await setSetting(VISUALIZER, 'edges', new GLib.Variant('as', ['top', 'bottom', 'right']));
    await app.changes(oneEdge, 'the edges picked elsewhere show as picked in Settings');
    (await app.settle(() => true)).save('settings-extension-visualizer-edges');
    app.click(LEFT_EDGE);
    await eventually(async () => String(await setting(VISUALIZER, 'edges')) === 'top,bottom,left,right', 'clicking an edge adds it to the others');
    await setSetting(VISUALIZER, 'edges', new GLib.Variant('as', ['right']));
    await app.settle(() => true);
    app.click(RIGHT_EDGE);
    await pause(300);
    require(String(await setting(VISUALIZER, 'edges')) === 'right', 'the last edge can’t be turned off');
    (await showEnd(app, 'appearance')).save('settings-appearance-extension-rows');
    (await show(app, `extensions/${NOW_PLAYING.toLowerCase()}`)).save('settings-extension-now-playing');
    (await showEnd(app, `extensions/${NOW_PLAYING.toLowerCase()}`)).save('settings-extension-now-playing-place');
    await show(app, 'extensions');
    const compact = await show(app, `extensions/${NOW_PLAYING.toLowerCase()}`, 'the compact layout offers what shows under the title');
    await setSetting(NOW_PLAYING, 'layout', new GLib.Variant('s', 'cover'));
    await app.changes(compact, 'just the cover has no title to set up');
    const cover = await app.settle(() => true);
    cover.save('settings-extension-now-playing-cover');
    await setSetting(NOW_PLAYING, 'layout', new GLib.Variant('s', 'full'));
    await app.changes(cover, 'the wide layout offers the width of the title again');
    (await app.settle(() => true)).save('settings-extension-now-playing-wide');
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
  await installBuilt(STRAYS);
  try {
    (await show(app, `extensions/${STRAYS.toLowerCase()}`)).save('settings-extension-strays');
    (await showEnd(app, `extensions/${STRAYS.toLowerCase()}`)).save('settings-extension-strays-end');
  } finally {
    await request('Remove', STRAYS);
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
    const rain = await app.settle(() => true);
    await setSetting(SEASONS, 'effect', new GLib.Variant('s', 'snow'));
    await app.changes(rain, 'snow has no rain color or sound, and their section goes with them');
    (await app.settle(() => true)).save('settings-extension-seasons-snow');
  } finally {
    await request('Remove', SEASONS);
  }
  await checkOwnPages(app);
}
