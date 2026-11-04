import Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {exists, read, removeTree, write} from '../apps/lib/files.js';
import {bubblewrapped, inAppScope} from '../lib/access/sandbox.js';
import {existing, named, ofType} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {builtFixture, fixture, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';

const {require, eventually} = checks('Steam games');
const STEAM_APP = 'steam.desktop';
const STEAM_FLATPAK = 'com.valvesoftware.Steam';
const STEAM_SCHEME = 'x-scheme-handler/steam';
const HANDLER = 'com.lantharos.Kestrel.SteamLinks.desktop';
const ICON_HASH = '42ebd3d27fbc6d3af011b8d453ee5999996ad21e';
const ART_HASH = '1b6ff94b7c05c205fbcbd2628f862a1469882f23';
const OPENED_LINKS = () => scratch('steam-links');

const dataPath = (...parts: string[]) => GLib.build_filenamev([GLib.get_user_data_dir(), ...parts]);
const entryPath = (game: string) => dataPath('applications', `steam_app_${game}.desktop`);
const steamPath = (...parts: string[]) => dataPath('Steam', ...parts);
const libraryPath = (...parts: string[]) => scratch('steam-library', ...parts);
const appOf = (window: Meta.Window) => Shell.WindowTracker.get_default().get_window_app(window);
const taskbarButton = (id: string) => named(`kestrel-app-${id}`, existing('kestrel-panel'));

function close(window: Meta.Window) {
  const closed = new Promise<void>(resolve => window.connect('unmanaged', () => resolve()));
  window.delete(global.get_current_time());
  return closed;
}

const manifest = (id: string, name: string) => `"AppState"\n{\n\t"appid"\t\t"${id}"\n\t"name"\t\t"${name}"\n\t"installdir"\t\t"${name}"\n}\n`;

function picture(path: string, width: number, height: number, color: number) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  const png = path.endsWith('.png');
  const pixels = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, png, 8, width, height)!;
  pixels.fill(color);
  pixels.new_subpixbuf(width / 4, height / 4, width / 2, height / 2).fill(0xf4f0e6ff);
  pixels.savev(path, png ? 'png' : 'jpeg', [], []);
}

function installLibrary() {
  write(steamPath('steamapps', 'libraryfolders.vdf'), `"libraryfolders"\n{\n\t"0"\n\t{\n\t\t"path"\t\t"${steamPath()}"\n\t}\n\t"1"\n\t{\n\t\t"path"\t\t"${libraryPath()}"\n\t}\n}\n`);
  write(steamPath('steamapps', 'appmanifest_12345.acf'), manifest('12345', 'Harbour Run™'));
  write(libraryPath('steamapps', 'appmanifest_23456.acf'), manifest('23456', 'Native \\"Quoted\\" Game'));
  write(steamPath('steamapps', 'appmanifest_34567.acf'), manifest('34567', 'Sandboxed Game'));
  const cache = (...parts: string[]) => steamPath('appcache', 'librarycache', ...parts);
  picture(cache('12345', `${ICON_HASH}.jpg`), 32, 32, 0xd9822bff);
  picture(cache('12345', 'logo.png'), 640, 360, 0x2f5d8aff);
  picture(cache('23456', ART_HASH, 'library_600x900.jpg'), 600, 900, 0x2f8a5dff);
  picture(dataPath('icons', 'hicolor', '48x48', 'apps', 'steam_icon_34567.png'), 48, 48, 0x8a2f5dff);
  write(dataPath('applications', 'Shortcut Game.desktop'), '[Desktop Entry]\nType=Application\nName=Shortcut Game\nIcon=steam\nExec=true steam://rungameid/45678\n');
}

function installLinkHandler() {
  const path = dataPath('applications', HANDLER);
  write(path, `[Desktop Entry]\nType=Application\nName=Steam links\nNoDisplay=true\nExec=sh -c 'echo "$1" >> ${OPENED_LINKS()}' sh %u\nMimeType=${STEAM_SCHEME};\n`);
  GioUnix.DesktopAppInfo.new_from_filename(path)!.set_as_default_for_type(STEAM_SCHEME);
}

function removeFixtures() {
  Gio.AppInfo.reset_type_associations(STEAM_SCHEME);
  for (const path of [entryPath('12345'), entryPath('23456'), entryPath('34567'), dataPath('applications', HANDLER), dataPath('applications', 'Shortcut Game.desktop'), OPENED_LINKS()])
    if (exists(path)) GLib.unlink(path);
  removeTree(steamPath());
  removeTree(libraryPath());
  GLib.unlink(dataPath('icons', 'hicolor', '48x48', 'apps', 'steam_icon_34567.png'));
}

