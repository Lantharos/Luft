import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';

import {captureFrame, LuftApp, sleep, waitFor} from './luftApp.js';

const TEXT_WINDOW = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', 'fixtures', 'textWindow.js']);
const LUFT_FONTS = GLib.build_filenamev([GLib.getenv('KESTREL_DATADIR'), 'fonts']);
const INTERFACE = 'org.gnome.desktop.interface';
const DEFAULTS = {'font-name': 'Open Runde', 'monospace-font-name': 'Maple Mono NF'};
const CHOSEN = {'font-name': 'Noto Serif', 'monospace-font-name': 'Noto Sans Mono'};
const SIZE = 11;
const PICKERS = {'font-name': [900, 275], 'monospace-font-name': [900, 343]};
const SCROLL_POINT = [650, 400];
const SCROLL_STEPS = 30;
const PICKER_OPEN = 600;
const PAGE_LOADING = 2000;
const LARGER_TEXT = 1.25;
const TERMINAL_TEXT = 'fn main() -> Result<(), Error> { 0x1F != 0o17 }  The quick brown fox 0123456789';
const ZOOM = 4;
const TIMEOUT = 8000;
const PADDING = 6;
const RAISE = 400;
const FONTS_SETTLE = 1500;

function textWindow(version, environment = []) {
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
  for (const [name, value] of environment) launcher.setenv(name, value, true);
  return launcher.spawnv(['gjs', '-m', TEXT_WINDOW, version]);
}

const findWindow = version => global.get_window_actors().map(actor => actor.meta_window)
  .find(window => window.get_title()?.startsWith(`Kestrel text ${version}:`));

function actorWithClass(actor, name) {
  if (actor.has_style_class_name?.(name)) return actor;
  for (const child of actor.get_children()) {
    const found = actorWithClass(child, name);
    if (found) return found;
  }
  return null;
}

function actorArea(actor) {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return {x: Math.floor(x) - PADDING, y: Math.floor(y) - PADDING, width: Math.ceil(width) + 2 * PADDING, height: Math.ceil(height) + 2 * PADDING};
}

const windowArea = (window, {x, y, width, height}) => {
  const frame = window.get_frame_rect();
  return {x: frame.x + x, y: frame.y + y, width, height};
};

function click(pointer, window, [x, y]) {
  const frame = window.get_frame_rect();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
}

function press(keyboard, keyval) {
  keyboard.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.RELEASED);
}

async function scrollToFonts(app, pointer) {
  await sleep(PAGE_LOADING);
  const frame = app.window.get_frame_rect();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + SCROLL_POINT[0], frame.y + SCROLL_POINT[1]);
  for (let step = 0; step < SCROLL_STEPS; step++) {
    pointer.notify_discrete_scroll(GLib.get_monotonic_time(), Clutter.ScrollDirection.DOWN, Clutter.ScrollSource.WHEEL);
    await sleep(30);
  }
  await sleep(PICKER_OPEN);
}

async function pick(app, {pointer, keyboard}, key, family, shot = null) {
  app.window.activate(global.get_current_time());
  await sleep(RAISE);
  click(pointer, app.window, PICKERS[key]);
  await sleep(PICKER_OPEN);
  if (shot) (await app.frame()).save(shot);
  for (const character of family.toLowerCase()) press(keyboard, Clutter.unicode_to_keysym(character.codePointAt(0)));
  await sleep(PICKER_OPEN);
  press(keyboard, Clutter.KEY_Return);
}

async function shoot(surfaces, phase, folder) {
  const frames = {};
  for (const [name, {window, area}] of Object.entries(surfaces)) {
    window?.()?.activate(global.get_current_time());
    await sleep(RAISE);
    frames[name] = await captureFrame(area());
    frames[name].saveZoomed(`${folder}/${name}-${phase}.png`, ZOOM);
  }
  return frames;
}

