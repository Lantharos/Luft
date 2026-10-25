import Gio from 'gi://Gio';
import St from 'gi://St';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';

import {named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {fixture, spawn, stopAll, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';

const {require, eventually} = checks('window corners');
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const BACKDROP = ['Backdrop', 'f3f3f0', [40, 40, 1100, 700]];
const NOTES = ['Notes', '1b1b1b', [200, 180, 420, 300]];
const FRAMED = ['Framed', '2e3a46', [700, 300, 360, 240]];
// Inside a square corner, but outside a rounded one
const CORNER_INSET = 3;
const BELOW = 8;
const SHADOW_DEPTH = 12;

async function open(mode, [title, color, [x, y, width, height]]) {
  spawn(['python3', fixture('clients', 'wayland', 'decorationClient.py'), mode, title, color]);
  const window = await waitForWindow(title, `the ${title} client opens`);
  window.move_resize_frame(true, x, y, width, height);
  await eventually(() => window.get_frame_rect().width === width, `the ${title} client takes its size`);
  return {window, color: [0, 2, 4].map(offset => parseInt(color.slice(offset, offset + 2), 16))};
}

async function pixel(x, y) {
  const shot = await captureFrame({x, y, width: 1, height: 1});
  return [...shot.pixbuf.get_pixels().slice(0, 3)];
}

const same = (pixel, color) => pixel.every((value, channel) => Math.abs(value - color[channel]) <= 2);

async function corners({window}) {
  const frame = window.get_frame_rect();
  const left = frame.x + CORNER_INSET, right = frame.x + frame.width - 1 - CORNER_INSET;
  const top = frame.y + CORNER_INSET, bottom = frame.y + frame.height - 1 - CORNER_INSET;
  return Promise.all([[left, top], [right, top], [left, bottom], [right, bottom]].map(([x, y]) => pixel(x, y)));
}

async function shadowBelow({window}) {
  const frame = window.get_frame_rect();
  return pixel(frame.x + Math.round(frame.width / 2), frame.y + frame.height + BELOW);
}

const titleBar = ({window}) => styled('kestrel-titlebar', window.get_compositor_private())[0];

function surfaceCorners(actor) {
  const node = actor.get_theme_node();
  return [St.Corner.TOPLEFT, St.Corner.TOPRIGHT, St.Corner.BOTTOMRIGHT, St.Corner.BOTTOMLEFT].map(corner => node.get_border_radius(corner))
    .concat(actor.get_effect('backdrop').corner_radius);
}

async function quickSettingsCorners(label) {
  toggleSurface('quick');
  const quick = named('kestrel-quick-settings');
  await eventually(() => shown(quick), `Quick Settings opens ${label}`);
  await settled();
  const corners = surfaceCorners(quick);
  if (label === 'with square corners') await capture('quick-settings-square');
  toggleSurface('quick');
  await eventually(() => !quick.visible, 'Quick Settings closes');
  return corners;
}

export async function run() {
  settings.reset('rounded-window-corners');
  try {
    const backdrop = await open('client', BACKDROP);
    const notes = await open('client', NOTES);
    const framed = await open('server', FRAMED);
    notes.window.activate(global.get_current_time());
    await settled();

    require(notes.window.has_rounded_corners(), 'a floating window has rounded corners');
    require((await corners(notes)).every(corner => !same(corner, notes.color)), 'its corners show what is behind it');
    require(!titleBar(framed).has_style_class_name('kestrel-titlebar-square'), 'Kestrel\'s title bar is rounded');

    settings.set_boolean('rounded-window-corners', false);
    await eventually(() => !notes.window.has_rounded_corners() && !framed.window.has_rounded_corners(),
      'turning rounded corners off squares every window');
    await eventually(() => titleBar(framed).has_style_class_name('kestrel-titlebar-square'), 'Kestrel\'s title bar goes square');
    await settled();
    require((await corners(notes)).every(corner => same(corner, notes.color)), 'a square window fills its corners');
    const shadow = await shadowBelow(notes);
    require(shadow.every((value, channel) => value <= backdrop.color[channel] - SHADOW_DEPTH), 'a square window keeps its shadow');
    await capture('window-corners-square');
    require((await quickSettingsCorners('with square corners')).every(radius => radius === 0), 'Quick Settings goes square too');

    settings.set_boolean('rounded-window-corners', true);
    await eventually(() => notes.window.has_rounded_corners(), 'turning rounded corners on rounds windows again');
    await settled();
    require((await corners(notes)).every(corner => !same(corner, notes.color)), 'its corners are rounded again');
    require((await quickSettingsCorners('with rounded corners')).every(radius => radius > 0), 'Quick Settings is rounded again');
  } finally {
    settings.reset('rounded-window-corners');
    await stopAll();
  }
}
