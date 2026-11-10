import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {withApp} from '../../apps/lib/apps.js';
import type {checks} from '../../lib/check.js';
import {hold, moveTo, press, release} from '../../lib/input/input.js';
import {gjs, waitForWindow} from '../../lib/processes.js';
import {capture, captureFrame, type Frame} from '../../lib/screenshots.js';
import {pause, settled} from '../../lib/wait.js';
import {act, attachedEffects, choose, nothingAttached, pageItems} from './effects.js';

type Checks = ReturnType<typeof checks>;

const GOLD = '#ffb347';
const BEHIND = '#ffffff';
const X11_ROOM = 460;
const SAME = 6;
const BENT_SHADOW = 40;
const BORDER = 3;
const WINDOW_RADIUS = 15;
const ON_THE_ARC = WINDOW_RADIUS * (1 - Math.SQRT1_2) + BORDER / 2 * Math.SQRT1_2;
const IN_THE_TIP = 1;

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const scale = () => global.display.get_monitor_scale(global.display.get_primary_monitor());

interface Sampled {
  name: string;
  window: Meta.Window;
}

function point(window: Meta.Window, corner: number, depth: number): [number, number] {
  const {x, y, width, height} = window.get_frame_rect();
  const left = corner === 0 || corner === 3;
  const top = corner < 2;
  return [Math.round((left ? x + depth : x + width - depth - 1) * scale()), Math.round((top ? y + depth : y + height - depth - 1) * scale())];
}

async function shotOf({window}: Sampled): Promise<Frame> {
  window.activate(global.get_current_time());
  await settled();
  moveTo([4, 4]);
  await pause(500);
  return captureFrame();
}

function color(frame: Frame, [x, y]: [number, number]) {
  const {pixbuf} = frame;
  const offset = y * pixbuf.get_rowstride() + x * pixbuf.get_n_channels();
  const channels = [0, 1, 2].map(channel => pixbuf.get_pixels()[offset + channel].toString(16).padStart(2, '0'));
  return `#${channels.join('')}`;
}

async function checkRounded({require}: Checks, sampled: Sampled, how: string) {
  const frame = await shotOf(sampled);
  for (let corner = 0; corner < 4; corner++) {
    const arc = point(sampled.window, corner, ON_THE_ARC);
    require(frame.near(arc[0], arc[1], GOLD, 60), `${sampled.name} ${how}: the border follows rounded corner ${corner} (${color(frame, arc)})`);
    const tip = point(sampled.window, corner, IN_THE_TIP);
    require(!frame.near(tip[0], tip[1], GOLD, 60), `${sampled.name} ${how}: and stays out of its tip (${color(frame, tip)})`);
  }
}

async function checkSquare({require}: Checks, sampled: Sampled, how: string) {
  const frame = await shotOf(sampled);
  for (let corner = 0; corner < 4; corner++) {
    const tip = point(sampled.window, corner, IN_THE_TIP);
    require(frame.near(tip[0], tip[1], GOLD, 60), `${sampled.name} ${how}: the border reaches square corner ${corner} (${color(frame, tip)})`);
    const inside = point(sampled.window, corner, BORDER + ON_THE_ARC);
    require(!frame.near(inside[0], inside[1], GOLD, 60), `${sampled.name} ${how}: and doesn't curve inside it (${color(frame, inside)})`);
  }
}

async function shotAlone(sampled: Sampled, all: Sampled[]) {
  const others = all.filter(other => other !== sampled);
  for (const {window} of others) window.minimize();
  const shot = await shotOf(sampled);
  for (const {window} of others) window.unminimize();
  return shot;
}

async function checkTipsClear({require}: Checks, windows: Sampled[], what: string, plain: Map<Sampled, Frame>, tolerance = SAME) {
  for (const sampled of windows) {
    const frame = await shotAlone(sampled, windows);
    for (let corner = 0; corner < 4; corner++) {
      const tip = point(sampled.window, corner, IN_THE_TIP);
      require(frame.near(tip[0], tip[1], color(plain.get(sampled)!, tip), tolerance), `${what} leaves no patch in the tip of corner ${corner} of ${sampled.name} (${color(frame, tip)}, was ${color(plain.get(sampled)!, tip)})`);
    }
  }
}

async function everyApp(title: string, on: boolean) {
  const item = (await pageItems()).find(candidate => candidate.title === title)!;
  await act(item.action!, new GLib.Variant('b', on));
}

async function open(script: string, args: string[], title: string, x: number, y: number) {
  gjs(script, args);
  const window = await waitForWindow(candidate => candidate.get_title() === title, `${title} opens`);
  window.move_frame(true, x, y);
  return window;
}

