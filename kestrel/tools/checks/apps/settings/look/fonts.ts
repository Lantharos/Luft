import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import St from 'gi://St';

import {styled} from '../../../lib/actors.js';
import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {checks} from '../../../lib/check.js';
import {press, type, type Point} from '../../../lib/input/input.js';
import {gjs, stop, waitForWindow, type Process} from '../../../lib/processes.js';
import {captureFrame, output, type Area, type Frame} from '../../../lib/screenshots.js';
import {settled, waitUntil} from '../../../lib/wait.js';
import {changes, withApp} from '../../lib/apps.js';
import {show} from '../navigation.js';

const {require, eventually} = checks('Luft app');
const DEFAULTS: Record<string, string> = {'font-name': 'Open Runde', 'monospace-font-name': 'Maple Mono NF'};
const CHOSEN: Record<string, string> = {'font-name': 'Noto Serif', 'monospace-font-name': 'Noto Sans Mono'};
const SIZE = 11;
const PICKERS: Record<string, Point> = {'font-name': [900, 183], 'monospace-font-name': [900, 252]};
const LARGER_TEXT = 1.25;
const TERMINAL_TEXT = 'fn main() -> Result<(), Error> { 0x1F != 0o17 }  The quick brown fox 0123456789';
const ZOOM = 4;
const TIMEOUT = 8000;
const PADDING = 6;

const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const textWindow = (version: string) => (window: Meta.Window) => window.get_title()?.startsWith(`Kestrel text ${version}:`);
const chosen = (key: string) => `${CHOSEN[key]} ${SIZE}`;

function actorArea(actor: Clutter.Actor): Area {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return {x: Math.floor(x) - PADDING, y: Math.floor(y) - PADDING, width: Math.ceil(width) + 2 * PADDING, height: Math.ceil(height) + 2 * PADDING};
}

const windowArea = (window: Meta.Window, {x, y, width, height}: Area): Area => {
  const frame = window.get_frame_rect();
  return {x: frame.x + x, y: frame.y + y, width, height};
};

async function raise(window: Meta.Window) {
  window.activate(global.get_current_time());
  await waitUntil(() => window.has_focus() && global.display.sort_windows_by_stacking(global.display.list_all_windows()).at(-1) === window,
    `${window.get_title()} comes to the front`);
  await settled();
}

interface Surface {
  area: () => Area;
  window?: Meta.Window;
}

interface WindowSurface extends Surface {
  window: Meta.Window;
}

type Frames = Record<string, Frame>;

class Surfaces {
  readonly apps: {settings: LuftApp; tern: LuftApp};
  readonly all: {shell: Surface; gtk4: WindowSurface; xwayland: WindowSurface; settings: WindowSurface; sidebar: WindowSurface; tern: WindowSurface};

  constructor(app: LuftApp, tern: LuftApp, gtk4: Meta.Window, xwayland: Meta.Window, clock: St.Label) {
    const surface = (window: Meta.Window, area: Area): WindowSurface => ({window, area: () => windowArea(window, area)});
    this.apps = {settings: app, tern};
    this.all = {
      shell: {area: () => actorArea(clock)},
      gtk4: surface(gtk4, {x: 0, y: 40, width: 440, height: 140}),
      xwayland: surface(xwayland, {x: 0, y: 0, width: 440, height: 130}),
      settings: surface(app.window, {x: 296, y: 8, width: 360, height: 48}),
      sidebar: surface(app.window, {x: 12, y: 116, width: 256, height: 200}),
      tern: surface(tern.window, {x: 0, y: 36, width: 560, height: 28}),
    };
  }

  async shoot(phase: string) {
    const frames: Frames = {};
    for (const [name, {window, area}] of Object.entries(this.all)) {
      if (window) await raise(window);
      frames[name] = await captureFrame(area());
      frames[name].saveZoomed(`fonts/${name}-${phase}`, ZOOM);
    }
    return frames;
  }

  async settle(name: keyof Surfaces['apps'], condition: (frame: Frame) => boolean) {
    await raise(this.all[name].window);
    return this.apps[name].settle(condition, this.all[name].area());
  }
}

async function pick(app: LuftApp, key: string, family: string, shot: string | null = null) {
  await raise(app.window);
  await changes(app, 'the font picker opens', () => app.click(PICKERS[key]));
  if (shot) (await app.frame()).save(shot);
  await changes(app, `the font picker finds ${family}`, () => type(family.toLowerCase()));
  press(Clutter.KEY_Return);
}

