import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {dismissImmediately, toggleSurface, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {openBoardWindow} from '../checks/board/lib/board.js';
import {existing, firstStyled, named} from '../checks/lib/actors.js';
import {call} from '../checks/lib/dbus.js';
import {centerOf, click, drag, moveTo, press, pressButton, releaseButton, rest, type} from '../checks/lib/input/input.js';
import {clearNotifications} from '../checks/lib/notifications.js';
import {stop, stopAll, waitForWindow} from '../checks/lib/processes.js';
import {nextFrame, pause, settled, waitUntil} from '../checks/lib/wait.js';
import type {Area, Clip} from './film.js';

const PRESS_HOLD = 180;
const THROW_STEPS = 14;
const ROVER = 'com.lantharos.rover.desktop';
const NEVER_OPENS = 'org.gimp.GIMP.desktop';
const LAUNCH_TIMEOUT = 15000;
const MARGIN = 24;

export async function notify(app: string, title: string, body: string) {
  await call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', [app, 0, '', title, body, [], {
      'x-shell-sender': new GLib.Variant('s', Gio.DBus.session.get_unique_name()!),
      'x-shell-sender-pid': new GLib.Variant('u', app.length),
    }, -1]), '(u)');
}

function around(...actors: Clutter.Actor[]): Area {
  const boxes = actors.map(actor => [...actor.get_transformed_position(), ...actor.get_transformed_size()]);
  const left = Math.min(...boxes.map(([x]) => x)) - MARGIN;
  const top = Math.min(...boxes.map(([, y]) => y)) - MARGIN;
  const right = Math.max(...boxes.map(([x, , width]) => x + width)) + MARGIN;
  const bottom = Math.max(...boxes.map(([, y, , height]) => y + height)) + MARGIN;
  return [left, top, right - left, bottom - top];
}

function bottomRight(width: number, height: number): Area {
  const {width: screenWidth, height: screenHeight} = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  return [screenWidth - width, screenHeight - height, width, height];
}

async function reset() {
  dismissImmediately();
  rest();
  await settled();
}

function traced(name: string, actor: Clutter.Actor, property: 'scale_x' | 'translation_x' | 'translation_y') {
  const values: number[] = [];
  const signal = global.stage.connect_after('after-paint', () => values.push(Math.round(actor[property] * 1000) / 1000));
  return () => {
    global.stage.disconnect(signal);
    console.log(`Kestrel motion: ${name} ${property} ${values.join(' ')}`);
  };
}

const iconOf = (button: Clutter.Actor) => (button as St.Button).child.get_children().find(child => child instanceof St.Bin)!;

async function pressAndLeave(target: Clutter.Actor, squeezed: Clutter.Actor = target) {
  const done = traced('pressed', squeezed, 'scale_x');
  const [x, y] = centerOf(target);
  moveTo([x, y]);
  await nextFrame();
  pressButton();
  await pause(PRESS_HOLD);
  moveTo([x, 4]);
  releaseButton();
  await pause(PRESS_HOLD * 2);
  done();
}

const taskButton = (window: Meta.Window) =>
  existing(`kestrel-app-${Shell.WindowTracker.get_default().get_window_app(window).id}`);

async function presses(clip: Clip) {
  await reset();
  const client = openBoardWindow('Press', 700, 460);
  const window = await waitForWindow(w => w.get_title()?.startsWith('Press'), 'a window opens for the taskbar');
  await settled();
  await clip('press-taskbar-icon', () => pressAndLeave(taskButton(window), iconOf(taskButton(window))), {notes: 'Held a taskbar icon, then slid off it', area: around(taskButton(window))});
  toggleSurface('quick');
  await settled();
  const tile = firstStyled('kestrel-control', existing('kestrel-quick-settings'))!;
  await clip('press-quick-tile', () => pressAndLeave(tile), {notes: 'Held a quick settings tile, then slid off it', area: around(tile)});
  await reset();
  await notify('Chatter', 'Noor', 'Did you see the draft?');
  await settled();
  toggleSurface('notifications');
  await settled();
  const card = firstStyled('kestrel-notification', existing('kestrel-notifications'))!;
  await clip('press-notification', () => pressAndLeave(card), {notes: 'Held a notification, then slid off it', area: around(card)});
  await reset();
  clearNotifications();
  await stop(client);
}

