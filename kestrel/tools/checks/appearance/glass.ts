import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import {dismissImmediately, Main, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {setPowerProfile} from '../desktop/lib/playthings.js';
import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {rest, rightClick} from '../lib/input/input.js';
import {fixture, spawn, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('glass');
const KINDS = ['taskbar', 'surfaces', 'windows'] as const;
const BACKDROP_COLOR = 'd02020';
const REDDISH = 60;

type Style = 'luca' | 'maris';

const backdrops = () => descendants(global.stage).flatMap(actor => actor.mapped ? actor.get_effects() : [])
  .filter((effect): effect is Shell.BlurEffect => effect instanceof Shell.BlurEffect && effect.mode === Shell.BlurMode.BACKGROUND);
const taskbarGlass = () => named('kestrel-panel')!.get_effects().find((effect): effect is Shell.BlurEffect => effect instanceof Shell.BlurEffect)!;
const styleOf = (style: Style) => style === 'maris' ? Shell.BlurStyle.MARIS : Shell.BlurStyle.LUCA;

function startItem() {
  return descendants(global.stage).find(actor => actor.name?.startsWith('kestrel-start-item-') && actor.mapped)!;
}

async function shows(style: Style, label: string) {
  await eventually(() => backdrops().length > 0 && backdrops().every(effect => effect.style === styleOf(style)) &&
    global.compositor.get_background_blur_from_wallpaper() === (style === 'maris'), label);
  await settled();
}

async function glassCenter(window: {get_frame_rect(): {x: number; y: number; width: number; height: number}}) {
  const frame = window.get_frame_rect();
  const shot = await captureFrame({x: frame.x + Math.round(frame.width / 2), y: frame.y + Math.round(frame.height / 2), width: 1, height: 1});
  const [red, green, blue] = shot.pixbuf.get_pixels();
  return red - Math.max(green, blue);
}

async function captureStyle(style: Style, glass: Parameters<typeof glassCenter>[0]) {
  await capture(`glass-${style}-desktop`);
  toggleSurface('start');
  await settled();
  await capture(`glass-${style}-start`);
  rightClick(startItem());
  await eventually(() => named('kestrel-context-menu')?.visible, 'a context menu opens over Start');
  await settled();
  await capture(`glass-${style}-menu`);
  dismissImmediately();
  rest();
  await settled();
  const reddish = await glassCenter(glass);
  require(style === 'luca' ? reddish > REDDISH : reddish < REDDISH,
    style === 'luca' ? 'Luca glass on an app window blurs the window behind it' : 'Maris glass on an app window shows the wallpaper instead of the window behind it');
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.glass'});
  const choose = (styles: Record<(typeof KINDS)[number], Style>) => KINDS.forEach(kind => settings.set_string(kind, styles[kind]));
  try {
    const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), 'client', 'Backdrop', BACKDROP_COLOR]);
    const backdrop = await waitForWindow('Backdrop');
    backdrop.move_resize_frame(true, area.x, area.y, area.width, area.height);
    spawn(['python3', fixture('clients', 'wayland', 'blurClient.py'), 'Glass', '520', '360']);
    const glass = await waitForWindow('Glass');
    glass.move_frame(true, area.x + Math.round(area.width / 2), area.y + Math.round(area.height / 4));
    await settled();

    await shows('luca', 'glass starts as Luca everywhere');
    await captureStyle('luca', glass);

    choose({taskbar: 'maris', surfaces: 'maris', windows: 'maris'});
    await shows('maris', 'every kind of glass turns to Maris');
    await captureStyle('maris', glass);

    choose({taskbar: 'luca', surfaces: 'luca', windows: 'maris'});
    await eventually(() => taskbarGlass().style === Shell.BlurStyle.LUCA && global.compositor.get_background_blur_from_wallpaper(),
      'the taskbar stays Luca while app windows are Maris');

    choose({taskbar: 'luca', surfaces: 'luca', windows: 'luca'});
    await shows('luca', 'glass goes back to Luca');

    await setPowerProfile('power-saver');
    await shows('maris', 'power saver turns all glass to Maris');
    await setPowerProfile('balanced');
    await shows('luca', 'leaving power saver brings Luca back');

    settings.set_boolean('maris-on-power-saver', false);
    await setPowerProfile('power-saver');
    await settled();
    require(backdrops().every(effect => effect.style === Shell.BlurStyle.LUCA), 'glass stays Luca in power saver when asked to');
  } finally {
    await setPowerProfile('balanced');
    for (const key of [...KINDS, 'maris-on-power-saver']) settings.reset(key);
  }
}