async function checkChoosing(app: LuftApp, surfaces: Surfaces, clock: St.Label) {
  const shellFamily = () => Pango.FontDescription.from_string(clock.clutter_text.font_name).get_family();
  const titled = (match: string, font: string) => () => global.display.list_all_windows().find(textWindow(match))?.get_title().endsWith(`: ${font}`);
  require(shellFamily() === DEFAULTS['font-name'], `the shell draws its text in ${DEFAULTS['font-name']} by default`);
  const defaults = await surfaces.shoot('default');

  await pick(app, 'font-name', CHOSEN['font-name'], 'fonts/settings-font-picker');
  await eventually(() => settings.get_string('font-name') === chosen('font-name'), 'the interface font picker in Settings finds a font by name and uses it', TIMEOUT);
  await pick(app, 'monospace-font-name', CHOSEN['monospace-font-name']);
  await eventually(() => settings.get_string('monospace-font-name') === chosen('monospace-font-name'), 'and the monospace one', TIMEOUT);
  await eventually(() => shellFamily() === CHOSEN['font-name'], 'the shell follows a new interface font', TIMEOUT);
  await eventually(titled('4.0', chosen('font-name')), 'a GTK 4 app follows a new interface font', TIMEOUT);
  await eventually(titled('3.0', chosen('font-name')), 'an X11 app under Xwayland follows a new interface font', TIMEOUT);
  for (const name of ['settings', 'tern'] as const) {
    const changed = await surfaces.settle(name, frame => !frame.looksLike(defaults[name]));
    require(!changed.looksLike(defaults[name]), `${name} follows a new ${name === 'tern' ? 'monospace' : 'interface'} font`);
  }
  await surfaces.shoot('changed');

  for (const [key, family] of Object.entries(DEFAULTS)) await pick(app, key, family);
  await eventually(() => Object.keys(DEFAULTS).every(key => settings.get_user_value(key) === null), 'choosing Luft’s own fonts in Settings resets both choices', TIMEOUT);
  await eventually(() => shellFamily() === DEFAULTS['font-name'], `which brings back ${DEFAULTS['font-name']} in the shell`, TIMEOUT);
  await eventually(titled('4.0', `${DEFAULTS['font-name']} ${SIZE}`), 'and in GTK 4 apps', TIMEOUT);
  await eventually(titled('3.0', `${DEFAULTS['font-name']} ${SIZE}`), 'and in X11 apps', TIMEOUT);
  for (const name of ['settings', 'tern'] as const) {
    const restored = await surfaces.settle(name, frame => frame.looksLike(defaults[name]));
    restored.saveZoomed(`fonts/${name}-reset`, ZOOM);
    require(restored.looksLike(defaults[name]), `${name} draws exactly as before once the fonts are reset`);
  }
  return defaults;
}

async function checkTextSize(surfaces: Surfaces, clock: St.Label, defaults: Frames) {
  const clockHeight = clock.height;
  settings.set_double('text-scaling-factor', LARGER_TEXT);
  await eventually(() => clock.height > clockHeight, 'larger text reaches the shell');
  const larger = await surfaces.settle('settings', frame => !frame.looksLike(defaults.settings));
  larger.saveZoomed('fonts/settings-larger', ZOOM);
  require(!larger.looksLike(defaults.settings), 'larger text reaches Luft apps');
  settings.reset('text-scaling-factor');
  const normal = await surfaces.settle('settings', frame => frame.looksLike(defaults.settings));
  require(normal.looksLike(defaults.settings), 'Luft apps return to their usual text size');
}

export async function checkFonts(app: LuftApp) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(output('fonts/shell-default')), 0o755);
  let windows: Process[] = [];
  try {
    await show(app, 'appearance/text');
    windows = [gjs('clients/windows/textWindow.js', ['4.0']), gjs('clients/windows/textWindow.js', ['3.0'], {env: {GDK_BACKEND: 'x11'}})];
    await withApp('tern', ['-e', 'sh', '-c', `printf '%s\\n' '${TERMINAL_TEXT}'; sleep 600`], async tern => {
      const [gtk4, xwayland] = await Promise.all(['4.0', '3.0'].map(version => waitForWindow(textWindow(version), `the GTK ${version} text window opens`)));
      const clock = require(styled('kestrel-clock').find(actor => actor instanceof St.Label), 'the taskbar shows its clock');
      const surfaces = new Surfaces(app, tern, gtk4, xwayland, clock);
      await checkTextSize(surfaces, clock, await checkChoosing(app, surfaces, clock));
    });
  } finally {
    for (const key of [...Object.keys(CHOSEN), 'text-scaling-factor']) settings.reset(key);
    await Promise.all(windows.map(stop));
  }
}
