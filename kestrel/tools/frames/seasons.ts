import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {layerSheets, SEASONS, setSetting} from '../checks/extensions/lib/extensions.js';
import {findWindow} from '../checks/lib/processes.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import {slideWindow} from './glass.js';
import type {FrameRecorder, Interaction} from './recorder.js';

const choose = (key: string, value: GLib.Variant) => setSetting(SEASONS, key, value);

let forced = false;

// Effects need animations, which sessions without a GPU turn off
async function fall(effect: string) {
  forced = global.force_animations;
  global.force_animations = true;
  await choose('effect', GLib.Variant.new_string(effect));
  await choose('intensity', GLib.Variant.new_string('heavy'));
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

export const seasonsInteractions: Interaction[] = ['rain', 'snow', 'leaves', 'fireflies', 'fog'].map(effect => ({
  name: `window moving through ${effect}`,
  prepare: () => fall(effect),
  act: slideFiles,
  finish: stop,
}));