async function notifications(clip: Clip) {
  await reset();
  clearNotifications();
  await clip('notification-banner-arrive', () => notify('Chatter', 'Maya', 'Lunch at one?'), {notes: 'A banner arrives', area: bottomRight(520, 260)});
  await reset();
  clearNotifications();
  await notify('Weather', 'Rain later', 'Showers expected from 4 pm.');
  await notify('Chatter', 'Noor', 'Did you see the draft?');
  toggleSurface('notifications');
  await settled();
  const area = bottomRight(560, 900);
  await clip('notification-center-arrive', () => notify('Calendar', 'Stand-up', 'In 10 minutes'),
    {notes: 'A notification arrives while the center is open', area});
  await clip('notification-center-reorder', () => notify('Weather', 'Wind', 'Gusts up to 60 km/h.'),
    {notes: 'A new notification moves its app to the top', area});
  await clip('notification-center-clear-app', () => {
    for (const source of Main.messageTray.getSources())
      if (source.title === 'Calendar') for (const notification of [...source.notifications]) notification.destroy();
  }, {notes: 'An app takes its notifications back', area});
  await reset();
  clearNotifications();
}

const appOf = (window: Meta.Window) => Shell.WindowTracker.get_default().get_window_app(window)?.id;

async function searchGust(name: string) {
  toggleSurface('gust');
  await settled();
  type(name);
  await settled();
}

async function unpinnedLaunches(clip: Clip, favorites: Gio.Settings) {
  const saved = favorites.get_strv('favorite-apps');
  favorites.set_strv('favorite-apps', saved.filter(id => id !== ROVER));
  try {
    await settled();
    await searchGust('Rover');
    await clip('taskbar-launch-unpinned', async () => {
      press(Clutter.KEY_Return);
      await waitForWindow(window => appOf(window) === ROVER, 'Rover opens');
    }, {notes: 'An unpinned app launched from Gust gets an icon and opens out of it', timeout: 8000});
    for (const window of Shell.AppSystem.get_default().lookup_app(ROVER).get_windows()) window.delete(global.get_current_time());
    await waitUntil(() => !named(`kestrel-app-${ROVER}`), 'Rover leaves the taskbar', 5000);
    await reset();
    await searchGust('GIMP');
    press(Clutter.KEY_Return);
    await waitUntil(() => named(`kestrel-app-${NEVER_OPENS}`)?.mapped, 'GIMP gets an icon while it starts', 2000);
    const icon = existing(`kestrel-app-${NEVER_OPENS}`) as St.Button;
    const area = around(icon);
    await waitUntil(() => !icon.reactive, 'GIMP stops starting', LAUNCH_TIMEOUT + 3000);
    await clip('taskbar-launch-gives-up', () => waitUntil(() => !named(`kestrel-app-${NEVER_OPENS}`), 'GIMP leaves the taskbar', 5000),
      {notes: 'An app that never opens a window leaves the taskbar when its launch times out', area, timeout: 6000});
  } finally {
    favorites.set_strv('favorite-apps', saved);
  }
  await reset();
}

