import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import {dismissImmediately, Main, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {setPowerProfile} from '../desktop/lib/playthings.js';
import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {rest, rightClick} from '../lib/input/input.js';
import {fixture, outputLines, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('glass');
const KINDS = ['taskbar', 'surfaces', 'windows'] as const;
const KEYS = [...KINDS, 'luca-blurs', 'wallpaper-on-power-saver'];
const BACKDROP_COLOR = 'd02020';
const REDDISH = 60;
const SURFACE_DISTANCE = 24;
const CLIENT_TINT = [0x18, 0x24, 0x30];
const CLIENT_ALPHA = 0x60 / 255;

type Kind = (typeof KINDS)[number];

const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.glass'});
const backdrops = () => descendants(global.stage).flatMap(actor => actor.mapped ? actor.get_effects() : [])
  .filter((effect): effect is Shell.BlurEffect => effect instanceof Shell.BlurEffect && effect.mode === Shell.BlurMode.BACKGROUND);
const taskbarGlass = () => named('kestrel-panel')!.get_effects().find((effect): effect is Shell.BlurEffect => effect instanceof Shell.BlurEffect)!;

function startItem() {
  return descendants(global.stage).find(actor => actor.name?.startsWith('kestrel-start-item-') && actor.mapped)!;
}

async function centerOf(window: Meta.Window) {
  const frame = window.get_frame_rect();
  const shot = await captureFrame({x: frame.x + Math.round(frame.width / 2), y: frame.y + Math.round(frame.height / 2), width: 1, height: 1});
  const [red, green, blue] = shot.pixbuf.get_pixels();
  return [red, green, blue];
}

const reddish = ([red, green, blue]: number[]) => red - Math.max(green, blue) > REDDISH;

function nearSurface(color: number[]) {
  const {red, green, blue} = global.compositor.get_glass_surface();
  const expected = [red, green, blue].map((channel, index) => channel * (1 - CLIENT_ALPHA) + CLIENT_TINT[index]);
  return Math.max(...expected.map((channel, index) => Math.abs(channel - color[index]))) < SURFACE_DISTANCE;
}

function choose(styles: Partial<Record<Kind, 'luca' | 'maris'>>, lucaBlurs: 'everything' | 'wallpaper' = 'everything') {
  for (const kind of KINDS) settings.set_string(kind, styles[kind] ?? 'luca');
  settings.set_string('luca-blurs', lucaBlurs);
}

async function glassClient(title: string, glass: string[] = []) {
  const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  const process = spawn(['python3', fixture('clients', 'wayland', 'blurClient.py'), title, '520', '360', ...glass], {flags: Gio.SubprocessFlags.STDOUT_PIPE});
  const materials = outputLines(process);
  const window = await waitForWindow(title);
  window.move_frame(true, area.x + Math.round(area.width / 2), area.y + Math.round(area.height / 4));
  window.raise();
  return {process, window, materials};
}

async function captureSurfaces(name: string) {
  await capture(`glass-${name}-desktop`);
  toggleSurface('start');
  await settled();
  await capture(`glass-${name}-start`);
  rightClick(startItem());
  await eventually(() => named('kestrel-context-menu')?.visible, 'a context menu opens over Start');
  await settled();
  await capture(`glass-${name}-menu`);
  dismissImmediately();
  rest();
  await settled();
}

export async function run() {
  try {
    const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), 'client', 'Backdrop', BACKDROP_COLOR]);
    const backdrop = await waitForWindow('Backdrop');
    backdrop.move_resize_frame(true, area.x, area.y, area.width, area.height);
    const glass = await glassClient('Glass');
    await settled();

    await eventually(() => backdrops().every(effect => effect.style === Shell.BlurStyle.LUCA), 'glass starts as Luca everywhere');
    require(reddish(await centerOf(glass.window)), 'Luca glass on an app window blurs the window behind it');
    await captureSurfaces('luca');

    choose({}, 'wallpaper');
    await eventually(() => backdrops().length > 0 && backdrops().every(effect => effect.style === Shell.BlurStyle.WALLPAPER),
      'Luca glass that blurs only the wallpaper shows the blurred wallpaper');
    await settled();
    require(!reddish(await centerOf(glass.window)), 'Luca glass on an app window that blurs only the wallpaper shows the wallpaper instead of the window behind it');
    await captureSurfaces('wallpaper');

    choose({taskbar: 'maris', surfaces: 'maris', windows: 'maris'});
    await eventually(() => backdrops().every(effect => effect.style === Shell.BlurStyle.MARIS), 'every kind of glass turns to Maris');
    await settled();
    require(nearSurface(await centerOf(glass.window)), 'Maris glass on an app window is the surface colour');
    await captureSurfaces('maris');

    choose({windows: 'maris'}, 'wallpaper');
    await eventually(() => taskbarGlass().style === Shell.BlurStyle.WALLPAPER, 'the taskbar blurs only the wallpaper while app windows are Maris');
    await settled();
    require(nearSurface(await centerOf(glass.window)), 'app windows stay Maris while Luca blurs only the wallpaper');

    choose({});
    const asking = await glassClient('Asks for Maris', ['window', 'maris']);
    await eventually(() => asking.materials.at(-1) === 'maris', 'an app asking for Maris hears it has Maris');
    await settled();
    require(nearSurface(await centerOf(asking.window)), 'an app asking for Maris gets Maris while people chose Luca');
    await stop(asking.process);

    const transient = await glassClient('Transient', ['transient', 'user']);
    await eventually(() => transient.materials.at(-1) === 'luca', 'a transient surface starts with the Luca of panels and menus');
    settings.set_string('surfaces', 'maris');
    await eventually(() => transient.materials.at(-1) === 'maris', 'a transient surface follows panels and menus to Maris');
    settings.set_string('windows', 'maris');
    settings.set_string('surfaces', 'luca');
    await eventually(() => transient.materials.at(-1) === 'luca', 'a transient surface stays with panels and menus, not app windows');
    await stop(transient.process);

    choose({taskbar: 'maris'});
    await eventually(() => taskbarGlass().style === Shell.BlurStyle.MARIS, 'the taskbar turns to Maris');
    await setPowerProfile('power-saver');
    await eventually(async () => !reddish(await centerOf(glass.window)), 'power saver makes Luca on app windows blur only the wallpaper');
    require(taskbarGlass().style === Shell.BlurStyle.MARIS, 'power saver leaves Maris alone');
    await setPowerProfile('balanced');
    await eventually(async () => reddish(await centerOf(glass.window)), 'leaving power saver brings back Luca that blurs everything');

    settings.set_boolean('wallpaper-on-power-saver', false);
    await setPowerProfile('power-saver');
    await settled();
    require(reddish(await centerOf(glass.window)), 'Luca keeps blurring everything in power saver when asked to');
    await stop(glass.process);
  } finally {
    await setPowerProfile('balanced');
    for (const key of KEYS) settings.reset(key);
  }
}
