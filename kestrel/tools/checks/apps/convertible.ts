import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {chord, drag, rest} from '../lib/input/input.js';
import {repository, scratch} from '../lib/processes.js';
import type {Frame} from '../lib/screenshots.js';
import {withApp} from './lib/apps.js';
import {children, exists, read} from './lib/files.js';
import {checkPalette, saveBothStyles, withPalette, type Palette} from './lib/palette.js';

const {require, eventually} = checks('Luft app');
const CONVERT_TIMEOUT = 30000;
const EDIT_MODE = {role: 'radio', name: 'Edit'};
const REDACTED_AREA = {x: 260, y: 260, width: 160, height: 80};
const BLACK_TOLERANCE = 4;
const REDACTED_SHARE = 0.9;
const PICTURE = repository('os', 'image', 'files', 'usr', 'share', 'backgrounds', 'luft', 'Afterglow.jpg');

function placePicture(path: string) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  Gio.File.new_for_path(PICTURE).copy(Gio.File.new_for_path(path), Gio.FileCopyFlags.OVERWRITE, null, null);
}

async function checkDropPickDone(app: LuftApp, folder: string, picture: string, palette: Palette) {
  app.click(await app.find({role: 'radio', name: 'WebP'}));
  rest();
  await saveBothStyles(app, palette, 'convertible-format');
  await chord(Clutter.KEY_Control_L, Clutter.KEY_Return);
  const output = GLib.build_filenamev([folder, 'harbor.webp']);
  await eventually(() => exists(output), 'Convertible writes the picture next to the original', CONVERT_TIMEOUT);
  require(read(output).startsWith('RIFF'), 'the result is a real WebP file');
  require(exists(picture), 'the original stays');
  require(children(folder).every(child => !child.get_name().startsWith('.')), 'no temporary file is left behind');
}

async function checkRedaction(app: LuftApp, folder: string) {
  app.click(await app.find({role: 'button', name: 'Show the finished list'}));
  app.click(await app.find(EDIT_MODE));
  app.click(await app.find({role: 'button', name: 'Redact'}));
  rest();
  const [left, top] = [240, 240];
  await drag(app.at([left, top]), app.at([left + 200, top + 120]));
  const blacked = (frame: Frame) => frame.share(['#000000'], BLACK_TOLERANCE) > REDACTED_SHARE;
  const redacted = await app.settle(blacked, app.area(REDACTED_AREA));
  require(blacked(redacted), 'the redacted part of the preview turns solid black');
  await chord(Clutter.KEY_Control_L, Clutter.KEY_Return);
  app.click(await app.find({role: 'button', name: 'Keep both'}));
  const output = GLib.build_filenamev([folder, 'harbor (1).webp']);
  await eventually(() => exists(output), 'the edited picture is saved beside the first, without replacing it', CONVERT_TIMEOUT);
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
}