async function taskbar(clip: Clip) {
  await reset();
  const clients = [openBoardWindow('Focus one', 640, 420), openBoardWindow('Focus two', 640, 420)];
  const windows = await Promise.all(['Focus one', 'Focus two'].map(title => waitForWindow(w => w.get_title()?.startsWith(title), `${title} opens`)));
  await settled();
  const area = around(...windows.map(taskButton));
  await clip('taskbar-focus-slide', () => windows[0].activate(global.get_current_time()), {notes: 'Focus moves to the other app', area});
  await clip('taskbar-focus-slide-back', () => windows[1].activate(global.get_current_time()), {notes: 'Focus moves back', area});
  await reset();
  for (const client of clients) await stop(client);
  const rover = existing(`kestrel-app-${ROVER}`) as St.Button;
  const glyph = (iconOf(rover) as St.Bin).child;
  const bounced = traced('launch', glyph, 'translation_y');
  await clip('taskbar-launch', () => click(rover), {notes: 'A pinned app launches', area: around(rover), timeout: 8000});
  const roverWindow = await waitForWindow(w => appOf(w) === ROVER, 'Rover opens');
  await settled();
  bounced();
  roverWindow.delete(global.get_current_time());
  await waitUntil(() => !global.display.list_all_windows().includes(roverWindow), 'Rover closes', 5000);
  await reset();
  const favorites = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = favorites.get_strv('favorite-apps');
  const [first, second, last = second] = saved.map(id => named(`kestrel-app-${id}`)).filter(button => button !== null);
  const moved = traced('second slot while dragging', second.get_parent()!, 'translation_x');
  try {
    await clip('taskbar-drag-reorder', () => drag(first, [centerOf(last)[0] + last.width / 3, centerOf(last)[1]], {steps: 20, hover: 300}),
      {notes: 'A pinned app dragged past its neighbour', area: around(first, last), timeout: 8000});
  } finally {
    moved();
    favorites.set_strv('favorite-apps', saved);
  }
  await stopAll();
  await settled();
  const created = new Promise<Meta.Window>(resolve => {
    const id = global.display.connect('window-created', (_display, window: Meta.Window) => {
      global.display.disconnect(id);
      resolve(window);
    });
  });
  click(existing(`kestrel-app-${ROVER}`));
  const opening = await created;
  await clip('window-open-from-icon', () => waitForWindow(window => window === opening, 'Rover opens'),
    {notes: 'A pinned app opens out of its taskbar icon', timeout: 8000});
  opening.delete(global.get_current_time());
  await reset();
  await unpinnedLaunches(clip, favorites);
}

async function throwToEdge(window: Meta.Window) {
  const frame = window.get_frame_rect();
  const area = Main.layoutManager.getWorkAreaForMonitor(window.get_monitor());
  const [fromX, fromY] = [frame.x + frame.width / 2, frame.y + 16];
  const [toX, toY] = [area.x + 1, fromY];
  moveTo([fromX, fromY]);
  pressButton();
  for (let step = 1; step <= THROW_STEPS; step++) {
    moveTo([fromX + (toX - fromX) * step / THROW_STEPS, toY]);
    await nextFrame();
  }
  await waitUntil(() => Main.wm.previewingTile, 'the tile preview shows', 2000);
  moveTo([toX, toY]);
  releaseButton();
}

async function snaps(clip: Clip) {
  await reset();
  const client = openBoardWindow('Thrown', 720, 460);
  const window = await waitForWindow(w => w.get_title()?.startsWith('Thrown'), 'the window opens');
  await settled();
  await clip('window-thrown-to-edge', () => throwToEdge(window), {notes: 'A window flung against the left edge'});
  await stop(client);
  await reset();
}

async function panels(clip: Clip) {
  const {width, height} = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  const areas = {gust: [width / 2 - 420, height - 820, 840, 820] as Area, quick: bottomRight(560, 720), notifications: bottomRight(560, 900)};
  for (const surface of ['gust', 'quick', 'notifications'] as const) {
    await reset();
    await clip(`${surface}-content-arrives`, () => toggleSurface(surface), {notes: 'Content follows the panel in', area: areas[surface]});
  }
  await reset();
}

async function reducedShell(clip: Clip) {
  const a11y = new Gio.Settings({schema_id: 'org.gnome.desktop.a11y.interface'});
  a11y.set_string('reduced-motion', 'reduce');
  const suffixed: Clip = (name, action, options) => clip(`${name}-reduced`, action, options);
  try {
    await presses(suffixed);
    await notifications(suffixed);
    await taskbar(suffixed);
    await panels(suffixed);
  } finally {
    a11y.reset('reduced-motion');
  }
}

export const shellGroups = {presses, notifications, taskbar, snaps, panels, reducedShell};
