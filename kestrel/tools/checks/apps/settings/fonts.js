import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';

import {firstStyled} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {press, scroll, type} from '../../lib/input.js';
import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {captureFrame, output} from '../../lib/screenshots.js';
import {settled, waitUntil} from '../../lib/wait.js';
import {changes, withApp} from '../lib/apps.js';
import {show} from './navigation.js';

const {require, eventually} = checks('Luft app');
const DEFAULTS = {'font-name': 'Open Runde', 'monospace-font-name': 'Maple Mono NF'};
const CHOSEN = {'font-name': 'Noto Serif', 'monospace-font-name': 'Noto Sans Mono'};
const SIZE = 11;
const PICKERS = {'font-name': [900, 275], 'monospace-font-name': [900, 343]};
const SCROLL_POINT = [650, 400];
const SCROLL_STEPS = 5;
const LARGER_TEXT = 1.25;
const TERMINAL_TEXT = 'fn main() -> Result<(), Error> { 0x1F != 0o17 }  The quick brown fox 0123456789';
const ZOOM = 4;
const TIMEOUT = 8000;
const PADDING = 6;

const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const textWindow = version => window => window.get_title()?.startsWith(`Kestrel text ${version}:`);
const chosen = key => `${CHOSEN[key]} ${SIZE}`;

function actorArea(actor) {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return {x: Math.floor(x) - PADDING, y: Math.floor(y) - PADDING, width: Math.ceil(width) + 2 * PADDING, height: Math.ceil(height) + 2 * PADDING};
}

const windowArea = (window, {x, y, width, height}) => {
  const frame = window.get_frame_rect();
  return {x: frame.x + x, y: frame.y + y, width, height};
};

async function raise(window) {
  window.activate(global.get_current_time());
  await waitUntil(() => window.has_focus() && global.display.sort_windows_by_stacking(global.display.list_all_windows()).at(-1) === window,
    `${window.get_title()} comes to the front`);
  await settled();
}

class Surfaces {
  constructor(app, tern, gtk4, xwayland, clock) {
    const surface = (window, area) => ({window, area: () => windowArea(window, area)});
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

  async shoot(phase) {
    const frames = {};
    for (const [name, {window, area}] of Object.entries(this.all)) {
      if (window) await raise(window);
      frames[name] = await captureFrame(area());
      frames[name].saveZoomed(`fonts/${name}-${phase}`, ZOOM);
    }
    return frames;
  }

  async settle(name, condition) {
    await raise(this.all[name].window);
    return this.apps[name].settle(condition, this.all[name].area());
  }
}

async function pick(app, key, family, shot = null) {
  await raise(app.window);
  await changes(app, 'the font picker opens', () => app.click(PICKERS[key]));
  if (shot) (await app.frame()).save(shot);
  await changes(app, `the font picker finds ${family}`, () => type(family.toLowerCase()));
  press(Clutter.KEY_Return);
}

async function scrollToFonts(app) {
  await show(app, 'appearance');
  let before;
  let after = await app.frame();
  do {
    before = after;
    for (let step = 0; step < SCROLL_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(SCROLL_POINT));
    await settled();
    after = await app.frame();
  } while (!after.looksLike(before));
}

async function checkChoosing(app, surfaces, clock) {
  const shellFamily = () => Pango.FontDescription.from_string(clock.clutter_text.font_name).get_family();
  const titled = (match, font) => () => global.display.list_all_windows().find(textWindow(match))?.get_title().endsWith(`: ${font}`);
  require(shellFamily() === DEFAULTS['font-name'], `the shell draws its text in ${DEFAULTS['font-name']} by default`);
  const defaults = await surfaces.shoot('default');

  await pick(app, 'font-name', CHOSEN['font-name'], 'fonts/settings-font-picker');
  await eventually(() => settings.get_string('font-name') === chosen('font-name'), 'the interface font picker in Settings finds a font by name and uses it', TIMEOUT);
  await pick(app, 'monospace-font-name', CHOSEN['monospace-font-name']);
  await eventually(() => settings.get_string('monospace-font-name') === chosen('monospace-font-name'), 'and the monospace one', TIMEOUT);
  await eventually(() => shellFamily() === CHOSEN['font-name'], 'the shell follows a new interface font', TIMEOUT);
  await eventually(titled('4.0', chosen('font-name')), 'a GTK 4 app follows a new interface font', TIMEOUT);
  await eventually(titled('3.0', chosen('font-name')), 'an X11 app under Xwayland follows a new interface font', TIMEOUT);
  for (const name of ['settings', 'tern']) {
    const changed = await surfaces.settle(name, frame => !frame.looksLike(defaults[name]));
    require(!changed.looksLike(defaults[name]), `${name} follows a new ${name === 'tern' ? 'monospace' : 'interface'} font`);
  }
  await surfaces.shoot('changed');

  for (const [key, family] of Object.entries(DEFAULTS)) await pick(app, key, family);
  await eventually(() => Object.keys(DEFAULTS).every(key => settings.get_user_value(key) === null), 'choosing Luft’s own fonts in Settings resets both choices', TIMEOUT);
  await eventually(() => shellFamily() === DEFAULTS['font-name'], `which brings back ${DEFAULTS['font-name']} in the shell`, TIMEOUT);
  await eventually(titled('4.0', `${DEFAULTS['font-name']} ${SIZE}`), 'and in GTK 4 apps', TIMEOUT);
  await eventually(titled('3.0', `${DEFAULTS['font-name']} ${SIZE}`), 'and in X11 apps', TIMEOUT);
  for (const name of ['settings', 'tern']) {
    const restored = await surfaces.settle(name, frame => frame.looksLike(defaults[name]));
    restored.saveZoomed(`fonts/${name}-reset`, ZOOM);
    require(restored.looksLike(defaults[name]), `${name} draws exactly as before once the fonts are reset`);
  }
  return defaults;
}

async function checkTextSize(surfaces, clock, defaults) {
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

export async function checkFonts(app) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(output('fonts/shell-default')), 0o755);
  let windows = [];
  try {
    await scrollToFonts(app);
    windows = [gjs('clients/textWindow.js', ['4.0']), gjs('clients/textWindow.js', ['3.0'], {env: {GDK_BACKEND: 'x11'}})];
    await withApp('tern', ['-e', 'sh', '-c', `printf '%s\\n' '${TERMINAL_TEXT}'; sleep 600`], async tern => {
      const [gtk4, xwayland] = await Promise.all(['4.0', '3.0'].map(version => waitForWindow(textWindow(version), `the GTK ${version} text window opens`)));
      const clock = firstStyled('kestrel-clock');
      const surfaces = new Surfaces(app, tern, gtk4, xwayland, clock);
      await checkTextSize(surfaces, clock, await checkChoosing(app, surfaces, clock));
    });
  } finally {
    for (const key of [...Object.keys(CHOSEN), 'text-scaling-factor']) settings.reset(key);
    await Promise.all(windows.map(stop));
  }
}
