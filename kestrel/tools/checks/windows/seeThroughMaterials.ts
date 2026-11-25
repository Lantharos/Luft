import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withApp} from '../apps/lib/apps.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {gjs, scratch, stop, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame, type Area, type Frame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

type Rgb = [number, number, number];
type Properties = Record<string, GLib.Variant>;
type Mode = [string, number, number, number, number, number[], Properties];
type MonitorState = [[string, string, string, string], Mode[], Properties];
type LogicalMonitor = [number, number, number, number, boolean, [string, string, string, string][], Properties];
type CurrentState = [number, MonitorState[], LogicalMonitor[], Properties];
type Layout = [number, number, number, number, boolean, [string, string, Properties][]];

const {require, eventually} = checks('see-through window materials');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const glass = new Gio.Settings({schema_id: 'com.lantharos.kestrel.glass'});
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const KESTREL_KEYS = ['see-through-apps', 'see-through-opacity'];
const GLASS_KEYS = ['see-through', 'blurs'];
const BACKGROUND_KEYS = ['picture-uri', 'picture-uri-dark'];
const TERMINAL_SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'terminal', 'settings.json']);
const BEHIND = 'See-through behind';
const TEMPORARY = 1;
const TOLERANCE = 6;
const SPOT_SPACING = 150;
const SAME = 0.01;
const DIFFERENT = 0.2;
const PICTURES: Record<string, [Rgb, Rgb]> = {
  dark: [[0.05, 0.08, 0.25], [0.55, 0.15, 0.45]],
  light: [[0.85, 0.75, 0.35], [0.30, 0.70, 0.75]],
  changed: [[0.10, 0.40, 0.15], [0.90, 0.55, 0.20]],
};

function writePicture(name: string, [from, to]: [Rgb, Rgb]) {
  const [width, height] = [2400, 1350];
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, width, height);
  const context = new Cairo.Context(surface);
  const gradient = new Cairo.LinearGradient(0, 0, width, height);
  gradient.addColorStopRGB(0, ...from);
  gradient.addColorStopRGB(1, ...to);
  context.setSource(gradient);
  context.paint();
  context.setSourceRGB(1, 1, 1);
  for (let x = SPOT_SPACING / 2; x < width; x += SPOT_SPACING) {
    for (let y = SPOT_SPACING / 2; y < height; y += SPOT_SPACING) {
      context.arc(x, y, SPOT_SPACING / 6, 0, 2 * Math.PI);
      context.fill();
    }
  }
  const path = scratch(`see-through-wallpaper-${name}.png`);
  surface.writeToPNG(path);
  return Gio.File.new_for_path(path).get_uri();
}

async function displayConfig<T>(method: string, parameters: GLib.Variant | null = null) {
  const reply = await call('org.gnome.Mutter.DisplayConfig', '/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig', method, parameters);
  return reply.deepUnpack<T>();
}

const modeOf = (monitors: MonitorState[], [, , , , , [[connector]]]: LogicalMonitor) => monitors.find(([[name]]) => name === connector)![1]
  .find(([, , , , , , properties]) => properties['is-current']?.deepUnpack())!;

const placed = ([, y, , transform, primary, [[connector]]]: LogicalMonitor, x: number, scale: number, mode: string): Layout =>
  [x, y, scale, transform, primary, [[connector, mode, {}]]];

const arrangedAs = () => Main.layoutManager.monitors.map(({x, y, width, height, geometry_scale}) => [x, y, width, height, geometry_scale].join()).join(' ');

async function applyLayout(layout: Layout[]) {
  const [serial] = await displayConfig<CurrentState>('GetCurrentState');
  await displayConfig('ApplyMonitorsConfig', new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [serial, TEMPORARY, layout, {}]));
}

