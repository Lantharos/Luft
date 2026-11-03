import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {playMusic} from '../lib/audio/music.js';
import {checks} from '../lib/check.js';
import {stop, stopAll} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {openWindow} from '../tiling/lib/tiling.js';
import {eachFrame, FrameRecorder, summarize, summarizeGpu} from '../../frames/recorder.js';
import {installBuilt, layerSheets, listed, request, setSetting} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('visualizer');
const VISUALIZER = 'com.lantharos.Visualizer';
const STYLES = ['glow', 'wave', 'bars'];
const MOST_CPU_WHILE_PLAYING = 0.03;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const monitor = Shell.AudioMonitor.get_default();

const SWEEP_FRAMES = 120;
const ROUNDS = 3;

const showing = () => layerSheets(VISUALIZER).some(sheet => sheet.visible && sheet.opacity === 255);

/** Frame times while a window slides across the bottom of the desktop, the way people drag windows over the glow. */
async function sweep(window: Meta.Window) {
  const start = window.get_frame_rect();
  const runs: FrameRecorder[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    const recorder = new FrameRecorder({gpu: true});
    recorder.start();
    await eachFrame(SWEEP_FRAMES, step => window.move_frame(true, start.x + Math.round(Math.sin(step / 12) * 240), start.y));
    recorder.stop();
    runs.push(recorder);
  }
  window.move_frame(true, start.x, start.y);
  const [view] = global.stage.peek_stage_views();
  return {...summarize(runs, view.get_refresh_rate()), gpu: summarizeGpu(runs)};
}

function report<Frames>(name: string, frames: Frames): Frames {
  console.log(`Kestrel visualizer frames, ${name}: ${JSON.stringify(frames)}`);
  return frames;
}

export async function run() {
  const forced = global.force_animations;
  global.force_animations = true;
  await installBuilt(VISUALIZER);
  try {
    await eventually(async () => (await listed(VISUALIZER))?.state === 'running', 'Visualizer runs once installed');
    await pause(500);
    require(!layerSheets(VISUALIZER).length && !monitor.get_listening(), 'while nothing plays it draws nothing and listens to nothing');

    const {window: swept} = await openWindow('Swept', 520, 300);
    swept.move_frame(true, 300, global.stage.height - 420);
    const quiet = report('nothing playing', await sweep(swept));
    swept.minimize();

    const music = await playMusic(40, (condition, label) => eventually(condition, label));
    try {
      await eventually(showing, 'music brings the glow up along the bottom of the desktop');
      await pause(1500);
      for (const style of STYLES) {
        await setSetting(VISUALIZER, 'style', new GLib.Variant('s', style));
        await pause(700);
        await capture(`visualizer-${style}`);
      }
      await setSetting(VISUALIZER, 'style', new GLib.Variant('s', 'glow'));
      await openWindow('Above the glow', 720, 420);
      await pause(700);
      require(showing(), 'it stays below a window that leaves the wallpaper showing');
      await capture('visualizer-window');
      await setSetting(VISUALIZER, 'displays', new GLib.Variant('s', 'primary'));
      await eventually(showing, 'it shows again after choosing where');
      const {cpu} = (await listed(VISUALIZER)) as unknown as {cpu: number};
      require(cpu < MOST_CPU_WHILE_PLAYING, `following the music costs little of the processor (${(cpu * 100).toFixed(1)} %)`);
      swept.unminimize();
      swept.raise();
      await pause(700);
      const playing = report('music playing', await sweep(swept));
      GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR')!, 'visualizer-frames.json']), JSON.stringify({quiet, playing}, null, 2));
      require(playing.missed <= quiet.missed + 2, `a window slides over the glow without missing frames (${quiet.missed} → ${playing.missed} missed)`);
    } finally {
      await stop(music);
    }
    await eventually(() => !layerSheets(VISUALIZER).length, 'when the music stops the glow settles and its layer goes', 10000);
    require(!monitor.get_listening(), 'and it stops listening');
  } finally {
    await request('Remove', VISUALIZER);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions']) kestrel.reset(key);
    global.force_animations = forced;
  }
}
