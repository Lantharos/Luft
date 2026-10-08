import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {descendants, named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {click, drag, rest, rightClick} from '../lib/input.js';
import {gjs, scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('quick tile');
const TILES = ['Keep Awake', 'Dark Style', 'Airplane Mode', 'Keyboard Backlight'];
const LINK_SCHEME = 'x-scheme-handler/kestrel-settings';
const LINKS = new Map([
  ['Sound Settings', 'kestrel-settings:sound'],
  ['Power Settings', 'kestrel-settings:power'],
  ['All Networks', 'kestrel-settings:network'],
]);

const quick = () => named('kestrel-quick-settings');
const menu = () => named('kestrel-context-menu');
const tile = title => styled('kestrel-control', quick()).find(control => control.title === title);
const more = control => styled('kestrel-control-more', control)[0];
const subtitle = control => styled('kestrel-control-subtitle', control)[0].text;
const grid = () => styled('kestrel-control', quick())[0].get_parent();
const statusShows = name => descendants(named('Quick settings', named('kestrel-panel'))).some(actor => actor.visible && actor.icon_name === name);

function surfaceCorner() {
  const [x, y] = quick().get_transformed_position();
  return [x + 20, y + 8];
}

async function toggle(control, label, effect) {
  const before = control.checked;
  control.emit('clicked', 1);
  await eventually(() => control.checked !== before && effect(control.checked), label);
}

async function checkKeepAwake() {
  const keepAwake = tile('Keep Awake');
  rightClick(surfaceCorner());
  await settled();
  require(!menu().visible, 'quick settings has no context menu until the layout is customized');
  await toggle(keepAwake, 'keep awake holds the session awake and shows the eye', checked => checked && statusShows('view-reveal-symbolic'));
  await toggle(keepAwake, 'turning keep awake off lets the session sleep', checked => !checked && !statusShows('view-reveal-symbolic'));

  more(keepAwake).emit('clicked', 1);
  const hour = () => named('1 Hour', quick()) ?? descendants(quick()).find(actor => actor.visible && actor.label_actor?.text === '1 Hour');
  await eventually(() => shown(hour()), 'keep awake offers how long to stay awake');
  await settled();
  const [, hourY] = hour().get_transformed_position();
  require(keepAwake.width === grid().width && hourY > keepAwake.get_transformed_position()[1] + keepAwake.height,
    'options open inline beneath a full-width tile');
  require(quick().visible && !named('Back to quick settings', quick()), 'options stay in the same view');
  const scroller = styled('kestrel-app-scroll', quick())[0];
  require(scroller.vadjustment.upper > scroller.vadjustment.page_size && hourY < scroller.get_transformed_position()[1] + scroller.height,
    'long quick settings scroll to show the open options');
  await capture('keep-awake-menu');
  hour().activate(null);
  await eventually(() => keepAwake.checked && subtitle(keepAwake).startsWith('Until '), 'a timed keep awake shows when it ends');
  await toggle(keepAwake, 'a timed keep awake can be turned off', checked => !checked);
}

async function checkToggles(interfaceSettings) {
  const airplane = tile('Airplane Mode');
  await toggle(airplane, 'airplane mode turns on and shows in the panel', checked => checked && statusShows('airplane-mode-symbolic'));
  await toggle(airplane, 'airplane mode turns off', checked => !checked && !statusShows('airplane-mode-symbolic'));

  const keyboard = tile('Keyboard Backlight');
  require(keyboard.checked, 'the keyboard tile reflects a lit backlight');
  await toggle(keyboard, 'the keyboard tile turns the backlight off', checked => !checked);
  await toggle(keyboard, 'and on again', checked => checked);

  const dark = tile('Dark Style');
  const scheme = interfaceSettings.get_string('color-scheme');
  await toggle(dark, 'dark style switches the app color scheme', () => interfaceSettings.get_string('color-scheme') !== scheme);

  more(keyboard).emit('clicked', 1);
  await eventually(() => keyboard.width === grid().width, 'the keyboard tile opens its options');
  await capture('keyboard-backlight-menu');
  more(keyboard).emit('clicked', 1);
  await eventually(() => keyboard.width < grid().width / 2 + 1, 'closing options returns the tile to the grid');

  const volume = descendants(quick()).find(actor => actor.slider && actor.menu && actor.menuEnabled);
  volume._menuButton.emit('clicked', 1);
  await eventually(() => volume.menu.isOpen, 'the device chevron opens the device list');
  volume._menuButton.emit('clicked', 1);
  await eventually(() => !volume.menu.isOpen, 'the same chevron closes it again');
}

async function checkLayout(shellSettings) {
  await settled();
  const [first, second] = grid().get_children().filter(actor => actor.has_style_class_name?.('kestrel-control') && actor.visible)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  await drag(first, second, {hover: 200});
  await eventually(() => first.x > second.x && shellSettings.get_strv('quick-tile-order').length > 0, 'dragging a tile moves it and remembers the order');

  const dark = tile('Dark Style');
  await settled();
  rightClick(dark);
  await eventually(() => shown(named('Remove', menu())), 'customizing a tile offers to remove it');
  click(named('Remove', menu()));
  await eventually(() => !dark.get_parent() && shellSettings.get_strv('quick-tiles-removed').includes('dark-style-0'), 'tiles can be removed from Quick Settings');
  rest();
  await settled();
  rightClick(surfaceCorner());
  await eventually(() => shown(named('Add', menu())), 'customized quick settings offer to add tiles back');
  click(named('Add', menu()));
  await eventually(() => shown(named('Dark Style', menu())), 'the removed tiles are listed');
  click(named('Dark Style', menu()));
  await eventually(() => dark.get_parent() === grid() && dark.visible, 'removed tiles can be added back');
}

function recordingHandler(opened) {
  const applications = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(applications, 0o755);
  const desktop = GLib.build_filenamev([applications, 'com.lantharos.SettingsLinkCheck.desktop']);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=Settings Link Check\nExec=sh -c 'printf "%%s\\n" "$1" >> ${opened}' settings %u\nMimeType=${LINK_SCHEME};\nNoDisplay=true\n`);
  return desktop;
}

function openedLinks(opened) {
  if (!GLib.file_test(opened, GLib.FileTest.EXISTS)) return [];
  return new TextDecoder().decode(GLib.file_get_contents(opened)[1]).trim().split('\n').sort();
}

async function checkSettingsLinks() {
  const opened = scratch('kestrel-settings-links.txt');
  const desktop = recordingHandler(opened);
  const previous = Gio.AppInfo.get_default_for_type(LINK_SCHEME, false);
  try {
    Gio.DesktopAppInfo.new_from_filename(desktop).set_as_default_for_type(LINK_SCHEME);
    const items = descendants(quick()).filter(actor => LINKS.has(actor.label?.text));
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
    await checkKeepAwake();
    await checkToggles(interfaceSettings);
    await checkLayout(shellSettings);
    await checkSettingsLinks();
  } finally {
    shellSettings.reset('quick-tile-order');
    shellSettings.reset('quick-tiles-removed');
    interfaceSettings.set_string('color-scheme', colorScheme);
  }
}
