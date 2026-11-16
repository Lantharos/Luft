import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, moveBy, moveTo, pressButton, releaseButton, rest} from '../lib/input/input.js';
import {findWindow, repository, spawn, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('standalone quick settings');

const APP_ID = 'com.lantharos.kestrel.quicksettings';
const NAME = 'com.lantharos.Kestrel.QuickSettings';
const PADDING = 14;
const TILE = {width: 192, height: 97, gap: 8};

const surface = () => findWindow(window => window.get_wm_class() === APP_ID);

async function open(): Promise<Meta.Window> {
  toggleSurface('quick');
  const window = await eventually(surface, 'the program shows quick settings');
  await settled();
  return window;
}

async function close() {
  toggleSurface('quick');
  await eventually(() => !surface(), 'the program takes quick settings away');
  await settled();
}

function tile(window: Meta.Window, column: number, row: number): [number, number] {
  const {x, y} = window.get_frame_rect();
  return [x + PADDING + column * (TILE.width + TILE.gap) + TILE.width / 2, y + PADDING + row * (TILE.height + TILE.gap) + TILE.height / 2];
}

export async function run() {
  const stats = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR')!, 'standalone-quick-stats.txt']);
  const program = spawn(['sh', '-c', `exec "${repository('target', 'release', 'kestrel-quick-settings')}" 2>> "${stats}"`], {
    env: {KESTREL_SHELL_STATS: '1', KESTREL_ICON_PATH: repository('kestrel', 'engine', 'data', 'icons')},
  });
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const notifications = new Gio.Settings({schema_id: 'org.gnome.desktop.notifications'});
  const scheme = interfaceSettings.get_string('color-scheme');
  try {
    await eventually(async () => (await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
      new GLib.Variant('(s)', [NAME]), '(b)')).recursiveUnpack<[boolean]>()[0], 'the program is on the bus');

    let window = await open();
    const frame = window.get_frame_rect();
    console.log(`Standalone quick settings frame: ${frame.x},${frame.y} ${frame.width}x${frame.height}`);
    await capture('standalone-quick');
    const [, memory] = GLib.file_get_contents(`/proc/${program.get_identifier()}/smaps_rollup`);
    console.log(`Standalone quick settings memory: ${new TextDecoder().decode(memory).split('\n').filter(line => /^(Rss|Pss|Pss_Anon):/.test(line)).join(' ').replace(/\s+/g, ' ')}`);

    moveTo(tile(window, 1, 1));
    await settled();
    await capture('standalone-quick-hover');

    click(tile(window, 1, 1));
    await eventually(() => !notifications.get_boolean('show-banners'), 'clicking Do Not Disturb turns banners off');
    await settled();
    await capture('standalone-quick-quiet');
    click(tile(window, 1, 1));
    await eventually(() => notifications.get_boolean('show-banners'), 'clicking it again turns them back on');

    click(tile(window, 0, 1));
    await eventually(() => interfaceSettings.get_string('color-scheme') !== scheme, 'clicking Dark Style changes the style');
    await settled();
    await capture('standalone-quick-light');
    click(tile(window, 0, 1));
    await eventually(() => interfaceSettings.get_string('color-scheme') === scheme, 'clicking it again restores the style');

    const sliderY = frame.y + frame.height - PADDING - 18;
    if (frame.height > 2 * (PADDING + TILE.height) + TILE.gap + 20) {
      moveTo([frame.x + 80, sliderY]);
      pressButton();
      for (let step = 0; step < 120; step++) {
        moveBy(step < 60 ? 5 : -5, 0);
        await pause(8);
      }
      releaseButton();
      await settled();
      await capture('standalone-quick-volume');
    }
    rest();
    await close();

    for (let again = 0; again < 5; again++) {
      window = await open();
      await close();
    }
    require(true, 'quick settings opened and closed six times');
  } finally {
    interfaceSettings.set_string('color-scheme', scheme);
    notifications.reset('show-banners');
    await stop(program);
  }
}
