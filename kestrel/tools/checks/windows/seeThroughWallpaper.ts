import Cairo from 'cairo';
import type Clutter from 'gi://Clutter';
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

const {require, eventually} = checks('see-through to the wallpaper');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const KESTREL_KEYS = ['see-through-apps', 'see-through-shows', 'see-through-blur', 'see-through-opacity'];
const BACKGROUND_KEYS = ['picture-uri', 'picture-uri-dark'];
const TERN_SETTINGS = GLib.build_filenamev([GLib.get_user_config_dir(), 'tern', 'settings.json']);
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

function wallpaperBackdrop(window: Meta.Window) {
  const actor = window.get_compositor_private<Meta.WindowActor>()!;
  return actor.get_children().find(child => child.name === 'kestrel-see-through-wallpaper') as (Clutter.Actor & {covered: boolean}) | undefined;
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

async function lookWithAndWithout(tern: Meta.Window, behind: Meta.Window) {
  behind.unminimize();
  tern.raise();
  await settled();
  const over = await captureFrame(inside(tern));
  behind.minimize();
  await settled();
  const alone = await captureFrame(inside(tern));
  return {over, alone, apart: shareApart(over, alone)};
}

async function changesTo(tern: Meta.Window, before: Frame, act: () => void, label: string) {
  act();
  await eventually(async () => shareApart(await captureFrame(inside(tern)), before) > DIFFERENT, label, 10000);
}

export async function run() {
  const savedBackground = BACKGROUND_KEYS.map((key): [string, string] => [key, background.get_string(key)]);
  const scheme = interfaceSettings.get_string('color-scheme');
  GLib.mkdir_with_parents(GLib.path_get_dirname(TERN_SETTINGS), 0o755);
  GLib.file_set_contents(TERN_SETTINGS, '{"translucent": false}');
  background.set_string('picture-uri-dark', writePicture('dark', PICTURES.dark));
  background.set_string('picture-uri', writePicture('light', PICTURES.light));
  interfaceSettings.set_string('color-scheme', 'prefer-dark');
  let scaled: Awaited<ReturnType<typeof scaleSecondDisplay>> | null = null;
  try {
    if (Main.layoutManager.monitors.length > 1) scaled = await scaleSecondDisplay();
    const secondWidth = scaled?.width ?? 0;
    await withBehind(behind => withApp('tern', ['-e', 'sh', '-c', 'sleep 600'], async ({window: tern}) => {
      const app = require(Shell.WindowTracker.get_default().get_window_app(tern), 'Tern has an app');
      const primary = Main.layoutManager.primaryMonitor!;
      const [x, width] = secondWidth ? [primary.x + primary.width - 500, 500 + Math.min(400, secondWidth - 40)] : [primary.x + 200, 900];
      tern.move_resize_frame(true, x, primary.y + 40, width, 460);
      behind.move_frame(true, x - 100, primary.y);
      kestrel.set_double('see-through-opacity', 0.4);
      kestrel.set_strv('see-through-apps', [app.get_id()]);
      await eventually(() => tern.get_compositor_private<Meta.WindowActor>()!.get_children().some(child => child.get_effect('see-through')), 'Tern turns see-through');

      const everything = await lookWithAndWithout(tern, behind);
      require(everything.apart > DIFFERENT, `showing everything behind lets the window underneath show through (${Math.round(everything.apart * 100)}% apart)`);
      behind.unminimize();
      await capture('see-through-everything-behind');

      kestrel.set_string('see-through-shows', 'wallpaper');
      await eventually(() => wallpaperBackdrop(tern)?.covered, 'the window shows a still copy of the wallpaper');
      const wallpaper = await lookWithAndWithout(tern, behind);
      require(wallpaper.apart < SAME, `showing only the wallpaper hides the window underneath (${Math.round(wallpaper.apart * 1000) / 10}% apart)`);
      require(shareApart(wallpaper.over, everything.over) > DIFFERENT, 'showing only the wallpaper looks different from showing everything behind');
      behind.unminimize();
      tern.raise();
      await capture('see-through-only-wallpaper');

      await changesTo(tern, wallpaper.alone, () => kestrel.set_boolean('see-through-blur', false), 'turning blur off shows the wallpaper sharp');
      kestrel.set_boolean('see-through-blur', true);
      await settled();

      const darkLook = await captureFrame(inside(tern));
      await changesTo(tern, darkLook, () => background.set_string('picture-uri-dark', writePicture('changed', PICTURES.changed)), 'the window follows a new wallpaper');
      const changedLook = await captureFrame(inside(tern));
      await changesTo(tern, changedLook, () => interfaceSettings.set_string('color-scheme', 'default'), 'the window follows the light wallpaper in the light style');
      await capture('see-through-only-wallpaper-light');

      tern.maximize();
      await settled();
      const maximized = await lookWithAndWithout(tern, behind);
      require(maximized.apart < SAME, `a maximized see-through window still shows only the wallpaper (${Math.round(maximized.apart * 1000) / 10}% apart)`);
      behind.unminimize();
      tern.raise();
      await capture('see-through-only-wallpaper-maximized');
      tern.unmaximize();
      await settled();

      kestrel.set_string('see-through-shows', 'everything');
      await eventually(() => !wallpaperBackdrop(tern), 'showing everything behind again drops the still wallpaper');
    }));
  } finally {
    await scaled?.restore();
    for (const key of KESTREL_KEYS) kestrel.reset(key);
    for (const [key, value] of savedBackground) background.set_string(key, value);
    interfaceSettings.set_string('color-scheme', scheme);
    GLib.unlink(TERN_SETTINGS);
  }
}