async function scaleSecondDisplay() {
  const [, monitors, logicalMonitors] = await displayConfig<CurrentState>('GetCurrentState');
  const arranged = arrangedAs();
  const original = logicalMonitors.map(monitor => placed(monitor, monitor[0], monitor[2], modeOf(monitors, monitor)[0]));
  const primary = logicalMonitors.find(([, , , , isPrimary]) => isPrimary)!;
  const second = logicalMonitors.find(monitor => monitor !== primary)!;
  const [primaryMode, primaryWidth] = modeOf(monitors, primary);
  const [secondMode, secondWidth, , , , scales] = modeOf(monitors, second);
  const scale = Math.max(...scales);
  await applyLayout([placed(primary, 0, primary[2], primaryMode), placed(second, Math.round(primaryWidth / primary[2]), scale, secondMode)]);
  await eventually(() => Main.layoutManager.monitors.some(monitor => monitor.geometry_scale === scale), `the second display uses a scale of ${scale}`);
  return {
    width: Math.round(secondWidth / scale),
    restore: async () => {
      await applyLayout(original);
      await eventually(() => arrangedAs() === arranged, 'the displays go back to how they were');
    },
  };
}

function backdropStyle(window: Meta.Window) {
  const actor = window.get_compositor_private<Meta.WindowActor>()!;
  return actor.get_children().map(child => child.get_effect('backdrop')).find(effect => effect instanceof Shell.BlurEffect)?.style;
}

function shareApart(a: Frame, b: Frame) {
  return a.pixelsApart(b, TOLERANCE) / (a.pixbuf.get_width() * a.pixbuf.get_height());
}

function inside(window: Meta.Window): Area {
  const frame = window.get_frame_rect();
  return {x: frame.x + 40, y: frame.y + 80, width: frame.width - 80, height: frame.height - 120};
}

async function withBehind<T>(use: (behind: Meta.Window) => Promise<T>) {
  const client = gjs('clients/windows/stripedWindow.js', [BEHIND, '1000', '700']);
  try {
    return await use(await waitForWindow(BEHIND));
  } finally {
    await stop(client);
  }
}

async function lookWithAndWithout(terminal: Meta.Window, behind: Meta.Window) {
  behind.unminimize();
  terminal.raise();
  await settled();
  const over = await captureFrame(inside(terminal));
  behind.minimize();
  await settled();
  const alone = await captureFrame(inside(terminal));
  return {over, alone, apart: shareApart(over, alone)};
}

async function captureOverAndAlone(terminal: Meta.Window, behind: Meta.Window, name: string) {
  behind.unminimize();
  terminal.raise();
  await settled();
  await capture(`${name}-over-window`);
  behind.minimize();
  await settled();
  await capture(`${name}-over-wallpaper`);
}

async function changesTo(terminal: Meta.Window, before: Frame, act: () => void, label: string) {
  act();
  await eventually(async () => shareApart(await captureFrame(inside(terminal)), before) > DIFFERENT, label, 10000);
}

