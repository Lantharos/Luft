import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {openBoardWindow} from '../checks/board/lib/board.js';
import {act, choose, pageItems, PHOSPHOR} from '../checks/desktop/phosphor/effects.js';
import {installBuilt, listed} from '../checks/extensions/lib/extensions.js';
import {findWindow, type Process, stop, windows} from '../checks/lib/processes.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import {slideWindow} from './glass.js';
import type {FrameRecorder, Interaction} from './recorder.js';

type Choice = boolean | number | string;

const EXTRA_WINDOWS = 12;
const OFF: Record<string, Choice> = {border: 'off', 'border-motion': 'still', overlay: 'off', 'desktop-crt': false, 'crt-curvature': 0, 'crt-flicker': false, bloom: 0, 'chromatic-aberration': 0, grade: 'off', invert: 'off', 'shadow-boost': 0};

const slideFiles = (recorder: FrameRecorder) => slideWindow(findWindow((window: Meta.Window) => !!window.get_title()?.startsWith('Files'))!, recorder);
const opened: Process[] = [];

async function openMore() {
  const before = windows().length;
  for (let index = 0; index < EXTRA_WINDOWS; index++) opened.push(openBoardWindow(`Effects ${index}`, 420, 300));
  await waitUntil(() => windows().length >= before + EXTRA_WINDOWS, 'the extra windows open', 15000);
}

async function apply(choices: Record<string, Choice>) {
  if (!(await listed(PHOSPHOR))) await installBuilt(PHOSPHOR);
  await waitUntil(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs', 5000);
  if (!opened.length) await openMore();
  for (const [key, value] of Object.entries({...OFF, ...choices})) await choose(key, value);
  await settled();
}

async function onEveryApp(title: string, on: boolean) {
  const everywhere = (await pageItems()).find(item => item.title === title)!;
  await act(everywhere.action!, new GLib.Variant('b', on));
  await settled();
}

async function closeMore() {
  await Promise.all(opened.splice(0).map(stop));
}

function everyWindow(name: string, title: string): Interaction {
  return {
    name: `Phosphor: ${name}`,
    prepare: async () => {
      await apply({});
      await onEveryApp(title, true);
    },
    act: slideFiles,
    finish: () => onEveryApp(title, false),
  };
}

function measured(name: string, choices: Record<string, Choice>): Interaction {
  return {
    name: `Phosphor: ${name}`,
    prepare: () => apply(choices),
    act: slideFiles,
    finish: () => apply({}),
  };
}

export const phosphorInteractions: Interaction[] = [
  measured('nothing on, 12 extra windows', {}),
  measured('borders on every window', {border: 'gradient'}),
  measured('flowing glow on every window', {border: 'glow', 'border-motion': 'flow'}),
  measured('scanline overlay on every window', {overlay: 'scanlines'}),
  everyWindow('CRT in every window', 'CRT on every app'),
  everyWindow('chromatic aberration in every window', 'Chromatic aberration on every app'),
  measured('screen CRT', {'desktop-crt': true}),
  measured('screen CRT with curvature', {'desktop-crt': true, 'crt-curvature': 0.5}),
  measured('screen grade and shadows', {grade: 'teal-orange', 'shadow-boost': 0.4}),
  measured('screen bloom', {bloom: 0.5}),
  measured('screen chromatic aberration', {'chromatic-aberration': 0.5}),
  {...measured('everything on the screen', {'desktop-crt': true, 'crt-curvature': 0.5, 'crt-flicker': true, grade: 'teal-orange', 'shadow-boost': 0.4, bloom: 0.5}), finish: async () => {
    await apply({});
    await closeMore();
  }},
];