export async function checkFonts({require, output, pointer}) {
  const keyboard = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  const folder = `${output}/fonts`;
  GLib.mkdir_with_parents(folder, 0o755);
  const settings = new Gio.Settings({schema_id: INTERFACE});
  const userFonts = GLib.build_filenamev([GLib.get_user_data_dir(), 'fonts']);
  GLib.mkdir_with_parents(userFonts, 0o755);
  const link = Gio.File.new_for_path(GLib.build_filenamev([userFonts, 'luft']));
  link.make_symbolic_link(LUFT_FONTS, null);
  const windows = [textWindow('4.0'), textWindow('3.0', [['GDK_BACKEND', 'x11']])];
  const luft = new LuftApp('settings', ['kestrel-settings:appearance']);
  const tern = new LuftApp('tern', ['-e', 'sh', '-c', `printf '%s\\n' '${TERMINAL_TEXT}'; sleep 600`]);
  try {
    await luft.open();
    await scrollToFonts(luft, pointer);
    await tern.open();
    await waitFor(() => findWindow('4.0') && findWindow('3.0'), TIMEOUT, () => 'the GTK text windows did not open');
    await sleep(1500);
    const clock = actorWithClass(global.stage, 'kestrel-clock');
    const shellFamily = () => Pango.FontDescription.from_string(clock.clutter_text.font_name).get_family();
    const surface = (window, area) => ({window, area: () => windowArea(window(), area)});
    const surfaces = {
      shell: {area: () => actorArea(clock)},
      gtk4: surface(() => findWindow('4.0'), {x: 0, y: 40, width: 440, height: 140}),
      xwayland: surface(() => findWindow('3.0'), {x: 0, y: 0, width: 440, height: 130}),
      settings: surface(() => luft.window, {x: 296, y: 8, width: 360, height: 48}),
      sidebar: surface(() => luft.window, {x: 12, y: 116, width: 256, height: 200}),
      tern: surface(() => tern.window, {x: 0, y: 36, width: 560, height: 28}),
    };
    const settled = async (name, app, condition) => {
      surfaces[name].window().activate(global.get_current_time());
      return app.settle(condition, surfaces[name].area());
    };
    const titled = (version, font) => () => findWindow(version).get_title().endsWith(`: ${font}`);
    const eventually = async (condition, label) => {
      await waitFor(condition, TIMEOUT, () => `Kestrel Luft app check failed: ${label}`);
      require(condition(), label);
    };

    const chosen = key => `${CHOSEN[key]} ${SIZE}`;
    require(shellFamily() === DEFAULTS['font-name'], `the shell draws its text in ${DEFAULTS['font-name']} by default`);
    const defaults = await shoot(surfaces, 'default', folder);

    await pick(luft, {pointer, keyboard}, 'font-name', CHOSEN['font-name'], `${folder}/settings-font-picker.png`);
    await eventually(() => settings.get_string('font-name') === chosen('font-name'), 'the interface font picker in Settings finds a font by name and uses it');
    await pick(luft, {pointer, keyboard}, 'monospace-font-name', CHOSEN['monospace-font-name']);
    await eventually(() => settings.get_string('monospace-font-name') === chosen('monospace-font-name'), 'and the monospace one');
    await eventually(() => shellFamily() === CHOSEN['font-name'], 'the shell follows a new interface font');
    await eventually(titled('4.0', chosen('font-name')), 'a GTK 4 app follows a new interface font');
    await eventually(titled('3.0', chosen('font-name')), 'an X11 app under Xwayland follows a new interface font');
    for (const [name, app] of [['settings', luft], ['tern', tern]]) {
      const changed = await settled(name, app, frame => !frame.looksLike(defaults[name]));
      require(!changed.looksLike(defaults[name]), `${name} follows a new ${name === 'tern' ? 'monospace' : 'interface'} font`);
    }
    await shoot(surfaces, 'changed', folder);

    for (const [key, family] of Object.entries(DEFAULTS)) await pick(luft, {pointer, keyboard}, key, family);
    await eventually(() => Object.keys(DEFAULTS).every(key => settings.get_user_value(key) === null), 'choosing Luft’s own fonts in Settings resets both choices');
    await eventually(() => shellFamily() === DEFAULTS['font-name'], `which brings back ${DEFAULTS['font-name']} in the shell`);
    await eventually(titled('4.0', `${DEFAULTS['font-name']} ${SIZE}`), `and in GTK 4 apps`);
    await eventually(titled('3.0', `${DEFAULTS['font-name']} ${SIZE}`), `and in X11 apps`);
    for (const [name, app] of [['settings', luft], ['tern', tern]]) {
      const restored = await settled(name, app, frame => frame.looksLike(defaults[name]));
      restored.saveZoomed(`${folder}/${name}-reset.png`, ZOOM);
      require(restored.looksLike(defaults[name]), `${name} draws exactly as before once the fonts are reset`);
    }

    const clockHeight = clock.height;
    settings.set_double('text-scaling-factor', LARGER_TEXT);
    await eventually(() => clock.height > clockHeight, 'larger text reaches the shell');
    const larger = await settled('settings', luft, frame => !frame.looksLike(defaults.settings));
    larger.saveZoomed(`${folder}/settings-larger.png`, ZOOM);
    require(!larger.looksLike(defaults.settings), 'larger text reaches Luft apps');
    settings.reset('text-scaling-factor');
    const normal = await settled('settings', luft, frame => frame.looksLike(defaults.settings));
    require(normal.looksLike(defaults.settings), 'Luft apps return to their usual text size');
  } finally {
    for (const key of [...Object.keys(CHOSEN), 'text-scaling-factor']) settings.reset(key);
    for (const window of windows) window.force_exit();
    await luft.close();
    await tern.close();
    link.delete(null);
    await sleep(FONTS_SETTLE);
  }
}
