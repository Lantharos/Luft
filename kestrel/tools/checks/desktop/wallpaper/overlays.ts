import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {descendants} from '../../lib/actors.js';
import type {Eventually} from '../../lib/check.js';
import {captureFrame, type Area} from '../../lib/screenshots.js';
import {threads} from '../../lib/threads.js';
import {pause} from '../../lib/wait.js';
import {framesOn, makeVideo, wallpapers} from './video.js';

const VIDEO_TIMEOUT = 10000;
const BLACK = '#000000';
const LIT_TOLERANCE = 40;
const SAMPLES = 5;
const SAMPLE_GAP_MS = 100;
const COST_MS = 5000;
const SHOWN_LIT = 0.2;
const TOP_BAND = 120;

export function topOfDesktop(): Area {
  const {x, y, width} = global.workspace_manager.get_active_workspace().get_work_area_for_monitor(global.display.get_primary_monitor());
  return {x, y, width, height: TOP_BAND};
}

const liveKey = () => new Gio.Settings({schema_id: 'org.gnome.desktop.interface'}).get_string('color-scheme') === 'prefer-dark' ? 'live-wallpaper-dark' : 'live-wallpaper';

export async function onLiveWallpaper(eventually: Eventually, action: () => Promise<void>) {
  const video = await makeVideo('black', 'black');
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const pictures = ['picture-uri', 'picture-uri-dark'].map(key => [key, background.get_string(key)] as const);
  const key = liveKey();
  kestrel.set_string(key, video.get_uri());
  try {
    await eventually(() => wallpapers().length === global.display.get_n_monitors() && wallpapers().every(actor => actor.opacity === 255),
      'a black video plays behind the desktop', VIDEO_TIMEOUT);
    await eventually(async () => Math.max(...await litShares(topOfDesktop())) < SHOWN_LIT, 'the desktop shows the video in place of the picture', VIDEO_TIMEOUT);
    await action();
  } finally {
    kestrel.reset(key);
    for (const [picture, uri] of pictures) background.set_string(picture, uri);
    await eventually(() => wallpapers().length === 0, 'the video ends with its live wallpaper', VIDEO_TIMEOUT);
    video.delete(null);
  }
}

export function paintsBetween(actor: Clutter.Actor, windows: Meta.Window[]) {
  const order = descendants(global.stage);
  const at = order.indexOf(actor);
  return at >= 0 && wallpapers().every(video => order.indexOf(video) < at) &&
    windows.every(window => at < order.indexOf(window.get_compositor_private() as Meta.WindowActor));
}

export async function litShares(area: Area) {
  const shares: number[] = [];
  for (let sample = 0; sample < SAMPLES; sample++) {
    shares.push(1 - (await captureFrame(area)).share([BLACK], LIT_TOLERANCE));
    await pause(SAMPLE_GAP_MS);
  }
  return shares;
}

export async function liveCost(name: string) {
  const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  const before = threads();
  const started = GLib.get_monotonic_time();
  const frames = await framesOn(monitor, COST_MS);
  const seconds = (GLib.get_monotonic_time() - started) / 1e6;
  let onCpu = 0;
  let switches = 0;
  for (const [id, thread] of threads()) {
    onCpu += thread.onCpu - (before.get(id)?.onCpu ?? 0);
    switches += thread.switches - (before.get(id)?.switches ?? 0);
  }
  const cost = {paintsPerSecond: Math.round(frames / seconds * 10) / 10, wakeupsPerSecond: Math.round(switches / seconds), cpuPercent: Math.round(onCpu / 1e9 / seconds * 1000) / 10};
  console.log(`Kestrel live wallpaper, ${name}: ${JSON.stringify(cost)}`);
}
