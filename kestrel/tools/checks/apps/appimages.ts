import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {scroll, type Point} from '../lib/input/input.js';
import {fixture, outcome, repository, scratch, spawn, stop, waitForWindow, windows} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, waitUntil} from '../lib/wait.js';
import {withApp} from './lib/apps.js';
import {showEnd} from './settings/navigation.js';

const {require} = checks('AppImage sandbox');
const SCHELF = repository('target', 'release', 'schelf');
const SANDBOX = '--sandbox';
const APPIMAGE_BUILDER = fixture('sandbox', 'appimage.py');
const RENDERER = fixture('sandbox', 'renderer');
const SABINE_BUILDER = fixture('sandbox', 'sabine.py');
const ZYPAK = '/usr/lib/zypak/zypak-helper';
const WINDOW_TIMEOUT = 60000;
const LOADING = 5000;
const FIRST_APP: Point = [655, 468];
const SCROLL_STEPS = 5;

export const timeout = 1200000;

const applications = () => GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
const desktopFile = (id: string) => GLib.build_filenamev([applications(), `${id}.desktop`]);

function entries(): Set<string> {
  const folder = Gio.File.new_for_path(applications());
  if (!folder.query_exists(null)) return new Set();
  return new Set([...folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(info => info.get_name()).filter(name => name.endsWith('.desktop')).map(name => name.slice(0, -'.desktop'.length)));
}

function launchLine(id: string) {
  const entry = new GLib.KeyFile();
  entry.load_from_file(desktopFile(id), GLib.KeyFileFlags.NONE);
  const [program, ...rest] = GLib.shell_parse_argv(entry.get_string('Desktop Entry', 'Exec'))[1]!;
  return {program, rest: rest.filter(argument => !argument.startsWith('%') && !argument.startsWith('@@')), entry};
}

async function install(path: string) {
  const copy = scratch(`appimage-${GLib.path_get_basename(path)}`);
  Gio.File.new_for_path(path).copy(Gio.File.new_for_path(copy), Gio.FileCopyFlags.OVERWRITE, null, null);
  const before = entries();
  const installed = await outcome([SCHELF, 'install', '--yes', copy]);
  require(installed.ok, `Schelf installs ${GLib.path_get_basename(path)}`);
  const [id] = [...entries()].filter(name => !before.has(name));
  require(id, `${GLib.path_get_basename(path)} gets a menu entry`);
  const {program, rest} = launchLine(id);
  require(program === GLib.canonicalize_filename(SCHELF, null) && rest[0] === SANDBOX && rest[1] === id, `the menu entry of ${id} starts it in its sandbox`);
  return id;
}

function launch(id: string) {
  const {program, rest} = launchLine(id);
  return spawn([program, ...rest]);
}

const isWayland = (window: Meta.Window) => window.get_client_type() === Meta.WindowClientType.WAYLAND;

async function checkApp(path: string) {
  const id = await install(path);
  const name = launchLine(id).entry.get_string('Desktop Entry', 'Name');
  for (const launchNumber of [1, 2]) {
    const before = new Set(windows());
    const process = launch(id);
    const window = await waitForWindow(candidate => !before.has(candidate) && (!isWayland(candidate) || candidate.get_sandboxed_app_id() === id),
      `${name} opens a window that Kestrel knows as ${id} (launch ${launchNumber})`, WINDOW_TIMEOUT);
    if (!isWayland(window)) console.log(`Kestrel AppImage sandbox: ${name} uses X11, where windows carry no sandbox`);
    require(GLib.file_test(GLib.build_filenamev([GLib.get_home_dir(), '.var', 'app', id]), GLib.FileTest.IS_DIR),
      `${name} keeps its files in a folder of its own`);
    if (launchNumber === 1) {
      await pause(LOADING);
      await capture(`appimage-${id}`);
    }
    await stop(process);
  }
  return id;
}

function notificationTitled(text: string) {
  for (const source of Main.messageTray.getSources())
    for (const notification of source.notifications)
      if (notification.title?.includes(text)) return notification;
  return null;
}

async function checkDeviceRequest(path: string) {
  const id = await install(path);
  const name = launchLine(id).entry.get_string('Desktop Entry', 'Name');
  const process = launch(id);
  try {
    const notification = await waitUntil(() => notificationTitled(name), `${name} looking for USB devices offers it more access`, WINDOW_TIMEOUT);
    require(notification, `${name} looking for USB devices offers it more access`);
    await capture(`appimage-device-${id}`);
    notification.destroy();
  } finally {
    await stop(process);
  }
}

interface RendererReport {
  browser: {namespaces: number};
  renderer: {seccomp: number; namespaces: number};
  noSandbox: boolean;
}

async function checkRendererSandbox(electron: string) {
  const image = scratch('Renderer.AppImage');
  require((await outcome(['python3', APPIMAGE_BUILDER, image, 'org.example.Renderer', 'Renderer', GLib.path_get_dirname(electron), RENDERER])).ok,
    'an Electron AppImage is built');
  const id = await install(image);
  const {program, rest} = launchLine(id);
  const ran = await outcome([program, ...rest]);
  const line = ran.stdout.split('\n').find(text => text.startsWith('{'));
  if (!line) console.log(`Kestrel AppImage sandbox: ${id} said\n${ran.stderr}`);
  require(line, `${id} reports how its renderer runs`);
  const report = JSON.parse(line!) as RendererReport;
  require(!report.noSandbox, 'Electron runs in the AppImage sandbox without --no-sandbox');
  require(report.renderer.seccomp === 2, "Electron's renderer filters its system calls in the AppImage sandbox");
  require(report.renderer.namespaces > report.browser.namespaces,
    "Electron's renderer runs in a sandbox of its own, nested in the app's");
}

async function checkDeclaredAccess() {
  const image = scratch('Harbor.AppImage');
  const declared = 'network = false\nfilesystems = ["home:ro"]\n';
  require((await outcome(['python3', SABINE_BUILDER, image, 'org.example.Harbor', 'Harbor', declared])).ok,
    'a Sabine AppImage that declares what it needs is built');
  const id = await install(image);
  GLib.file_set_contents(GLib.build_filenamev([GLib.get_home_dir(), 'harbor-marker']), 'here');
  const {program, rest} = launchLine(id);
  const script = 'cut -d: -f1 /proc/net/dev | tail -n +3 | tr -d " "; test -f "$HOME/harbor-marker" && echo home; ' +
    'touch "$HOME/written" 2>/dev/null && echo written; mkdir -p "$XDG_DATA_HOME" && touch "$XDG_DATA_HOME/own" && echo own';
  const lines = (await outcome([program, ...rest, 'sh', '-c', script])).stdout.split('\n');
  const interfaces = lines.filter(line => line && !['home', 'written', 'own'].includes(line));
  require(interfaces.join() === 'lo', 'a Sabine app that declares it stays offline gets no network');
  require(lines.includes('home'), 'a Sabine app sees the folder it declared');
  require(!lines.includes('written'), 'a folder declared read-only stays read-only');
  require(lines.includes('own'), 'an app given your home folder still keeps its own files in its folder');
}

function appImagesIn(folder: string) {
  const found = Gio.File.new_for_path(folder);
  if (!found.query_exists(null)) return [];
  return [...found.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(info => info.get_name()).filter(name => name.endsWith('.AppImage')).sort()
    .map(name => GLib.build_filenamev([folder, name]));
}

export async function run() {
  if (!GLib.find_program_in_path('squashfuse_ll')) {
    console.log('Kestrel AppImage sandbox: skipped without squashfuse');
    return;
  }
  await checkDeclaredAccess();
  const electron = GLib.getenv('KESTREL_ELECTRON');
  if (electron && GLib.file_test(ZYPAK, GLib.FileTest.IS_EXECUTABLE)) await checkRendererSandbox(electron);
  else if (electron) console.log('Kestrel AppImage sandbox: Electron\'s renderer sandbox skipped without Zypak');
  const appImages = GLib.getenv('KESTREL_APPIMAGES');
  if (!appImages) {
    console.log('Kestrel AppImage sandbox: AppImages skipped without KESTREL_APPIMAGES');
    return;
  }
  for (const path of appImagesIn(appImages)) await checkApp(path);
  await withApp('settings', [], async app => {
    (await showEnd(app, 'apps')).save('appimage-settings-apps');
    app.click(FIRST_APP);
    for (let step = 0; step < SCROLL_STEPS; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(FIRST_APP));
    (await app.settle(() => true)).save('appimage-settings-app');
  });
  for (const path of appImagesIn(GLib.build_filenamev([appImages, 'devices']))) await checkDeviceRequest(path);
}
