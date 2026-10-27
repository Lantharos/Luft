import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {changes, openApp} from '../apps/lib/apps.js';
import {exists, removeTree, write} from '../apps/lib/files.js';
import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {press, type, type Point} from '../lib/input/input.js';
import {findWindow, fixture, scratch, spawn, waitForWindow, windows} from '../lib/processes.js';
import {pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('handoff focus');
const OPEN_TIMEOUT = 60000;
const UNPROMPTED_WAIT = 3000;
const BROWSER_FOCUS_TIMEOUT = 15000;
const NO_LAUNCH_TOKEN = {XDG_ACTIVATION_TOKEN: null, DESKTOP_STARTUP_ID: null};
const FOLDER = GLib.build_filenamev([GLib.get_home_dir(), 'Handoff check']);
const BACKGROUND: Point = [500, 200];
const TERMINAL_HERE = [98, 192];
const LINK = 'http://127.0.0.1:9/harbour';
const UNPROMPTED_LINK = 'http://127.0.0.1:9/unprompted';
const BODY: Point = [620, 420];
const BROWSER = 'com.lantharos.Kestrel.HandoffBrowser';
const LINK_SCHEMES = ['x-scheme-handler/http', 'x-scheme-handler/https'];

const focused = () => global.display.focus_window;

async function openFolder() {
  press(Clutter.KEY_Control_L, Clutter.KEY_l);
  await settled();
  type(FOLDER);
  press(Clutter.KEY_Return);
  await settled();
}

async function openTerminalHere(rover: LuftApp) {
  rover.window.activate(global.get_current_time());
  await eventually(() => rover.window.has_focus(), 'Rover is in front');
  await changes(rover, 'right-clicking the folder opens its menu', () => rover.click(BACKGROUND, Clutter.BUTTON_SECONDARY));
  const [x, y] = BACKGROUND;
  rover.click([x + TERMINAL_HERE[0], y + TERMINAL_HERE[1]]);
}

async function checkTerminal() {
  write(GLib.build_filenamev([FOLDER, 'Note.txt']), 'Pack the charger\n');
  const rover = await openApp('rover');
  try {
    await openFolder();
    await openTerminalHere(rover);
    const isTern = (window: Meta.Window) => window.get_pid() !== rover.window.get_pid();
    const tern = await rover.waitUntil(() => findWindow(isTern), 'Open terminal here opens Tern', OPEN_TIMEOUT);
    await eventually(() => tern.has_focus(), 'a new Tern window takes focus from Rover');
    await openTerminalHere(rover);
    await eventually(() => focused() && isTern(focused()), 'a running Tern comes to the front for Open terminal here');
    windows().filter(isTern).forEach(window => window.kill());
  } finally {
    await rover.close();
    removeTree(FOLDER);
  }
}

function installBrowser(helium: string, profile: string) {
  const path = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', `${BROWSER}.desktop`]);
  const command = ['env', 'APPIMAGE_EXTRACT_AND_RUN=1', helium, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--password-store=basic', '%U'].join(' ');
  write(path, `[Desktop Entry]\nType=Application\nName=Handoff browser\nExec=${command}\nMimeType=${LINK_SCHEMES.join(';')};\n`);
  const browser = GioUnix.DesktopAppInfo.new_from_filename(path)!;
  LINK_SCHEMES.forEach(scheme => browser.set_as_default_for_type(scheme));
  return () => {
    LINK_SCHEMES.forEach(scheme => Gio.AppInfo.reset_type_associations(scheme));
    GLib.unlink(path);
  };
}

function message() {
  const words = Array.from({length: 120}, () => 'harbour photos from Saturday').join(' ');
  const path = scratch('Handoff.eml');
  write(path, `From: Theo Brandt <theo@example.test>\r\nTo: Mara Lindqvist <mara@example.test>\r\nSubject: Harbour photos\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<p><a href="${LINK}">${words}</a></p>\r\n`);
  return path;
}

async function checkLink(helium: string) {
  const profile = scratch('kestrel-handoff-helium');
  const uninstall = installBrowser(helium, profile);
  const env = {APPIMAGE_EXTRACT_AND_RUN: '1', TMPDIR: scratch()};
  const browser = spawn([helium, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--password-store=basic', `file://${fixture('pages', 'scroll.html')}`], {env});
  const mailman = await openApp('mailman', [message()]);
  try {
    const page = await waitForWindow(window => window.get_title()?.startsWith('Kestrel page'), 'the browser opens', OPEN_TIMEOUT);
    const isBrowser = (window: Meta.Window) => window.get_pid() === page.get_pid();
    mailman.window.activate(global.get_current_time());
    await eventually(() => mailman.window.has_focus(), 'Mailman is in front');

    spawn([helium, `--user-data-dir=${profile}`, UNPROMPTED_LINK], {env: {...env, ...NO_LAUNCH_TOKEN}});
    await pause(UNPROMPTED_WAIT);
    require(mailman.window.has_focus(), 'a browser asked to open a link without a token stays behind');

    mailman.click(BODY);
    await eventually(() => focused() && isBrowser(focused()), 'clicking a link in Mailman brings the browser to the front', BROWSER_FOCUS_TIMEOUT);
  } finally {
    await mailman.close();
    browser.force_exit();
    await browser.exited;
    uninstall();
    if (exists(profile)) removeTree(profile);
  }
}

export async function run() {
  await checkTerminal();
  const helium = GLib.getenv('KESTREL_HELIUM');
  if (helium) await checkLink(helium);
  else console.log('Kestrel handoff focus: the browser is skipped without KESTREL_HELIUM');
}
