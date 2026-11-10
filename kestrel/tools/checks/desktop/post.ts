import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {descendants, named, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {centerOf, click, moveTo, pressButton, press as pressKey, releaseButton, type Point} from '../lib/input/input.js';
import {scratch} from '../lib/processes.js';
import {captureArea} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {withApp} from '../apps/lib/apps.js';
import {seenCalls} from '../system/lib/systemCalls.js';
import {Nearby} from './post/nearby.js';
import {checkRover, checkSettings} from './post/places.js';
import {captureTray, checkTray, indicator} from './post/taskbar.js';
import {checkOffers, checkPairing, checkPin, checkText, clearNotifications, closeWindows, inbox, NEARBY, nearbyId, popupShowing, settings, thisId} from './post/transfers.js';

const {require, eventually} = checks('Post');
const DBUS = 'org.freedesktop.DBus';
const FIRST_ENTRY: Point = [330, 104];
const DRAG_STEPS = 24;
const DRAG_STEP_MS = 30;
const HOVER_MS = 400;

const sheet = () => shownStyled('kestrel-send-sheet');
const lastPortCall = () => seenCalls().filter(call => call.startsWith('SetPostOpen')).at(-1);
const panel = () => named('kestrel-panel')!;
const appButton = (name: string) => descendants(named('kestrel-taskbar-dock')!)
  .find(actor => actor instanceof St.Button && actor.mapped && actor.accessible_name?.startsWith(name)) ?? null;

async function checkPrivateNetwork() {
  const [pid] = (await call(DBUS, '/org/freedesktop/DBus', DBUS, 'GetConnectionUnixProcessID',
    new GLib.Variant('(s)', ['com.lantharos.Kestrel.Post']), '(u)')).deepUnpack<[number]>();
  const network = (process: string) => GLib.file_read_link(`/proc/${process}/ns/net`);
  console.log(`Post runs as ${pid} in ${network(String(pid))}, Kestrel in ${network('self')}`);
  require(network(String(pid)) !== network('self'), 'Post runs in a network of its own in check sessions');
}

async function checkVisibility() {
  await eventually(() => seenCalls().includes('SetPostOpen true'), 'Post opens its port on home networks');
  require(!!indicator()?.visible, 'Post sits in the taskbar while your devices may find this computer');
  settings.set_string('visibility', 'no-one');
  await eventually(() => lastPortCall() === 'SetPostOpen false', 'choosing No one closes it');
  await eventually(() => !indicator()?.visible, 'and takes Post out of the taskbar');
  settings.set_string('visibility', 'your-devices');
  await eventually(() => lastPortCall() === 'SetPostOpen true', 'choosing Your devices opens it again');
  await eventually(() => indicator()?.visible, 'and brings Post back');
}

async function checkPanel() {
  await nearbyId();
  pressKey(Clutter.KEY_Escape);
  await settled();
  click(indicator()!);
  const shown = await eventually(() => popupShowing(NEARBY), 'Post’s panel lists the computer nearby');
  require(!!popupShowing('Who can find Mara’s Laptop') && !!popupShowing('Your devices'), 'and who can find this computer');
  await settled();
  const [px, py] = shown.get_transformed_position();
  await captureArea('post-panel', {x: Math.round(px), y: Math.round(py), width: Math.round(shown.width), height: Math.round(shown.height)});
  pressKey(Clutter.KEY_Escape);
  await eventually(() => !popupShowing(NEARBY), 'Escape closes it');
}

function bareSpot(): Point {
  const bar = panel();
  const [x, y] = bar.get_transformed_position();
  const middle = Math.round(y + bar.height / 2);
  for (let spot = Math.round(x) + 4; spot < x + bar.width; spot += 4)
    if (global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, spot, middle) === bar) return [spot, middle];
  throw new Error('The taskbar has no bare spot');
}

async function dragOver(from: Point, to: Point, hovering: () => Promise<void>) {
  moveTo(from);
  pressButton();
  for (let step = 1; step <= DRAG_STEPS; step++) {
    moveTo([from[0] + (to[0] - from[0]) * step / DRAG_STEPS, from[1] + (to[1] - from[1]) * step / DRAG_STEPS]);
    await pause(DRAG_STEP_MS);
  }
  await pause(HOVER_MS);
  await hovering();
  releaseButton();
}

async function checkDrops() {
  const folder = scratch('post', 'Drop');
  GLib.mkdir_with_parents(folder, 0o755);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'Ticket.pdf']), '%PDF-1.4\n');
  await withApp('rover', [folder], async app => {
    await settled();
    await dragOver(app.at(FIRST_ENTRY), centerOf(indicator()!), async () => {
      require((indicator() as St.Widget).has_style_pseudo_class('dropping'), 'Post lights up under files dragged over it');
      await captureTray('post-drop-icon');
    });
    await eventually(sheet, 'dropping files on Post opens the Send sheet');
    pressKey(Clutter.KEY_Escape);
    await eventually(() => !sheet(), 'Escape closes it');
    const bare = bareSpot();
    await dragOver(app.at(FIRST_ENTRY), bare, async () => {
      require((panel() as St.Widget).has_style_pseudo_class('dropping'), 'the taskbar lights up under files dragged over a bare part of it');
      const [x, y] = panel().get_transformed_position();
      await captureArea('post-drop-taskbar', {x: Math.round(x), y: Math.round(y), width: Math.round(panel().width), height: Math.round(panel().height)});
    });
    await eventually(sheet, 'dropping files on a bare part of the taskbar opens the Send sheet');
    pressKey(Clutter.KEY_Escape);
    await eventually(() => !sheet(), 'Escape closes it');
    const rover = await eventually(() => appButton('Rover'), 'Rover has a button in the taskbar');
    await dragOver(app.at(FIRST_ENTRY), centerOf(rover), async () => {
      require(!(panel() as St.Widget).has_style_pseudo_class('dropping'), 'an app’s button doesn’t light the taskbar up');
    });
    await settled();
    require(!sheet(), 'dropping files on an app’s button leaves the Send sheet closed');
  });
}

export async function run() {
  GLib.mkdir_with_parents(inbox(), 0o700);
  settings.set_string('folder', inbox());
  const nearby = await Nearby.start(NEARBY, scratch('post', 'Nearby'));
  try {
    await checkPrivateNetwork();
    await checkVisibility();
    await checkTray();
    await checkPanel();
    await checkPairing(nearby);
    const here = await thisId(nearby);
    await checkText(nearby, here);
    settings.reset('devices');
    settings.set_string('visibility', 'everyone');
    await checkOffers(nearby, here);
    clearNotifications();
    const there = await nearbyId();
    await checkPin(nearby, there);
    await closeWindows();
    await checkRover(nearby);
    await checkDrops();
    await checkSettings();
  } finally {
    clearNotifications();
    await nearby.stop();
    for (const key of ['visibility', 'folder', 'devices']) settings.reset(key);
  }
}
