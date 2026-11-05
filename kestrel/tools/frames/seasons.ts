import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {layerSheets, SEASONS, setSetting} from '../checks/extensions/lib/extensions.js';
import {moveTo, type Point} from '../checks/lib/input/input.js';
import {findWindow} from '../checks/lib/processes.js';
import {pause, settled, waitUntil} from '../checks/lib/wait.js';
import {slideWindow} from './glass.js';
import {eachFrame, type FrameRecorder, type Interaction} from './recorder.js';

const choose = (key: string, value: GLib.Variant) => setSetting(SEASONS, key, value);

let forced = false;

// Effects need animations, which sessions without a GPU turn off
async function fall(effect: string, intensity = 'heavy') {
  forced = global.force_animations;
  global.force_animations = true;
  await choose('effect', GLib.Variant.new_string(effect));
  await choose('intensity', GLib.Variant.new_string(intensity));
  await choose('on', GLib.Variant.new_boolean(true));
  await waitUntil(() => layerSheets(SEASONS).some(sheet => sheet.visible && sheet.opacity === 255), `${effect} falls`, 10000);
  await settled();
}

async function stop() {
  await choose('on', GLib.Variant.new_boolean(false));
  await waitUntil(() => !layerSheets(SEASONS).length, 'the effect winds down', 15000);
  global.force_animations = forced;
}

const slideFiles = (recorder: FrameRecorder) => slideWindow(findWindow((window: Meta.Window) => !!window.get_title()?.startsWith('Files'))!, recorder);

const SETTLE_MS = 1000;
const STILL_MS = 3000;
const AWAY: Point = [1400, 880];
const IN_THE_RAIN: Point = [700, 400];
const SWEEP_FRAMES = 150;

async function sweepPointer(recorder: FrameRecorder) {
  recorder.start();
  await eachFrame(SWEEP_FRAMES, frame => moveTo([200 + 900 * frame / SWEEP_FRAMES, 200 + 300 * Math.sin(frame * 0.05) ** 2]));
}

async function holdPointer(recorder: FrameRecorder, at: Point) {
  moveTo(at);
  await pause(SETTLE_MS);
  recorder.start();
  await pause(STILL_MS);
}

const steadyRain = {prepare: () => fall('rain', 'steady'), finish: stop};

export const seasonsInteractions: Interaction[] = [
  ...['rain', 'snow', 'leaves', 'fireflies', 'fog'].map(effect => ({
    name: `window moving through ${effect}`,
    prepare: () => fall(effect),
    act: slideFiles,
    finish: stop,
  })),
  {name: 'pointer away from steady rain', ...steadyRain, act: recorder => holdPointer(recorder, AWAY)},
  {name: 'pointer still in steady rain', ...steadyRain, act: recorder => holdPointer(recorder, IN_THE_RAIN)},
  {name: 'pointer moving through steady rain', ...steadyRain, act: sweepPointer},
];
