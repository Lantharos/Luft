import Cairo from 'cairo';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {repository, scratch} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {makeVideo, wallpapers} from './wallpaper/video.js';

const {require, eventually} = checks('wallpaper focus');
const PICTURE = {width: 1500, height: 1000};
const BAND = 0.02;
const EDGE_INSET = 3;
const TOLERANCE = 24;
const MIDDLE = '#30a050';
const LEADING = '#e03030';
const TRAILING = '#3040e0';
const FOG = repository('os', 'image', 'files', 'usr', 'share', 'backgrounds', 'luft', 'Fog.jpg');
const FOG_FOCUS = [0.5, 0.768];
const VIDEO = {width: 1280, height: 720};
const BARS = ['#ffffff', '#ffff00', '#00ffff', '#00ff00', '#ff00ff', '#ff0000', '#0000ff'];
const VIDEO_TIMEOUT = 10000;

const rgb = hex => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);

function writePicture(path, vertical) {
  const {width, height} = PICTURE;
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, width, height);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(...rgb(MIDDLE));
  context.paint();
  const [bandWidth, bandHeight] = vertical ? [width, height * BAND] : [width * BAND, height];
  context.setSourceRGB(...rgb(LEADING));
  context.rectangle(0, 0, bandWidth, bandHeight);
  context.fill();
  context.setSourceRGB(...rgb(TRAILING));
  context.rectangle(width - bandWidth, height - bandHeight, bandWidth, bandHeight);
  context.fill();
  surface.writeToPNG(path);
  return Gio.File.new_for_path(path).get_uri();
}

function edges(monitor, vertical) {
  const {x, y, width, height} = monitor;
  const [middleX, middleY] = [x + Math.floor(width / 2), y + Math.floor(height / 2)];
  return vertical
    ? {leading: [middleX, y + EDGE_INSET], trailing: null}
    : {leading: [x + EDGE_INSET, middleY], trailing: [x + width - 1 - EDGE_INSET, middleY]};
}

async function shows(points) {
  const frame = await captureFrame();
  return points.every(([[x, y], color, wanted]) => frame.near(x, y, color, TOLERANCE) === wanted);
}

async function checkLive(monitor, kestrel, setFocus) {
  const scale = monitor.height / VIDEO.height;
  const overflow = VIDEO.width * scale - monitor.width;
  if (overflow <= 0)
    return;
  const video = await makeVideo('smpte', 'focus');
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  interfaceSettings.set_string('color-scheme', 'default');
  try {
    setFocus([0, 0.5]);
    kestrel.set_string('live-wallpaper', video.get_uri());
    await eventually(() => wallpapers().length > 0 && wallpapers().every(actor => actor.opacity === 255), 'the live wallpaper plays', VIDEO_TIMEOUT);
    const bar = VIDEO.width * scale / BARS.length;
    const probe = [monitor.x + Math.round(bar / 2), monitor.y + Math.round(monitor.height / 3)];
    await eventually(() => shows([[probe, BARS[0], true]]), 'focus 0 shows the left of the live wallpaper');
    setFocus([1, 0.5]);
    await eventually(() => shows([[probe, BARS[Math.floor((bar / 2 + overflow) / bar)], true]]), 'focus 1 moves the live wallpaper to its right part');
  } finally {
    kestrel.reset('live-wallpaper');
    await eventually(() => wallpapers().every(actor => actor.opacity === 0), 'the live wallpaper ends');
    interfaceSettings.set_string('color-scheme', colorScheme);
    video.delete(null);
  }
}

export async function run() {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const saved = [
    ...['picture-uri', 'picture-uri-dark', 'picture-options'].map(key => [background, key, background.get_value(key)]),
    ...['wallpaper-focus', 'wallpaper-focus-dark'].map(key => [kestrel, key, kestrel.get_value(key)]),
  ];
  const setFocus = focus => ['wallpaper-focus', 'wallpaper-focus-dark']
    .forEach(key => kestrel.set_value(key, new GLib.Variant('(dd)', focus)));
  const setPicture = uri => ['picture-uri', 'picture-uri-dark'].forEach(key => background.set_string(key, uri));
  try {
    const monitor = Main.layoutManager.primaryMonitor;
    const shape = monitor.width / monitor.height;
    const vertical = shape > PICTURE.width / PICTURE.height;
    const {leading, trailing} = edges(monitor, vertical);
    const axis = vertical ? 'top' : 'left';

    background.set_string('picture-options', 'zoom');
    setFocus([0.5, 0.5]);
    setPicture(writePicture(scratch('wallpaper-focus-check.png'), vertical));
    await eventually(() => shows([[leading, MIDDLE, true]]), 'a centered crop hides the picture\'s edge');

    const actor = Main.layoutManager._bgManagers[0].backgroundActor;
    setFocus(vertical ? [0.5, 0] : [0, 0.5]);
    await eventually(() => shows([[leading, LEADING, true]]), `focus 0 keeps the ${axis} edge of the picture`);
    require(Main.layoutManager._bgManagers[0].backgroundActor === actor, 'moving the focus keeps the loaded wallpaper');

    setFocus(vertical ? [0.5, 1] : [1, 0.5]);
    await eventually(() => shows([[leading, LEADING, false], ...trailing ? [[trailing, TRAILING, true]] : []]),
      'focus 1 keeps the opposite edge instead');

    setFocus(FOG_FOCUS);
    setPicture(Gio.File.new_for_path(FOG).get_uri());
    await eventually(async () => !await shows([[leading, LEADING, true]]) && !await shows([[leading, MIDDLE, true]]), 'Fog replaces the test picture');
    await capture(`wallpaper-focus-fog-${monitor.width}x${monitor.height}`);

    await checkLive(monitor, kestrel, setFocus);
  } finally {
    for (const [settings, key, value] of saved) settings.set_value(key, value);
  }
}