async function checkGamesLeaveSteam() {
  const steam = spawn(inAppScope('steam', ['sh', fixture('clients', 'apps', 'steam.sh'), builtFixture('clients', 'x11', 'x11Window.js')]), {env: {GSK_RENDERER: 'cairo'}});
  const flatpak = spawn([...bubblewrapped(STEAM_FLATPAK), 'python3', fixture('clients', 'wayland', 'namedClient.py'), 'Sandboxed game', 'steam_app_34567']);
  const shortcut = spawn(inAppScope('steam', ['python3', fixture('clients', 'wayland', 'namedClient.py'), 'Shortcut game', 'steam_app_45678']));

  const library = await waitForWindow('Stand-in Steam library');
  const friends = await waitForWindow('Stand-in Steam friends');
  require(appOf(library).id === STEAM_APP, 'Steam\'s library stays under Steam');
  require(appOf(friends).id === STEAM_APP, 'a Steam window with a class of its own stays under Steam');

  const game = await waitForWindow('Harbour Run');
  const settings = await waitForWindow('Harbour Run settings');
  await eventually(() => appOf(game).id === 'steam_app_12345.desktop', 'a game started by Steam becomes its own app');
  await eventually(() => appOf(settings) === appOf(game), 'the windows of one game share an app');
  require(appOf(game).get_name() === 'Harbour Run™', `the game goes by the name in its manifest (${appOf(game).get_name()})`);
  require(appOf(game).get_icon()!.to_string()!.endsWith(`${ICON_HASH}.jpg`), 'the game shows its icon from Steam\'s library cache');
  require(appOf(library).get_windows().length === 2, 'only Steam\'s own windows are left under Steam');

  const native = await waitForWindow('Native game');
  await eventually(() => appOf(native).id === 'steam_app_23456.desktop', 'a native game is known by what Steam started it with');
  require(appOf(native).get_name() === 'Native "Quoted" Game', `the manifest comes from the second library folder (${appOf(native).get_name()})`);
  require(appOf(native).get_icon()!.to_string()!.endsWith(`${ART_HASH}/library_600x900.jpg`), 'a game without an icon shows its library picture');

  const sandboxed = await waitForWindow('Sandboxed game');
  require(sandboxed.get_sandboxed_app_id() === STEAM_FLATPAK, 'the stand-in game runs in Steam\'s Flatpak sandbox');
  await eventually(() => appOf(sandboxed).id === 'steam_app_34567.desktop', 'a game inside Steam\'s Flatpak leaves Steam too');
  require(appOf(sandboxed).get_name() === 'Sandboxed Game', 'the sandboxed game goes by its own name');
  require(appOf(sandboxed).get_icon()!.to_string()!.includes('steam_icon_34567'), 'an icon Steam installed in the theme wins over the library cache');

  const withShortcut = await waitForWindow('Shortcut game');
  await eventually(() => appOf(withShortcut).id === 'Shortcut Game.desktop', 'a game with a shortcut from Steam uses that shortcut');
  require(!exists(entryPath('45678')), 'a game with a shortcut gets no second entry');

  const unlisted = await waitForWindow('Unlisted game');
  require(appOf(unlisted).id !== STEAM_APP && appOf(unlisted).is_window_backed(), 'a game with no manifest still gets away from Steam, as its window');

  await eventually(() => ['steam_app_12345.desktop', 'steam_app_23456.desktop', 'steam_app_34567.desktop', STEAM_APP].every(id => taskbarButton(id)?.mapped), 'each game has its own taskbar button');
  await capture('taskbar-steam-games');
  require(ofType(taskbarButton('steam_app_12345.desktop'), St.Button).accessible_name === 'Harbour Run™', 'the button is named after the game');
  require(!Shell.AppSystem.get_default().get_installed().some(info => info.get_id() === 'steam_app_12345.desktop' && info.should_show()), 'games stay out of Start');
  return async () => {
    await Promise.all([library, friends, game, settings, native, unlisted].map(close));
    await Promise.all([steam, flatpak, shortcut].map(stop));
  };
}

async function checkPinnedGameStarts(closeGames: () => Promise<void>) {
  const favorites = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = favorites.get_strv('favorite-apps');
  favorites.set_strv('favorite-apps', [...saved, 'steam_app_12345.desktop']);
  try {
    await closeGames();
    await eventually(() => taskbarButton('steam_app_12345.desktop')?.mapped, 'a pinned game keeps its button once it closes');
    ofType(taskbarButton('steam_app_12345.desktop'), St.Button).emit('clicked', Clutter.BUTTON_PRIMARY);
    await eventually(() => exists(OPENED_LINKS()) && read(OPENED_LINKS()).trim() === 'steam://rungameid/12345', 'clicking a pinned game asks Steam to start it');
  } finally {
    favorites.set_strv('favorite-apps', saved);
  }
}

export async function run() {
  installLibrary();
  installLinkHandler();
  try {
    await checkPinnedGameStarts(await checkGamesLeaveSteam());
  } finally {
    removeFixtures();
  }
}
