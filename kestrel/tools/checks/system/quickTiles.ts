import Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {
  getStyleVariant, accelerometer, PopupBaseMenuItem, PopupImageMenuItem, PopupMenuItem, QuickMenuToggle, QuickSlider, QuickToggle, toggleSurface,
} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, existing, named, ofType, shown, styled, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {property} from '../lib/dbus.js';
import {chord, click, drag, press, rest, rightClick, type Point} from '../lib/input/input.js';
import {gjs, scratch, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {contrast} from '../lib/colors.js';

const {require, eventually} = checks('quick tile');
const TILES = ['Keep Awake', 'Dark Style', 'Airplane Mode', 'Keyboard Backlight'];
const LINK_SCHEME = 'x-scheme-handler/kestrel-settings';
const LINKS = new Map([
  ['Sound Settings', 'kestrel-settings:sound'],
  ['Power Settings', 'kestrel-settings:power'],
  ['All Networks', 'kestrel-settings:network/wifi'],
]);

const ACCENT_WALLPAPERS = [['yellow', 0xe8c020ff], ['blue', 0x1838a8ff]] as const;
const SCHEMES = [['default', 'light', 'LightColors'], ['prefer-dark', 'dark', 'DarkColors']] as const;

const quick = () => existing('kestrel-quick-settings');
const menu = () => existing('kestrel-context-menu');
const tile = (title: string) => styled('kestrel-control', quick())
  .find((control): control is QuickToggle | QuickMenuToggle => (control instanceof QuickToggle || control instanceof QuickMenuToggle) && control.title === title) ?? null;
const existingTile = (title: string) => ofType(tile(title), St.Button);
const more = (control: Clutter.Actor) => ofType(styled('kestrel-control-more', control)[0], St.Button);
const subtitle = (control: Clutter.Actor) => ofType(styled('kestrel-control-subtitle', control)[0], St.Label).text;
const grid = () => ofType(styled('kestrel-control', quick())[0].get_parent(), Clutter.Actor);
const statusShows = (name: string) => descendants(existing('Quick settings', existing('kestrel-panel')))
  .some(actor => actor.visible && (actor instanceof St.Icon || actor instanceof St.Button) && actor.icon_name === name);

const appearance = <T>(name: string) => property<T>('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Appearance', 'com.lantharos.Kestrel.Appearance', name);
const hex = (color: Cogl.Color) => color.to_string().slice(0, 7);
const foreground = (actor: St.Widget) => hex(actor.get_theme_node().get_foreground_color());

function composited(tile: St.Widget, backdrop: string) {
  const color = tile.get_theme_node().get_background_color();
  const alpha = color.alpha / 255;
  const channels = [color.red, color.green, color.blue].map((channel, index) =>
    Math.round(channel * alpha + parseInt(backdrop.slice(1 + index * 2, 3 + index * 2), 16) * (1 - alpha)));
  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function solidWallpaper(name: string, color: number) {
  const path = scratch(`quick-tiles-${name}.png`);
  const pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 64, 40);
  pixbuf.fill(color);
  pixbuf.savev(path, 'png', [], []);
  return Gio.File.new_for_path(path).get_uri();
}

function surfaceCorner(): Point {
  const [x, y] = quick().get_transformed_position();
  return [x + 20, y + 8];
}

async function toggle(control: St.Button, label: string, effect: (checked: boolean) => boolean) {
  const before = control.checked;
  control.emit('clicked', 1);
  await eventually(() => control.checked !== before && effect(control.checked), label);
}

async function checkKeepAwake() {
  const keepAwake = existingTile('Keep Awake');
  const placed = grid().get_n_children();
  new Gio.Settings({schema_id: 'com.lantharos.kestrel'}).set_strv('quick-tiles-removed', []);
  await eventually(() => grid().get_n_children() > placed, 'tiles hidden by default come back when the setting changes');
  await settled();
  await toggle(keepAwake, 'keep awake holds the session awake and shows the eye', checked => checked && statusShows('view-reveal-symbolic'));
  await toggle(keepAwake, 'turning keep awake off lets the session sleep', checked => !checked && !statusShows('view-reveal-symbolic'));

  more(keepAwake).emit('clicked', 1);
  const hour = () => named('1 Hour', quick()) ?? descendants(quick())
    .find(actor => actor.visible && actor instanceof St.Widget && textOf(actor.label_actor) === '1 Hour') ?? null;
  const hourItem = ofType(await eventually(() => shown(hour()) && hour(), 'keep awake offers how long to stay awake'), PopupBaseMenuItem);
  await settled();
  const [, hourY] = hourItem.get_transformed_position();
  require(keepAwake.width === grid().width && hourY > keepAwake.get_transformed_position()[1] + keepAwake.height,
    'options open inline beneath a full-width tile');
  require(quick().visible && !named('Back to quick settings', quick()), 'options stay in the same view');
  const scroller = ofType(styled('kestrel-app-scroll', quick())[0], St.ScrollView);
  require(scroller.vadjustment.upper > scroller.vadjustment.page_size && hourY < scroller.get_transformed_position()[1] + scroller.height,
    'long quick settings scroll to show the open options');
  await capture('keep-awake-menu');
  hourItem.activate(null);
  await eventually(() => keepAwake.checked && subtitle(keepAwake).startsWith('Until '), 'a timed keep awake shows when it ends');
  await toggle(keepAwake, 'a timed keep awake can be turned off', checked => !checked);
}

async function checkToggles(interfaceSettings: Gio.Settings) {
  const airplane = existingTile('Airplane Mode');
  await toggle(airplane, 'airplane mode turns on and shows in the panel', checked => checked && statusShows('airplane-mode-symbolic'));
  await toggle(airplane, 'airplane mode turns off', checked => !checked && !statusShows('airplane-mode-symbolic'));

  const keyboard = existingTile('Keyboard Backlight');
  require(keyboard.checked, 'the keyboard tile reflects a lit backlight');
  await toggle(keyboard, 'the keyboard tile turns the backlight off', checked => !checked);
  await toggle(keyboard, 'and on again', checked => checked);

  const dark = existingTile('Dark Style');
  const scheme = interfaceSettings.get_string('color-scheme');
  await toggle(dark, 'dark style switches the app color scheme', () => interfaceSettings.get_string('color-scheme') !== scheme);

  more(keyboard).emit('clicked', 1);
  await eventually(() => keyboard.width === grid().width, 'the keyboard tile opens its options');
  await capture('keyboard-backlight-menu');
  more(keyboard).emit('clicked', 1);
  await eventually(() => keyboard.width < grid().width / 2 + 1, 'closing options returns the tile to the grid');

  const volume = ofType(descendants(quick()).find(actor => actor instanceof QuickSlider && actor.menuEnabled) ?? null, QuickSlider);
  volume.menuButton.emit('clicked', 1);
  await eventually(() => volume.menu.isOpen, 'the device chevron opens the device list');
  volume.menuButton.emit('clicked', 1);
  await eventually(() => !volume.menu.isOpen, 'the same chevron closes it again');
}

async function checkActiveInk(name: string, interfaceSettings: Gio.Settings) {
  const accent = await appearance<string>('AccentColor');
  for (const [scheme, variant, colors] of SCHEMES) {
    interfaceSettings.set_string('color-scheme', scheme);
    await eventually(() => {
      const [accentColor] = St.ThemeContext.get_for_stage(global.stage).get_accent_color();
      return getStyleVariant() === variant && !!accentColor && hex(accentColor) === accent;
    }, `the shell turns ${variant} with the ${name} accent`);
    await settled();
    const {surface} = await appearance<{surface: string}>(colors);
    const active = styled('kestrel-control', quick()).filter(control => control instanceof St.Button && control.checked && control.visible);
    require(active.length > 1 && active.every(control => {
      const ink = foreground(styled('kestrel-control-title', control)[0]);
      return styled('kestrel-control-icon', control).every(icon => foreground(icon) === ink) && contrast(ink, composited(control, surface)) >= 4.5;
    }), `active tiles draw their icons, chevrons and text in one readable color on the ${name} accent in ${variant}`);
    await capture(`quick-settings-active-${name}-${variant}`);
  }
}

async function checkActiveTiles(shellSettings: Gio.Settings, interfaceSettings: Gio.Settings) {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const wallpapers = ['picture-uri', 'picture-uri-dark'].map(key => [key, background.get_string(key)]);
  try {
    shellSettings.set_string('accent', 'white');
    await eventually(async () => await appearance<string>('AccentColor') === '#ffffff', 'a white accent can be chosen');
    await checkActiveInk('white', interfaceSettings);
    shellSettings.set_string('accent', 'wallpaper');
    for (const [name, color] of ACCENT_WALLPAPERS) {
      const before = await appearance<string>('AccentColor');
      const uri = solidWallpaper(name, color);
      for (const [key] of wallpapers) background.set_string(key, uri);
      await eventually(async () => await appearance<string>('AccentColor') !== before, `the accent follows the ${name} wallpaper`);
      await checkActiveInk(name, interfaceSettings);
    }
  } finally {
    for (const [key, uri] of wallpapers) background.set_string(key, uri);
    shellSettings.reset('accent');
  }
}

async function checkLayout(shellSettings: Gio.Settings) {
  await settled();
  const [first, second] = grid().get_children().filter(actor => actor instanceof St.Widget && actor.has_style_class_name('kestrel-control') && actor.visible)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  await drag(first, second, {hover: 200});
  await eventually(() => first.x > second.x && shellSettings.get_strv('quick-tile-order').length > 0, 'dragging a tile moves it and remembers the order');

  const dark = existingTile('Dark Style');
  await settled();
  rightClick(dark);
  await eventually(() => shown(named('Remove', menu())), 'customizing a tile offers to remove it');
  click(existing('Remove', menu()));
  await eventually(() => !dark.get_parent() && shellSettings.get_strv('quick-tiles-removed').includes('dark-style-0'), 'tiles can be removed from Quick Settings');
  rest();
  await settled();
  rightClick(surfaceCorner());
  await eventually(() => shown(named('Add', menu())), 'customized quick settings offer to add tiles back');
  click(existing('Add', menu()));
  await eventually(() => shown(named('Dark Style', menu())), 'the removed tiles are listed');
  click(existing('Dark Style', menu()));
  await eventually(() => dark.get_parent() === grid() && dark.visible, 'removed tiles can be added back');
}

async function openAddList() {
  await eventually(() => !menu().visible && shown(quick()), 'quick settings are open with no menu');
  await settled();
  rightClick(surfaceCorner());
  await eventually(() => shown(named('Add', menu())), 'quick settings offer to add tiles');
  click(existing('Add', menu()));
  await eventually(() => shown(named('Screenshot', menu())), 'the add list shows the tiles hidden by default');
}

async function checkRotation() {
  const touchscreen = new Gio.Settings({schema_id: 'com.lantharos.kestrel.touchscreen'});
  require(!tile('Auto Rotate'), 'auto rotate is not shown by default');
  await openAddList();
  require(!named('Auto Rotate', menu()), 'the add list leaves out auto rotate without an accelerometer');
  press(Clutter.KEY_Escape);
  const sensor = gjs('services/sensorProxy.js');
  try {
    await eventually(() => accelerometer.present, 'Kestrel finds the accelerometer');
    await openAddList();
    require(shown(named('Auto Rotate', menu())), 'the add list offers auto rotate with an accelerometer');
    click(existing('Auto Rotate', menu()));
    const rotation = await waitUntil(() => tile('Auto Rotate')?.get_parent() === grid() && tile('Auto Rotate')?.visible && tile('Auto Rotate'), 'auto rotate can be added');
    rest();
    await settled();
    require(rotation.checked && subtitle(rotation) === 'On' && rotation.icon_name === 'rotation-allowed-symbolic', 'auto rotate starts on');
    await capture('quick-settings-rotation');
    await toggle(rotation, 'turning auto rotate off locks the rotation',
      checked => !checked && touchscreen.get_boolean('orientation-lock') && subtitle(rotation) === 'Off' && rotation.icon_name === 'rotation-locked-symbolic');
    await chord(Clutter.KEY_Super_L, Clutter.KEY_o);
    await eventually(() => rotation.checked && !touchscreen.get_boolean('orientation-lock'), 'Super+O turns auto rotate back on');
  } finally {
    touchscreen.reset('orientation-lock');
    await stop(sensor);
  }
  await eventually(() => !existingTile('Auto Rotate').visible, 'auto rotate goes away with the accelerometer');
}

function recordingHandler(opened: string) {
  const applications = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(applications, 0o755);
  const desktop = GLib.build_filenamev([applications, 'com.lantharos.SettingsLinkCheck.desktop']);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=Settings Link Check\nExec=sh -c 'printf "%%s\\n" "$1" >> ${opened}' settings %u\nMimeType=${LINK_SCHEME};\nNoDisplay=true\n`);
  return desktop;
}

function openedLinks(opened: string) {
  if (!GLib.file_test(opened, GLib.FileTest.EXISTS)) return [];
  return new TextDecoder().decode(GLib.file_get_contents(opened)[1]).trim().split('\n').sort();
}

async function checkSettingsLinks() {
  const opened = scratch('kestrel-settings-links.txt');
  const desktop = recordingHandler(opened);
  const previous = Gio.AppInfo.get_default_for_type(LINK_SCHEME, false);
  try {
    GioUnix.DesktopAppInfo.new_from_filename(desktop)!.set_as_default_for_type(LINK_SCHEME);
    const items = descendants(quick()).filter((actor): actor is PopupMenuItem | PopupImageMenuItem =>
      (actor instanceof PopupMenuItem || actor instanceof PopupImageMenuItem) && LINKS.has(actor.label.text));
    require([...LINKS.keys()].every(title => items.some(item => item.label.text === title)), 'quick settings menus offer their Settings pages');
    for (const item of items) item.activate(null);
    const expected = items.map(item => LINKS.get(item.label.text)).sort().join();
    await eventually(() => openedLinks(opened).join() === expected, 'each menu opens its own Settings page');
  } finally {
    if (previous) previous.set_as_default_for_type(LINK_SCHEME);
    else Gio.AppInfo.reset_type_associations(LINK_SCHEME);
    GLib.unlink(desktop);
    GLib.unlink(opened);
  }
}

export async function run() {
  const shellSettings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  gjs('system/laptopServices.js');
  try {
    toggleSurface('quick');
    await eventually(() => shown(quick()) && TILES.every(title => tile(title)?.visible), 'quick settings show every available tile', 10000);
    await capture('quick-settings-tiles');
    await checkRotation();
    shellSettings.reset('quick-tiles-removed');
    await checkKeepAwake();
    await checkToggles(interfaceSettings);
    await checkActiveTiles(shellSettings, interfaceSettings);
    await checkLayout(shellSettings);
    await checkSettingsLinks();
  } finally {
    shellSettings.reset('quick-tile-order');
    shellSettings.reset('quick-tiles-removed');
    interfaceSettings.set_string('color-scheme', colorScheme);
  }
}
