import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {pause} from '../../../lib/wait.js';
import type {Point} from '../../../lib/input/input.js';
import {installBuilt, listed, request, SEASONS, setSetting, setting} from '../../../extensions/lib/extensions.js';
import {installOwn} from '../../../extensions/lib/sandbox.js';
import {placeApps, TAILOR} from '../../../extensions/lib/tailor.js';
import {scrollDown, scrollToEnd, show, showEnd} from '../navigation.js';
import {checkUnreviewed} from './unreviewed.js';

const {eventually, require} = checks('Luft app');
const HEAVY: Point = [955, 318];
const LEFT_EDGE: Point = [902, 236];
const RIGHT_EDGE: Point = [962, 236];
const VISUALIZER = 'com.lantharos.Visualizer';
const NOW_PLAYING = 'com.lantharos.NowPlaying';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const SOUNDSCAPES = 'com.lantharos.Soundscapes';
const STRAYS = 'com.lantharos.Strays';
const PLAYTHINGS = 'com.lantharos.Playthings';
const KEYSTROKES = 'com.lantharos.Keystrokes';
const PRIVACY_SCROLL_STEPS = 4;
const SANDBOXED = 'com.example.Sandboxed';

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
    const nowPlaying = await show(app, `extensions/${NOW_PLAYING.toLowerCase()}`);
    nowPlaying.save('settings-extension-now-playing');
    (await scrollToEnd(app, nowPlaying)).save('settings-extension-now-playing-place');
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
    const strays = await show(app, `extensions/${STRAYS.toLowerCase()}`);
    strays.save('settings-extension-strays');
    (await scrollToEnd(app, strays)).save('settings-extension-strays-end');
  } finally {
    await request('Remove', STRAYS);
  }
  await installBuilt(PLAYTHINGS);
  try {
    await setSetting(PLAYTHINGS, 'ambient', new GLib.Variant('b', false));
    const playthings = await show(app, `extensions/${PLAYTHINGS.toLowerCase()}`);
    playthings.save('settings-extension-playthings');
    (await scrollToEnd(app, playthings)).save('settings-extension-playthings-end');
  } finally {
    await request('Remove', PLAYTHINGS);
  }
  placeApps();
  GLib.mkdir_with_parents(GLib.build_filenamev([GLib.get_user_data_dir(), 'flatpak', 'app', 'com.spotify.Client']), 0o755);
  await installBuilt(TAILOR);
  try {
    (await show(app, `extensions/${TAILOR.toLowerCase()}`, 'it lists the apps it found, each with its switch')).save('settings-extension-tailor');
  } finally {
    await request('Remove', TAILOR);
  }
  await installBuilt(KEYSTROKES);
  try {
    (await showEnd(app, 'sound')).save('settings-sound-keystrokes');
    const page = await show(app, `extensions/${KEYSTROKES.toLowerCase()}`);
    page.save('settings-extension-keystrokes');
    const privacy = await scrollDown(app, page, PRIVACY_SCROLL_STEPS);
    privacy.save('settings-extension-keystrokes-privacy');
    (await scrollToEnd(app, privacy)).save('settings-extension-keystrokes-end');
  } finally {
    await request('Remove', KEYSTROKES);
  }
}

async function checkSandboxedPage(app: LuftApp) {
  installOwn('sandboxed', SANDBOXED);
  await request('Reload', SANDBOXED);
  try {
    await eventually(async () => (await listed(SANDBOXED))?.state === 'running', 'an extension from the account’s own folder runs in its sandbox', 20000);
    (await show(app, `extensions/${SANDBOXED.toLowerCase()}`)).save('settings-extension-sandboxed');
  } finally {
    await request('Remove', SANDBOXED);
  }
}

export async function checkExtensions(app: LuftApp) {
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
    kestrel.reset('extension-settings');
  }
  await checkOwnPages(app);
  await checkSandboxedPage(app);
  await checkUnreviewed(app);
}
