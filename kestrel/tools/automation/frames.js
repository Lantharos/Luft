import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {dismissImmediately} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {leaveBoard, openWindows} from '../checks/board/lib/board.js';
import {rest} from '../checks/lib/input.js';
import {stopAll} from '../checks/lib/processes.js';
import {settled} from '../checks/lib/wait.js';
import {boardInteractions} from '../frames/board.js';
import {glassInteractions} from '../frames/glass.js';
import {FrameRecorder, summarize, summarizeGpu, timelines} from '../frames/recorder.js';
import {printReport, saveReport} from '../frames/report.js';
import {surfaceInteractions} from '../frames/surfaces.js';
import {windowInteractions} from '../frames/windows.js';

const TIMING_ROUNDS = 3;
const GPU_ROUNDS = 2;
const STARTUP_SETTLE = 3000;

async function record(interaction, gpu) {
  await interaction.prepare();
  const recorder = new FrameRecorder({gpu});
  try {
    await interaction.act(recorder);
  } finally {
    recorder.stop();
  }
  return recorder;
}

async function measure(interaction, refreshRate) {
  console.log(`Kestrel frames: measuring ${interaction.name}`);
  try {
    return await measureRounds(interaction, refreshRate);
  } catch (error) {
    logError(error, interaction.name);
    return {error: error.message};
  }
}

async function reset() {
  dismissImmediately();
  rest();
  await settled();
}

async function measureRounds(interaction, refreshRate) {
  await reset();
  const timing = [];
  for (let round = 0; round < TIMING_ROUNDS; round++) timing.push(await record(interaction, false));
  const gpu = [];
  for (let round = 0; round < GPU_ROUNDS; round++) gpu.push(await record(interaction, true));
  return {...summarize(timing, refreshRate), gpu: summarizeGpu(gpu), timelines: timelines(timing)};
}

function selected(interactions) {
  const only = GLib.getenv('KESTREL_FRAMES_ONLY');
  if (!only) return interactions;
  const words = only.toLowerCase().split(',');
  return interactions.filter(({name}) => words.some(word => name.toLowerCase().includes(word)));
}

function display() {
  const monitor = Main.layoutManager.primaryMonitor;
  const scale = global.display.get_monitor_scale(Main.layoutManager.primaryIndex);
  const [view] = global.stage.peek_stage_views();
  return {width: Math.round(monitor.width * scale), height: Math.round(monitor.height * scale), scale, refreshRate: view.get_refresh_rate()};
}

export async function run() {
  await settled(STARTUP_SETTLE);
  const screen = display();
  const results = {};
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  session.set_uint('idle-delay', 0);
  interfaceSettings.set_boolean('cursor-blink', false);
  await openWindows();
  try {
    for (const interaction of selected([...surfaceInteractions, ...glassInteractions, ...windowInteractions, ...boardInteractions]))
      results[interaction.name] = await measure(interaction, screen.refreshRate);
  } finally {
    await leaveBoard();
    await stopAll();
    session.reset('idle-delay');
    interfaceSettings.reset('cursor-blink');
  }
  const report = {display: screen, recorded: GLib.DateTime.new_now_local().format_iso8601(), interactions: results};
  printReport(report, GLib.getenv('KESTREL_FRAMES_BASELINE'));
  saveReport(report);
}
