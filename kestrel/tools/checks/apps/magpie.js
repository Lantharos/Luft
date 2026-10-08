import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {fixture, scratch} from '../lib/processes.js';
import {changes, withApp} from './lib/apps.js';
import {checkPalette, useScheme, withPalette} from './lib/palette.js';

const {require, eventually} = checks('Luft app');
const SAMPLES = [
  {name: 'system', source: '/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Regular.ttf', tabs: true},
  {name: 'woff2', source: fixture('fonts', 'MagpieSample-Regular.woff2'), install: true},
];
const TAB_Y = 77;
const TAB_WIDTH = 113;
const TABS = {preview: -1, characters: 0, details: 1};
const HEADER_Y = 29;
const HEADER_BUTTON_FROM_RIGHT = 198;
const INSTALLED_LABEL = {right: 340, y: 15, width: 90, height: 28};
const LABEL_TOLERANCE = 8;
const SURFACE_SHARE = 0.5;
const INSTALLED = GLib.build_filenamev([GLib.get_user_data_dir(), 'fonts', 'MagpieSample-Regular.otf']);

function copySample(source) {
  const target = scratch('luft-fonts', GLib.path_get_basename(source));
  GLib.mkdir_with_parents(GLib.path_get_dirname(target), 0o755);
  Gio.File.new_for_path(source).copy(Gio.File.new_for_path(target), Gio.FileCopyFlags.OVERWRITE, null, null);
  return target;
}

const tab = (app, name) => [app.window.get_frame_rect().width / 2 + TABS[name] * TAB_WIDTH, TAB_Y];
const headerButton = app => [app.window.get_frame_rect().width - HEADER_BUTTON_FROM_RIGHT, HEADER_Y];

function installedLabel(app) {
  const {width} = app.window.get_frame_rect();
  return app.area({x: width - INSTALLED_LABEL.right, y: INSTALLED_LABEL.y, width: INSTALLED_LABEL.width, height: INSTALLED_LABEL.height});
}

async function pressHeaderButton(app, label, done, shown) {
  app.click(headerButton(app));
  await eventually(done, label);
  await eventually(async () => shown(await app.frame(installedLabel(app))), `${label}, and its header says so`);
}

async function checkInstall(app) {
  const missing = await app.frame(installedLabel(app));
  const installed = frame => !frame.looksLike(missing, LABEL_TOLERANCE);
  await pressHeaderButton(app, 'magpie installs a font into the fonts folder', () => GLib.file_test(INSTALLED, GLib.FileTest.IS_REGULAR), installed);
  (await app.settle(() => true)).save('magpie-font-installed-dark');
  await pressHeaderButton(app, 'magpie removes a font it installed', () => !GLib.file_test(INSTALLED, GLib.FileTest.EXISTS),
    frame => !installed(frame));
}

async function checkTabs(app) {
  for (const name of ['characters', 'details']) {
    await changes(app, `magpie shows a font's ${name}`, () => app.click(tab(app, name)));
    (await app.frame()).save(`magpie-font-${name}-dark`);
  }
  await changes(app, 'magpie goes back to the font preview', () => app.click(tab(app, 'preview')));
}

async function checkSample({name, source, tabs, install}, home, palette) {
  const covers = surface => frame => frame.share([surface], 2) >= SURFACE_SHARE;
  useScheme('dark');
  await withApp('magpie', [copySample(source)], async app => {
    const shown = frame => !frame.looksLike(home) && covers(palette.dark.surface)(frame);
    const dark = await app.settle(shown);
    dark.save(`magpie-font-${name}-dark`);
    require(shown(dark), `magpie opens a ${name} font file as a font view`);
    if (tabs) await checkTabs(app);
    if (install) await checkInstall(app);

    useScheme('light');
    const light = await app.settle(covers(palette.light.surface));
    light.save(`magpie-font-${name}-light`);
    require(covers(palette.light.surface)(light), `magpie shows the ${name} font in the light style`);
  });
}

export async function run() {
  await withPalette(async palette => {
    const home = await withApp('magpie', [], app => checkPalette(app, palette, {accent: true}));
    for (const sample of SAMPLES) await checkSample(sample, home, palette);
  });
}
