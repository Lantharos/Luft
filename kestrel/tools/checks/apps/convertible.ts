import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {chord, drag, rest, type Point} from '../lib/input/input.js';
import {repository, scratch} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {withApp} from './lib/apps.js';
import {children, exists, read} from './lib/files.js';
import {checkPalette, saveBothStyles, withPalette, type Palette} from './lib/palette.js';

const {require, eventually} = checks('Luft app');
const CONVERT_TIMEOUT = 30000;
const SETTLE = 1500;
const FIRST_SUGGESTION: Point = [800, 95];
const QUEUE_BUTTON: Point = [943, 26];
const EDIT_MODE: Point = [878, 26];
const EDIT_MODE_BESIDE_QUEUE: Point = [842, 26];
const REDACT_TOOL: Point = [334, 68];
const KEEP_BOTH: Point = [682, 425];
const REDACTED_AREA = {x: 260, y: 260, width: 160, height: 80};
const BLACK_TOLERANCE = 4;
const REDACTED_SHARE = 0.9;
const PICTURE = repository('os', 'image', 'files', 'usr', 'share', 'backgrounds', 'luft', 'Afterglow.jpg');

function placePicture(path: string) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  Gio.File.new_for_path(PICTURE).copy(Gio.File.new_for_path(path), Gio.FileCopyFlags.OVERWRITE, null, null);
}

async function convert(app: LuftApp) {
  await chord(Clutter.KEY_Control_L, Clutter.KEY_Return);
  await pause(SETTLE);
  (await app.frame()).save('convertible-queue');
}

async function checkDropPickDone(app: LuftApp, folder: string, picture: string, palette: Palette) {
  await pause(SETTLE);
  (await app.settle(() => true)).save('convertible-file');
  app.click(FIRST_SUGGESTION);
  rest();
  await saveBothStyles(app, palette, 'convertible-format');
  await convert(app);
  const output = GLib.build_filenamev([folder, 'harbor.webp']);
  await eventually(() => exists(output), 'Convertible writes the picture next to the original', CONVERT_TIMEOUT);
  require(read(output).startsWith('RIFF'), 'the result is a real WebP file');
  require(exists(picture), 'the original stays');
  require(children(folder).every(child => !child.get_name().startsWith('.')), 'no temporary file is left behind');
}

async function checkRedaction(app: LuftApp, folder: string) {
  app.click(QUEUE_BUTTON);
  await pause(SETTLE);
  app.click(EDIT_MODE_BESIDE_QUEUE);
  await pause(SETTLE);
  app.click(REDACT_TOOL);
  rest();
  (await app.settle(() => true)).save('convertible-edit');
  const [left, top] = [240, 240];
  await drag(app.at([left, top]), app.at([left + 200, top + 120]));
  await pause(SETTLE);
  const redacted = await app.frame(app.area(REDACTED_AREA));
  redacted.save('convertible-redacted');
  require(redacted.share(['#000000'], BLACK_TOLERANCE) > REDACTED_SHARE, 'the redacted part of the preview turns solid black');
  await chord(Clutter.KEY_Control_L, Clutter.KEY_Return);
  await pause(SETTLE);
  (await app.frame()).save('convertible-conflict');
  app.click(KEEP_BOTH);
  await pause(SETTLE);
  const output = GLib.build_filenamev([folder, 'harbor (1).webp']);
  await eventually(() => exists(output), 'the edited picture is saved beside the first, without replacing it', CONVERT_TIMEOUT);
}

async function checkEditors(folder: string) {
  const clip = repository('apps', 'store', 'convertible', 'desktop', 'tests', 'fixtures', 'clip.webm');
  const song = repository('apps', 'store', 'convertible', 'desktop', 'tests', 'fixtures', 'tone.flac');
  await withApp('convertible', [clip], async app => {
    await pause(SETTLE);
    app.click(EDIT_MODE);
    await pause(SETTLE);
    (await app.settle(() => true)).save('convertible-video');
  });
  await withApp('convertible', [song], async app => {
    await pause(SETTLE);
    (await app.settle(() => true)).save('convertible-song');
    app.click(EDIT_MODE);
    await pause(SETTLE);
    (await app.settle(() => true)).save('convertible-trim');
  });
  await withApp('convertible', [GLib.build_filenamev([folder, 'harbor.jpg']), clip, song], async app => {
    await pause(SETTLE);
    (await app.settle(() => true)).save('convertible-batch');
  });
}

export async function run() {
  const folder = scratch('convertible-flow');
  const picture = GLib.build_filenamev([folder, 'harbor.jpg']);
  placePicture(picture);
  await withPalette(async palette => {
    await withApp('convertible', [], async app => {
      await checkPalette(app, palette);
    });
    await withApp('convertible', [picture], async app => {
      await checkDropPickDone(app, folder, picture, palette);
      await checkRedaction(app, folder);
    });
  });
  await checkEditors(folder);
}