export async function checkCorners(checksApi: Checks) {
  const {eventually, require} = checksApi;
  const {width, height} = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  const behind = await open('clients/windows/gtk4Window.js', ['Behind', BEHIND], 'Behind', 0, 0);
  behind.maximize();
  await pause(400);
  const windows: Sampled[] = [
    {name: 'GTK', window: await open('clients/windows/gtk4Window.js', ['Plain GTK', '#303030'], 'Plain GTK', 20, 20)},
    {name: 'libadwaita', window: await open('clients/windows/adwWindow.js', ['Plain Adwaita', '420', '260'], 'Plain Adwaita', width - 450, 20)},
    {name: 'X11', window: await open('clients/x11/x11Window.js', ['Plain X11', '#303030'], 'Plain X11', 20, height - X11_ROOM)},
  ];
  await withApp('settings', [], async settings => {
    const all = [...windows, {name: 'a Sabine app', window: settings.window}];
    const [gtk, , x11] = all;
    const plain = new Map<Sampled, Frame>();
    for (const sampled of all) plain.set(sampled, await shotOf(sampled));

    await choose('border-color', GOLD);
    await choose('border-width', BORDER);
    await choose('border', 'color');
    await eventually(() => attachedEffects().overlays >= all.length, 'borders go on every window');
    await capture('phosphor-corners-rounded');
    for (const sampled of all) await checkRounded(checksApi, sampled, 'with rounded corners');

    kestrel.set_boolean('rounded-window-corners', false);
    await pause(800);
    for (const sampled of all) await checkSquare(checksApi, sampled, 'after turning rounded corners off');
    await capture('phosphor-corners-square');
    const squareX11 = await shotOf(x11);
    const tip = point(x11.window, 0, IN_THE_TIP);
    await choose('border', 'off');
    await eventually(() => attachedEffects().overlays === 0, 'the border comes off');
    const bareX11 = await shotOf(x11);
    require(!bareX11.near(tip[0], tip[1], color(plain.get(gtk)!, point(gtk.window, 0, IN_THE_TIP)), 0) && !bareX11.near(tip[0], tip[1], BEHIND, 40), `an X11 app draws square corners too (${color(bareX11, tip)}, ${color(squareX11, tip)})`);
    await choose('border', 'color');

    kestrel.reset('rounded-window-corners');
    await pause(800);
    for (const sampled of all) await checkRounded(checksApi, sampled, 'after turning rounded corners on');

    gtk.window.maximize();
    await pause(800);
    const maximized = await shotOf(gtk);
    const corner = point(gtk.window, 3, IN_THE_TIP);
    require(maximized.near(corner[0], corner[1], GOLD, 60), `the border follows a maximized window's square corner (${color(maximized, corner)})`);
    gtk.window.unmaximize();
    await pause(800);
    await checkRounded(checksApi, gtk, 'unmaximized');
    gtk.window.activate(global.get_current_time());
    hold(Clutter.KEY_Super_L);
    press(Clutter.KEY_Left);
    release(Clutter.KEY_Super_L);
    await eventually(() => gtk.window.get_frame_rect().x === Main.layoutManager.primaryMonitor!.x, 'Super and Left tile the window');
    await pause(800);
    const tiled = await shotOf(gtk);
    const onTheEdge = point(gtk.window, 3, IN_THE_TIP);
    require(tiled.near(onTheEdge[0], onTheEdge[1], GOLD, 60), `the border follows a tiled window's square corner (${color(tiled, onTheEdge)})`);
    gtk.window.unmaximize();
    await pause(800);
    await checkRounded(checksApi, gtk, 'untiled');
    gtk.window.make_fullscreen();
    await eventually(() => attachedEffects().overlays === all.length, 'the border comes off a fullscreen window');
    gtk.window.unmake_fullscreen();
    await eventually(() => attachedEffects().overlays === all.length + 1, 'and comes back');
    await checkRounded(checksApi, gtk, 'after fullscreen');
    await choose('border', 'off');
    await eventually(() => attachedEffects().overlays === 0, 'the border comes off for good');

    behind.delete(global.get_current_time());
    await pause(500);
    for (const sampled of all) plain.set(sampled, await shotAlone(sampled, all));
    for (const look of ['bezel', 'tint', 'scanlines']) {
      await choose('overlay-strength', 1);
      await choose('overlay', look);
      await eventually(() => attachedEffects().overlays === all.length, `the ${look} overlay goes on`);
      await checkTipsClear(checksApi, all, `the ${look} overlay`, plain);
      await choose('overlay', 'off');
      await eventually(() => attachedEffects().overlays === 0, 'and comes off');
    }
    for (const title of ['CRT on every app', 'Chromatic aberration on every app']) {
      await everyApp(title, true);
      await eventually(() => attachedEffects().effects >= all.length, `${title}: it goes on`);
      await checkTipsClear(checksApi, all, title, plain, BENT_SHADOW);
      await everyApp(title, false);
      await eventually(nothingAttached, 'and comes off');
    }
  });
  for (const {window} of windows) window.delete(global.get_current_time());
}
