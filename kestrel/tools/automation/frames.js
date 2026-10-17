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
import {popupInteractions} from '../frames/popups.js';
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

async function measure(name, rounds) {
  console.log(`Kestrel frames: measuring ${name}`);
  try {
    return await rounds();
  } catch (error) {
    logError(error, name);
    return {error: error.message};
  }
}

async function reset() {
  dismissImmediately();
  rest();
  await settled();
}

async function measureRounds(interaction, refreshRate, timingRounds, gpuRounds) {
  await reset();
  try {
    const timing = [];
    for (let round = 0; round < timingRounds; round++) timing.push(await record(interaction, false));
    const gpu = [];
    for (let round = 0; round < gpuRounds; round++) gpu.push(await record(interaction, true));
    return {...summarize(timing, refreshRate), ...gpu.length ? {gpu: summarizeGpu(gpu)} : {}, timelines: timelines(timing)};
  } finally {
    await interaction.finish?.();
  }
}

function selected(interactions, nameOf) {
  const only = GLib.getenv('KESTREL_FRAMES_ONLY');
  if (!only) return interactions;
  const words = only.toLowerCase().split(',');
  return interactions.filter(interaction => words.some(word => nameOf(interaction).toLowerCase().includes(word)));
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
    const interactions = [...surfaceInteractions, ...popupInteractions, ...glassInteractions, ...windowInteractions, ...boardInteractions];
    for (const interaction of selected(interactions.filter(({first}) => first), ({first}) => first))
      results[interaction.first] = await measure(interaction.first, () => measureRounds(interaction, screen.refreshRate, 1, 0));
    for (const interaction of selected(interactions, ({name}) => name))
      results[interaction.name] = await measure(interaction.name, () => measureRounds(interaction, screen.refreshRate, TIMING_ROUNDS, GPU_ROUNDS));
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
