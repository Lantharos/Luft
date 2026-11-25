import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import type Mtk from 'gi://Mtk';

import {answerable, labelled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {failureOf} from '../lib/errors.js';
import {call} from '../lib/dbus.js';
import {click} from '../lib/input/input.js';
import {answer, forget, WINDOW_CAPTURE} from '../lib/access/permissions.js';
import {SANDBOXED_APP, launch, openSecurityContext, sandboxedApp, through, type Launched} from '../lib/access/sandbox.js';
import {fixture, gjs, spawn, stop, waitForWindow, type Process} from '../lib/processes.js';
import {settled, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('window capture');
const KESTREL = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/WindowCapture';
const IFACE = 'com.lantharos.Kestrel.WindowCapture';
const SCHELF_RULE = `--call=${KESTREL}=${IFACE}.RequestAccess@${PATH}`;
const SHARING = ['/com/lantharos/Kestrel/Sharing', 'com.lantharos.Kestrel.Sharing'] as const;
const CLIENT = fixture('clients', 'wayland', 'windowCaptureClient.py');
const GAME = fixture('clients', 'wayland', 'windowStateClient.py');
const GAME_TITLE = 'Kestrel window state: ';
const GAME_APP = 'com.lantharos.Kestrel.WindowState';
const GAME_PIXEL = '403020ff';
const FRAMED_TITLE = 'Framed game';
const FRAMED_APP = 'steam_app_367520';
const FRAMED_BACKGROUND = '#203040';
const DENIED = `${IFACE}.Error.Denied`;
const OVERLAY_WIDTH = 200;
const OVERLAY_HEIGHT = 100;
const OVERLAY_MARGIN = 24;

type Described = Record<string, unknown>;

const prompt = () => answerable('kestrel-window-capture-dialog');
const caller = () => sandboxedApp(KESTREL, {rules: [SCHELF_RULE]});

async function failure(reply: Promise<unknown>) {
  try {
    await reply;
    return null;
  } catch (error) {
    const failed = failureOf(error);
    return failed instanceof GLib.Error ? Gio.DBusError.get_remote_error(failed) ?? failed.message : failed.message;
  }
}

async function respond(button: string, asked: Promise<string | null>) {
  let outcome: string | null | undefined;
  void asked.then(answered => (outcome = answered));
  const dialog = await waitUntil(() => {
    if (outcome !== undefined) throw new Error(`The app was answered without asking: ${outcome ?? 'allowed'}`);
    return prompt();
  }, 'the app asks to see the windows');
  await settled();
  click(labelled(button, dialog)!);
  await eventually(() => !prompt(), `${button} closes the prompt`);
}

async function grants() {
  const reply = await call(KESTREL, ...SHARING, 'List', null, '(aa{sv})');
  return (reply.recursiveUnpack() as [Described[]])[0].filter(entry => entry.app === SANDBOXED_APP && entry.kind === 'windows-record');
}

async function checkRequest() {
  const declining = await caller();
  try {
    const request = () => failure(declining.call(PATH, IFACE, 'RequestAccess'));
    const asked = request();
    await respond('Don’t allow', asked);
    require(await asked === DENIED, 'an app the person turned down is refused');
    require(await request() === DENIED && !prompt(), 'it cannot ask again while it runs');
  } finally {
    await declining.close();
  }
  const allowing = await caller();
  try {
    const asked = failure(allowing.call(PATH, IFACE, 'RequestAccess'));
    await respond('Allow', asked);
    require(await asked === null, 'an app the person allows hears so');
    await eventually(() => global.context.is_app_permitted(WINDOW_CAPTURE, SANDBOXED_APP), 'the answer is kept for the app');
    require(await failure(allowing.call(PATH, IFACE, 'RequestAccess')) === null && !prompt(), 'it is not asked again');
    const [grant] = await grants();
    require(!!grant, 'Settings lists the app among those that may record windows');
    await call(KESTREL, ...SHARING, 'Revoke', new GLib.Variant('(s)', [grant.id as string]));
    await eventually(() => !global.context.is_app_permitted(WINDOW_CAPTURE, SANDBOXED_APP), 'revoking takes the leave away');
  } finally {
    await allowing.close();
  }
}

const client = (socket: string, ...args: string[]) =>
  launch(['python3', CLIENT, ...args], {env: through(socket), label: `the window capture client (${args[0]}) answers`});

const pickedWindow = (x: number, y: number) => {
  let actor: Clutter.Actor | null = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
  while (actor && !(actor instanceof Meta.WindowActor)) actor = actor.get_parent();
  return actor?.meta_window ?? null;
};

async function checkRefused(socket: string) {
  for (const mode of [['capture', GAME_APP], ['overlay']]) {
    const {process, lines} = await client(socket, ...mode);
    await stop(process);
    require(lines[0] === 'unavailable', `an app without leave to record windows sees no ${mode[0]} protocol`);
  }
}

async function checkOverlay(socket: string, game: Meta.Window) {
  game.make_fullscreen();
  game.activate(global.get_current_time());
  await eventually(() => game.is_fullscreen() && game.has_focus(), 'the game covers the screen and has focus');
  const overlays = global.top_window_group.get_n_children();
  const {process, lines} = await client(socket, 'overlay');
  try {
    await eventually(() => lines.includes(`shown ${OVERLAY_WIDTH}x${OVERLAY_HEIGHT}`) && global.top_window_group.get_n_children() === overlays + 1,
      'the app shows an overlay above every window');
    const {x, y} = global.top_window_group.get_last_child()!;
    const monitor = global.display.get_monitor_geometry(game.get_monitor());
    require(x === monitor.x + monitor.width - OVERLAY_WIDTH - OVERLAY_MARGIN && y === monitor.y + OVERLAY_MARGIN,
      `the overlay sits where it anchored itself (${x}, ${y})`);
    require(game.has_focus(), 'the overlay leaves focus with the full-screen game');
    require(pickedWindow(x + OVERLAY_WIDTH / 2, y + OVERLAY_HEIGHT / 2) === game, 'the pointer reaches the game under the overlay');
  } finally {
    await stop(process);
  }
  await eventually(() => global.top_window_group.get_n_children() === overlays, 'the overlay goes away with the app');
}

async function recorded(socket: string, app: string, game: Meta.Window, {width, height}: Mtk.Rectangle) {
  await eventually(() => (game.get_compositor_private() as Meta.WindowActor).opacity === 255, 'the game has finished opening');
  await settled();
  const capture = await client(socket, 'capture', app);
  const {lines} = capture;
  await eventually(() => lines.some(line => line.startsWith('ready')), 'the app records a frame of the window').catch(error => {
    throw new Error(`${error.message}: ${lines.join(' | ')}`);
  });
  require(lines.some(line => line.startsWith('listed ')), 'the app finds the window by its app id');
  const [, size, middle, corner] = lines.find(line => line.startsWith('ready'))!.split(' ');
  require(size === `${width}x${height}` && middle === GAME_PIXEL, `the frame holds the window's picture (${size} ${middle})`);
  require(corner === GAME_PIXEL, `the frame leaves out the desktop's corners, title bar and shadow (${corner})`);
  return capture;
}

async function checkCapture(socket: string, game: Meta.Window) {
  const capture = await recorded(socket, GAME_APP, game, game.get_buffer_rect());
  require((await grants()).some(entry => entry.active === true), 'Settings shows that the app is recording');
  return capture;
}

async function checkFramed(socket: string) {
  const game = gjs('clients/x11/x11Window.js', [FRAMED_TITLE, FRAMED_BACKGROUND, '', FRAMED_APP]);
  try {
    const window = await waitForWindow(FRAMED_TITLE, 'a game with an X11 title bar opens');
    const content = window.frame_rect_to_client_rect(window.get_frame_rect());
    require(window.get_buffer_rect().height > content.height, 'Kestrel frames the X11 game');
    await stop((await recorded(socket, FRAMED_APP, window, content)).process);
  } finally {
    await stop(game);
  }
}

async function checkStopped({process, lines}: Launched, gameProcess: Process) {
  try {
    await stop(gameProcess);
    await eventually(() => lines.includes('stopped'), 'the recording stops when the window closes');
    await eventually(async () => !(await grants()).some(entry => entry.active === true), 'Settings no longer shows a recording');
  } finally {
    await stop(process);
  }
}

async function checkWayland() {
  const sandbox = await openSecurityContext(SANDBOXED_APP);
  let game: Process | null = null;
  try {
    await checkRefused(sandbox.socket);
    await answer(WINDOW_CAPTURE, SANDBOXED_APP, true);
    game = spawn(['python3', GAME]);
    const window = await waitForWindow(GAME_TITLE);
    const capture = await checkCapture(sandbox.socket, window);
    await checkFramed(sandbox.socket);
    await checkOverlay(sandbox.socket, window);
    await checkStopped(capture, game);
  } finally {
    if (game) await stop(game);
    await forget(WINDOW_CAPTURE, SANDBOXED_APP);
    await stop(sandbox.process);
  }
}

export async function run() {
  await checkRequest();
  await checkWayland();
}
