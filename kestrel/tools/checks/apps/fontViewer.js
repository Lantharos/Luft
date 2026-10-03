import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, sleep} from './luftApp.js';

const REPOSITORY = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', '..', '..']);
const SAMPLES = [
  {name: 'system', source: '/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Regular.ttf', tabs: true},
  {name: 'woff2', source: GLib.build_filenamev([REPOSITORY, 'packages/ui/fonts/OpenRunde-Regular.woff2']), install: true},
];
const LOADING = 800;
const TAB_Y = 77;
const TAB_WIDTH = 113;
const TABS = {preview: -1, characters: 0, details: 1};
const HEADER_Y = 29;
const HEADER_BUTTON_FROM_RIGHT = 198;
const BUSY = 200;
const INSTALLED_NAME = 'OpenRunde-Regular.otf';

function copySample(source) {
  const folder = GLib.build_filenamev([GLib.get_user_cache_dir(), 'luft-fonts']);
  GLib.mkdir_with_parents(folder, 0o755);
  const target = GLib.build_filenamev([folder, GLib.path_get_basename(source)]);
  Gio.File.new_for_path(source).copy(Gio.File.new_for_path(target), Gio.FileCopyFlags.OVERWRITE, null, null);
  return target;
}

function clickAt(pointer, x, y) {
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), x, y);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
}

function click(pointer, app, tab) {
  const {x, y, width} = app.window.get_frame_rect();
  clickAt(pointer, x + width / 2 + TABS[tab] * TAB_WIDTH, y + TAB_Y);
}

async function pressHeaderButton(app, pointer) {
  const {x, y, width} = app.window.get_frame_rect();
  const before = await app.frame();
  clickAt(pointer, x + width - HEADER_BUTTON_FROM_RIGHT, y + HEADER_Y);
  await sleep(BUSY);
  const busy = await app.frame();
  return app.settle(frame => !frame.looksLike(before) && !frame.looksLike(busy));
}

async function checkInstall(app, {require, output, pointer}) {
  const installedFile = GLib.build_filenamev([GLib.get_user_data_dir(), 'fonts', INSTALLED_NAME]);
  const installed = await pressHeaderButton(app, pointer);
  installed.save(`${output}/magpie-font-installed-dark.png`);
  require(GLib.file_test(installedFile, GLib.FileTest.IS_REGULAR), 'magpie installs a font into the fonts folder');

  await pressHeaderButton(app, pointer);
  require(!GLib.file_test(installedFile, GLib.FileTest.EXISTS), 'magpie removes a font it installed');
}

async function checkTabs(app, preview, {require, output, pointer}) {
  let previous = preview;
  for (const tab of ['characters', 'details']) {
    click(pointer, app, tab);
    const shown = await app.settle(frame => !frame.looksLike(previous));
    shown.save(`${output}/magpie-font-${tab}-dark.png`);
    require(!shown.looksLike(previous), `magpie shows a font's ${tab}`);
    previous = shown;
  }
  click(pointer, app, 'preview');
  await app.settle(frame => !frame.looksLike(previous));
}

async function checkSample({name, source, tabs, install}, home, context) {
  const {palette, styles, require, output} = context;
  const covers = surface => frame => frame.share([surface], 2) >= 0.5;
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('magpie', [copySample(source)]);
  try {
    await app.open();
    await app.settle(frame => !frame.same(home));
    await sleep(LOADING);
    const dark = await app.settle(covers(palette.dark.surface));
    dark.save(`${output}/magpie-font-${name}-dark.png`);
    require(!dark.same(home) && covers(palette.dark.surface)(dark), `magpie opens a ${name} font file as a font view`);
    if (tabs) await checkTabs(app, dark, context);
    if (install) await checkInstall(app, context);

    styles.interface.set_string('color-scheme', 'prefer-light');
    const light = await app.settle(covers(palette.light.surface));
    light.save(`${output}/magpie-font-${name}-light.png`);
    require(covers(palette.light.surface)(light), `magpie shows the ${name} font in the light style`);
  } finally {
    await app.close();
  }
}

export async function checkFontViewer(home, context) {
  for (const sample of SAMPLES) await checkSample(sample, home, context);
}