export async function run() {
  const savedBackground = BACKGROUND_KEYS.map((key): [string, string] => [key, background.get_string(key)]);
  const scheme = interfaceSettings.get_string('color-scheme');
  GLib.mkdir_with_parents(GLib.path_get_dirname(TERMINAL_SETTINGS), 0o755);
  GLib.file_set_contents(TERMINAL_SETTINGS, '{"translucent": false}');
  background.set_string('picture-uri-dark', writePicture('dark', PICTURES.dark));
  background.set_string('picture-uri', writePicture('light', PICTURES.light));
  interfaceSettings.set_string('color-scheme', 'prefer-dark');
  let scaled: Awaited<ReturnType<typeof scaleSecondDisplay>> | null = null;
  try {
    if (Main.layoutManager.monitors.length > 1) scaled = await scaleSecondDisplay();
    const secondWidth = scaled?.width ?? 0;
    await withBehind(behind => withApp('terminal', ['-e', 'sh', '-c', 'sleep 600'], async ({window: terminal}) => {
      const app = require(Shell.WindowTracker.get_default().get_window_app(terminal), 'Terminal has an app');
      const primary = Main.layoutManager.primaryMonitor!;
      const [x, width] = secondWidth ? [primary.x + primary.width - 500, 500 + Math.min(400, secondWidth - 40)] : [primary.x + 200, 900];
      terminal.move_resize_frame(true, x, primary.y + 40, width, 460);
      behind.move_frame(true, x - 100, primary.y);
      kestrel.set_double('see-through-opacity', 0.4);
      glass.set_string('see-through', 'luca');
      glass.set_string('blurs', 'everything');
      kestrel.set_strv('see-through-apps', [app.get_id()]);
      await eventually(() => terminal.get_compositor_private<Meta.WindowActor>()!.get_children().some(child => child.get_effect('see-through')), 'Terminal turns see-through');

      const everything = await lookWithAndWithout(terminal, behind);
      require(everything.apart > DIFFERENT, `Luca lets the window underneath show through (${Math.round(everything.apart * 100)}% apart)`);
      await captureOverAndAlone(terminal, behind, 'see-through-luca-dark');

      glass.set_string('blurs', 'wallpaper');
      await eventually(() => backdropStyle(terminal) === Shell.BlurStyle.WALLPAPER, 'Luca that blurs only the wallpaper shows the frosted wallpaper');
      const wallpaper = await lookWithAndWithout(terminal, behind);
      require(wallpaper.apart < SAME, `Luca that blurs only the wallpaper hides the window underneath (${Math.round(wallpaper.apart * 1000) / 10}% apart)`);
      require(shareApart(wallpaper.over, everything.over) > DIFFERENT, 'blurring only the wallpaper looks different from blurring everything behind');
      await captureOverAndAlone(terminal, behind, 'see-through-luca-wallpaper-dark');

      const darkLook = await captureFrame(inside(terminal));
      await changesTo(terminal, darkLook, () => background.set_string('picture-uri-dark', writePicture('changed', PICTURES.changed)), 'the window follows a new wallpaper');

      terminal.maximize();
      await settled();
      const maximized = await lookWithAndWithout(terminal, behind);
      require(maximized.apart < SAME, `a maximized see-through window still shows only the wallpaper (${Math.round(maximized.apart * 1000) / 10}% apart)`);
      terminal.unmaximize();
      await settled();
      const lucaLook = await captureFrame(inside(terminal));

      glass.set_string('see-through', 'maris');
      await eventually(() => backdropStyle(terminal) === Shell.BlurStyle.MARIS, 'Maris shows the surface colour over the wide wallpaper');
      const maris = await lookWithAndWithout(terminal, behind);
      require(maris.apart < SAME, `Maris hides the window underneath (${Math.round(maris.apart * 1000) / 10}% apart)`);
      require(shareApart(maris.alone, lucaLook) > DIFFERENT, 'Maris looks different from Luca');
      await captureOverAndAlone(terminal, behind, 'see-through-maris-dark');

      await changesTo(terminal, maris.alone, () => interfaceSettings.set_string('color-scheme', 'default'), 'Maris follows the light style');
      await captureOverAndAlone(terminal, behind, 'see-through-maris-light');

      glass.set_string('see-through', 'luca');
      glass.set_string('blurs', 'everything');
      await eventually(() => backdropStyle(terminal) === Shell.BlurStyle.LUCA, 'Luca blurs everything behind again');
      await captureOverAndAlone(terminal, behind, 'see-through-luca-light');
    }));
  } finally {
    await scaled?.restore();
    for (const key of KESTREL_KEYS) kestrel.reset(key);
    for (const key of GLASS_KEYS) glass.reset(key);
    for (const [key, value] of savedBackground) background.set_string(key, value);
    interfaceSettings.set_string('color-scheme', scheme);
    GLib.unlink(TERMINAL_SETTINGS);
  }
}
