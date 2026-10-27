import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import {dismissImmediately, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {firstStyled, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, fingerScroll, liftFingers, moveTo, press, rest} from '../lib/input/input.js';
import {appBinary} from '../lib/apps/luftApp.js';
import {fixture, gjs, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {captureFrame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('scrolling');
const DISTANCE = 120;
const SLOWEST = 0.8;
const FASTEST = 1.3;
const GTK_TOUCHPAD_FACTOR = 2.5;
const HELIUM_OPEN_TIMEOUT = 60000;
const ELECTRON_OPEN_TIMEOUT = 60000;
const FLATPAK_OPEN_TIMEOUT = 90000;
const FLATPAK_SETTLE = 3000;
const FLATPAK_CHROMIUM = 'org.chromium.Chromium';
const FLATPAK_ELECTRON = 'md.obsidian.Obsidian';
const NOTE_LINES = 2000;
const NOTE_DISTANCE = 24;
const NOTE_WORDS = 13;
const SCHELF_CHROMIUM_FEATURES = '--enable-features=WaylandUnscaledTouchpadScrolling:scroll_scaling_factor/1';
const PAGE_STRIP = {x: 0.45, width: 0.4, top: 140, height: 160, reach: 300};

function requireSane(surface, moved, {factor = 1, distance = DISTANCE} = {}) {
  const ratio = moved / (distance * factor);
  console.log(`Kestrel scrolling: ${surface} moves ${moved.toFixed(1)} px for ${distance} px of touchpad travel`);
  require(ratio >= SLOWEST && ratio <= FASTEST, `${surface} follows the fingers on the touchpad`);
}

async function scrollOver(target, distance = DISTANCE) {
  moveTo(target);
  await settled();
  await fingerScroll(distance);
  await settled();
}

async function finish() {
  liftFingers();
  rest();
  await settled();
}

async function checkGtk() {
  const process = gjs('clients/windows/window.js', ['--scroll']);
  const window = await waitForWindow('Kestrel window check');
  window.activate(global.get_current_time());
  await scrollOver(centerOf(window.get_compositor_private()));
  await eventually(() => window.title.startsWith('Kestrel scrolled:'), 'the GTK window scrolls');
  requireSane('a GTK window', Number(window.title.split(': ')[1]), {factor: GTK_TOUCHPAD_FACTOR});
  await finish();
  await stop(process);
}

async function checkShell() {
  const process = gjs('clients/windows/window.js', ['--entry']);
  const window = await waitForWindow('Kestrel window check');
  await eventually(() => window.has_focus() && Main.inputMethod.caret, 'the text field takes the keyboard');
  press(Clutter.KEY_Super_L, Clutter.KEY_period);
  await eventually(() => shown(named('kestrel-emoji')), 'Super+. opens the emoji panel');
  await settled();
  const grid = firstStyled('kestrel-emoji-grid');
  await scrollOver(centerOf(grid));
  requireSane('the emoji panel', grid.vadjustment.value);
  await finish();
  dismissImmediately();
  await stop(process);
}

function difference(from, to, {stride, channels, width}, offset, rows) {
  let total = 0;
  for (let row = 0; row < rows; row += 2) {
    const [shifted, current] = [(row + offset) * stride, row * stride];
    for (let column = 0; column < width; column += channels * 2)
      total += Math.abs(from[shifted + column] - to[current + column]);
  }
  return total;
}

function upwardShift(before, after, rows, reach) {
  const [from, to] = [before.pixbuf.get_pixels(), after.pixbuf.get_pixels()];
  const channels = before.pixbuf.get_n_channels();
  const layout = {stride: before.pixbuf.get_rowstride(), channels, width: before.pixbuf.get_width() * channels};
  let best = {offset: 0, difference: Infinity};
  for (let offset = 0; offset <= reach; offset++) {
    const current = difference(from, to, layout, offset, rows);
    if (current < best.difference) best = {offset, difference: current};
  }
  return best.offset;
}

function pageStrip(frame) {
  return {x: frame.x + Math.round(frame.width * PAGE_STRIP.x), y: frame.y + PAGE_STRIP.top, width: Math.round(frame.width * PAGE_STRIP.width), height: PAGE_STRIP.height + PAGE_STRIP.reach};
}

function stripShift(before, after, strip) {
  const scale = before.pixbuf.get_width() / strip.width;
  return upwardShift(before, after, Math.round(PAGE_STRIP.height * scale), Math.round(PAGE_STRIP.reach * scale)) / scale;
}

async function checkSabine() {
  await withApp('settings', [], async app => {
    await show(app, 'appearance');
    const strip = pageStrip(app.window.get_frame_rect());
    const before = await app.frame(strip);
    await scrollOver([strip.x + strip.width / 2, strip.y + strip.height / 2]);
    const moved = stripShift(before, await app.settle(() => true, strip), strip);
    require(moved > 0, 'a Sabine app scrolls');
    requireSane('a Sabine app', moved);
    await finish();
  });
}

async function checkHelium(appImage) {
  const page = `file://${fixture('pages', 'scroll.html')}`;
  const process = spawn([appImage, `--user-data-dir=${scratch('kestrel-helium')}`, '--no-first-run', '--no-default-browser-check', '--password-store=basic', SCHELF_CHROMIUM_FEATURES, page],
    {env: {APPIMAGE_EXTRACT_AND_RUN: '1', TMPDIR: scratch()}});
  const window = await waitForWindow(candidate => candidate.get_title()?.startsWith('Kestrel page'), 'Helium opens the page', HELIUM_OPEN_TIMEOUT);
  require(window.get_client_type() === Meta.WindowClientType.WAYLAND, 'Helium runs on Wayland');
  window.activate(global.get_current_time());
  await scrollOver(centerOf(window.get_compositor_private()));
  await eventually(() => window.title.startsWith('Kestrel scrolled:'), 'the page scrolls');
  await settled();
  requireSane('a page in Helium', parseFloat(window.title.split(': ')[1]));
  await finish();
  window.delete(global.get_current_time());
  await process.exited;
}

async function checkElectron(electron, features) {
  const page = `file://${fixture('pages', 'scroll.html')}`;
  const surface = `a page in Electron${features.length ? ' with the unscaled touchpad feature' : ''}`;
  const process = spawn([electron, `--user-data-dir=${scratch('kestrel-electron')}`, '--ozone-platform=wayland', ...features, page],
    {env: {TMPDIR: scratch()}});
  const window = await waitForWindow(candidate => candidate.get_title()?.startsWith('Kestrel page'), 'Electron opens the page', ELECTRON_OPEN_TIMEOUT);
  require(window.get_client_type() === Meta.WindowClientType.WAYLAND, 'Electron runs on Wayland');
  window.activate(global.get_current_time());
  await scrollOver(centerOf(window.get_compositor_private()));
  await eventually(() => window.title.startsWith('Kestrel scrolled:'), `${surface} scrolls`);
  await settled();
  requireSane(surface, parseFloat(window.title.split(': ')[1]));
  await finish();
  window.delete(global.get_current_time());
  await process.exited;
}

function flatpakEnvironment(home) {
  return {HOME: home, XDG_DATA_HOME: `${home}/.local/share`, XDG_CONFIG_HOME: `${home}/.config`, XDG_CACHE_HOME: `${home}/.cache`, FLATPAK_USER_DIR: null, FLATPAK_SYSTEM_DIR: null};
}

const flatpakInstalled = (home, id) => GLib.file_test(`${home}/.local/share/flatpak/app/${id}`, GLib.FileTest.IS_DIR);

async function openFlatpak(home, id, args, title) {
  const process = spawn(['flatpak', 'run', '--user', '--no-documents-portal', id, ...args], {env: flatpakEnvironment(home)});
  const window = await waitForWindow(candidate => candidate.get_title()?.includes(title), `${id} opens`, FLATPAK_OPEN_TIMEOUT);
  require(window.get_client_type() === Meta.WindowClientType.WAYLAND, `${id} runs on Wayland`);
  window.maximize();
  window.activate(global.get_current_time());
  await pause(FLATPAK_SETTLE);
  await settled();
  return {process, window};
}

async function closeFlatpak({process, window}) {
  window.delete(global.get_current_time());
  await process.exited;
}

async function checkFlatpakChromium(home) {
  const page = `data:text/html,${encodeURIComponent(new TextDecoder().decode(GLib.file_get_contents(fixture('pages', 'scroll.html'))[1]))}`;
  const app = await openFlatpak(home, FLATPAK_CHROMIUM, ['--no-first-run', '--no-default-browser-check', page], 'Kestrel page');
  await scrollOver(centerOf(app.window.get_compositor_private()));
  await eventually(() => app.window.title.startsWith('Kestrel scrolled:'), 'the page in Chromium scrolls');
  await settled();
  requireSane('a page in Chromium from Flathub', parseFloat(app.window.title.split(': ')[1]));
  await finish();
  await closeFlatpak(app);
}

function writeNote(home) {
  const data = `${home}/.var/app/${FLATPAK_ELECTRON}`;
  const vault = `${data}/kestrel-vault`;
  const lines = Array.from({length: NOTE_LINES}, (_, line) => `${line} ${'scrolls with the fingers '.repeat(line * 7 % NOTE_WORDS + 1)}`);
  const workspace = {main: {id: 'main', type: 'split', direction: 'vertical', children: [{id: 'tabs', type: 'tabs', children: [{id: 'note', type: 'leaf', state: {type: 'markdown', state: {file: 'scrolling.md', mode: 'preview'}}}]}]}, active: 'note'};
  GLib.mkdir_with_parents(`${vault}/.obsidian`, 0o755);
  GLib.mkdir_with_parents(`${data}/config/obsidian`, 0o755);
  GLib.file_set_contents(`${vault}/scrolling.md`, lines.join('\n\n'));
  GLib.file_set_contents(`${vault}/.obsidian/workspace.json`, JSON.stringify(workspace));
  GLib.file_set_contents(`${data}/config/obsidian/obsidian.json`, JSON.stringify({vaults: {kestrel: {path: vault, ts: Date.now(), open: true}}, updateDisabled: true}));
}

async function checkFlatpakElectron(home) {
  writeNote(home);
  const app = await openFlatpak(home, FLATPAK_ELECTRON, [], 'scrolling');
  const strip = pageStrip(app.window.get_frame_rect());
  const before = await captureFrame(strip);
  await scrollOver([strip.x + strip.width / 2, strip.y + strip.height / 2], NOTE_DISTANCE);
  requireSane('a note in Obsidian from Flathub', stripShift(before, await captureFrame(strip), strip), {distance: NOTE_DISTANCE});
  await finish();
  await closeFlatpak(app);
}

async function checkFlatpaks(home) {
  const schelf = spawn([appBinary('schelf'), '--integrate-apps'], {env: flatpakEnvironment(home)});
  await schelf.exited;
  require(schelf.get_successful(), 'Schelf sets up the installed Flatpaks');
  for (const [id, check] of [[FLATPAK_CHROMIUM, checkFlatpakChromium], [FLATPAK_ELECTRON, checkFlatpakElectron]]) {
    if (flatpakInstalled(home, id)) await check(home);
    else console.log(`Kestrel scrolling: ${id} skipped without it in KESTREL_FLATPAK_HOME`);
  }
}

export async function run() {
  await checkShell();
  await checkGtk();
  await checkSabine();
  const helium = GLib.getenv('KESTREL_HELIUM');
  if (helium) await checkHelium(helium);
  else console.log('Kestrel scrolling: Helium skipped without KESTREL_HELIUM');
  const electron = GLib.getenv('KESTREL_ELECTRON');
  if (electron) for (const features of [[], [SCHELF_CHROMIUM_FEATURES]]) await checkElectron(electron, features);
  else console.log('Kestrel scrolling: Electron skipped without KESTREL_ELECTRON');
  const flatpakHome = GLib.getenv('KESTREL_FLATPAK_HOME');
  if (flatpakHome) await checkFlatpaks(flatpakHome);
  else console.log('Kestrel scrolling: Flatpak apps skipped without KESTREL_FLATPAK_HOME');
}
