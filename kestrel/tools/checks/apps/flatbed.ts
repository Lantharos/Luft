import Cairo from 'cairo';
import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';

import {StandInScanner} from '../../fixtures/services/scanner.js';
import type {LuftApp} from '../lib/apps/luftApp.js';
import {freePorts} from '../lib/apps/ports.js';
import {checks} from '../lib/check.js';
import type {Point} from '../lib/input/input.js';
import {scratch} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {changes, withApp} from './lib/apps.js';
import {exists, removeTree, write} from './lib/files.js';
import {A4, typeset, type Block} from './lib/paper.js';
import {saveBothStyles, withPalette} from './lib/palette.js';
import {CONTRACT} from './flatbed/contract.js';

const {eventually} = checks('Luft app');
const MODEL = 'Canon PIXMA MX490 Series';
const DPI = 150;
const FEEDER: Point = [607, 733];
const SCAN: Point = [799, 733];
const SCANNING_MS = 30000;
const SETTLE = 1500;
const SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'com.lantharos.flatbed', 'settings.json']);
const DOCUMENT = GLib.build_filenamev([GLib.get_user_state_dir(), 'com.lantharos.flatbed']);
const NO_SANE_DRIVERS = scratch('flatbed-sane');

function scannedPage(blocks: Block[], name: string): Uint8Array {
  const scale = DPI / 72;
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, Math.round(A4.width * scale), Math.round(A4.height * scale));
  const context = new Cairo.Context(surface);
  context.setSourceRGB(0.99, 0.985, 0.97);
  context.paint();
  context.scale(scale, scale);
  context.setSourceRGB(0.06, 0.06, 0.07);
  typeset(context, blocks, 'Noto Serif', 72);
  const png = scratch('flatbed-pages', `${name}.png`);
  GLib.mkdir_with_parents(GLib.path_get_dirname(png), 0o755);
  surface.writeToPNG(png);
  const [, jpeg] = GdkPixbuf.Pixbuf.new_from_file(png).save_to_bufferv('jpeg', ['quality'], ['90']);
  return jpeg;
}

async function scanContract(app: LuftApp) {
  await pause(SETTLE);
  await changes(app, 'the feeder is chosen', () => app.click(FEEDER));
  app.click(SCAN);
  await eventually(() => exists(GLib.build_filenamev([DOCUMENT, 'document'])), 'Flatbed keeps the pages it scans', SCANNING_MS);
  await pause(SCANNING_MS / 10);
}

export async function run() {
  const pages = CONTRACT.map((blocks, index) => scannedPage(blocks, `page-${index + 1}`));
  const scanner = new StandInScanner(freePorts('scanner').scanner, MODEL, pages, DPI);
  write(SETTINGS, JSON.stringify({addresses: [scanner.address], scanner: `escl:address:${scanner.address}`}));
  write(GLib.build_filenamev([NO_SANE_DRIVERS, 'dll.conf']), '');
  try {
    await withPalette(palette => withApp('flatbed', [], async app => {
      await scanContract(app);
      await saveBothStyles(app, palette, 'flatbed-scans');
    }, {SANE_CONFIG_DIR: NO_SANE_DRIVERS}));
  } finally {
    scanner.close();
    GLib.unlink(SETTINGS);
    if (exists(DOCUMENT)) removeTree(DOCUMENT);
  }
}
