import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {writeDocument, writePicture} from '../../lib/access/printing.js';
import type {LuftApp} from '../../lib/apps/luftApp.js';
import {middle} from '../../lib/apps/probe.js';
import {checks} from '../../lib/check.js';
import {drag, press, type, type Point} from '../../lib/input/input.js';
import {outcome} from '../../lib/processes.js';
import {capture, type Frame} from '../../lib/screenshots.js';
import {pause} from '../../lib/wait.js';
import {changes, openApp} from '../lib/apps.js';

const {require} = checks('Luft app');
const FOLDER = GLib.build_filenamev([GLib.get_home_dir(), 'Drop check']);
const LEFT = 10;
const TOP = 20;
const MAGPIE_LEFT = 640;
const MOVED_MS = 400;
const ON_THE_PAGE: Point = [420, 400];
const ON_THE_SIDEBAR: Point = [90, 400];
const COLOR_TOLERANCE = 16;
const BAR_TOLERANCE = 48;
const PICTURE_SHARE = 0.1;
const BARS_SHARE = 0.01;
const DRAG = {steps: 24, interval: 30, hover: 500};

interface Sample {
  kind: string;
  file: string;
  shown: (frame: Frame) => boolean;
}

const pictureOn = (frame: Frame) => frame.share(['#3373cc'], COLOR_TOLERANCE) > PICTURE_SHARE;
const videoOn = (frame: Frame) => frame.share(['#00ff00', '#ff00ff'], BAR_TOLERANCE) > BARS_SHARE;
const pageOn = (frame: Frame) => frame.share(['#ffffff'], COLOR_TOLERANCE) > PICTURE_SHARE;

const SAMPLES: Sample[] = [
  {kind: 'video', file: 'Clip.webm', shown: videoOn},
  {kind: 'PDF', file: 'Paper.pdf', shown: pageOn},
  {kind: 'picture', file: 'Picture.png', shown: pictureOn},
  {kind: 'song', file: 'Song.flac', shown: frame => !pictureOn(frame) && !videoOn(frame) && !pageOn(frame)},
];

const inFolder = (name: string) => GLib.build_filenamev([FOLDER, name]);

async function encode(pipeline: string) {
  const encoded = await outcome(['gst-launch-1.0', '-q', ...GLib.shell_parse_argv(pipeline)[1]!]);
  require(encoded.ok, `GStreamer makes a sample: ${encoded.stderr}`);
}

async function writeSamples() {
  GLib.mkdir_with_parents(FOLDER, 0o755);
  writeDocument(inFolder('Paper.pdf'));
  writePicture(inFolder('Picture.png'));
  await encode(`videotestsrc pattern=smpte num-buffers=150 ! video/x-raw,width=640,height=360,framerate=30/1 ! vp8enc ! webmmux ! filesink location="${inFolder('Clip.webm')}"`);
  await encode(`audiotestsrc num-buffers=500 ! audioconvert ! flacenc ! filesink location="${inFolder('Song.flac')}"`);
}

async function openFolder(rover: LuftApp) {
  await changes(rover, 'Ctrl+L lets Rover take an address', () => press(Clutter.KEY_Control_L, Clutter.KEY_l));
  type(FOLDER);
  await changes(rover, 'Rover opens the folder of samples', () => press(Clutter.KEY_Return));
}

async function overlap(rover: LuftApp, magpie: LuftApp) {
  rover.window.move_frame(true, LEFT, TOP);
  magpie.window.move_frame(true, MAGPIE_LEFT, TOP);
  magpie.window.make_above();
  await pause(MOVED_MS);
}

async function dropOn(rover: LuftApp, magpie: LuftApp, {kind, file, shown}: Sample, at: Point, where: string) {
  await drag(rover.at(middle(await rover.find({text: file}))), magpie.at(at), DRAG);
  const opened = await magpie.settle(shown);
  await capture(`magpie-drop-${where.replaceAll(' ', '-')}-${kind.toLowerCase()}`);
  require(shown(opened), `a ${kind} dropped from Rover on ${where} opens in Magpie`);
}

async function withBoth(args: string[], use: (rover: LuftApp, magpie: LuftApp) => Promise<void>) {
  const rover = await openApp('rover', []);
  const magpie = await openApp('magpie', args);
  try {
    await magpie.settle(() => true);
    await overlap(rover, magpie);
    rover.window.activate(global.get_current_time());
    await openFolder(rover);
    await use(rover, magpie);
  } finally {
    await magpie.close();
    await rover.close();
  }
}

async function checkRunningWindow() {
  await withBoth([], async (rover, magpie) => {
    for (const sample of SAMPLES) await dropOn(rover, magpie, sample, ON_THE_PAGE, 'the library');
    await dropOn(rover, magpie, SAMPLES[0], ON_THE_SIDEBAR, 'the sidebar');
  });
}

async function checkOpenedFile() {
  await withBoth([inFolder('Picture.png')], async (rover, magpie) => {
    for (const sample of [...SAMPLES.filter(({kind}) => kind !== 'picture'), SAMPLES[2], SAMPLES[0], SAMPLES[2]])
      await dropOn(rover, magpie, sample, ON_THE_PAGE, 'an opened file');
  });
}

export async function checkDrops() {
  await writeSamples();
  await checkRunningWindow();
  await checkOpenedFile();
}
