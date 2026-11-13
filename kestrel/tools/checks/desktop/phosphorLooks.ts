import Gio from 'gi://Gio';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {listed, request} from '../extensions/lib/extensions.js';
import {attachedEffects, choose, installProbes, nothingAttached, PHOSPHOR, SHADERS, shadersRun} from './phosphor/effects.js';
import {checkCorners} from './phosphor/corners.js';
import {installStripedApp} from './phosphor/windows.js';

const looks = checks('phosphor looks');
const {require, eventually} = looks;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const OFF_NOTICE = 'was turned off';
const TRANSITIONS = ['glitch', 'fold', 'dissolve', 'burn', 'crt'];

const anyTurnedOff = () => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title?.endsWith(OFF_NOTICE)));

async function open(title: string, x: number, y: number, client = 'stripedWindow') {
  gjs(`clients/windows/${client}.js`, [title, '520', '360']);
  const window = await waitForWindow(candidate => !!candidate.get_title()?.startsWith(title), `${title} opens`);
  window.move_frame(true, x, y);
  await pause(300);
  return window;
}

async function checkEveryLook() {
  for (const style of ['color', 'gradient', 'glow']) {
    await choose('border', style);
    for (const motion of ['still', 'flow', 'pulse']) {
      await choose('border-motion', motion);
      await eventually(() => attachedEffects().overlays === 2, `a ${style} border that's ${motion} goes on`);
    }
  }
  await capture('phosphor-glow');
  await choose('border-motion', 'still');
  await choose('border', 'off');
  for (const look of ['scanlines', 'tint', 'grain', 'vignette', 'bezel']) {
    await choose('overlay', look);
    await eventually(() => attachedEffects().overlays === 2, `the ${look} overlay goes on`);
    await capture(`phosphor-overlay-${look}`);
  }
  await choose('overlay', 'off');
  await choose('chromatic-aberration', 0.5);
  await eventually(() => attachedEffects().views > 0, 'chromatic aberration works alone');
  await choose('chromatic-aberration', 0);
  for (const invert of ['colors', 'lightness']) {
    await choose('invert', invert);
    await eventually(() => attachedEffects().views > 0, `inverting ${invert} works`);
  }
  await choose('invert', 'off');
  for (const grade of ['warm', 'cold', 'teal-orange', 'noir', 'sepia', 'vivid']) {
    await choose('grade', grade);
    await eventually(() => attachedEffects().views > 0, `the ${grade} grade works`);
  }
  await choose('grade', 'off');
  await eventually(nothingAttached, 'turning everything off leaves nothing');
  for (const lines of ['lines', 'scanlines', 'shimmer']) {
    await choose('surface-lines', lines);
    await eventually(() => attachedEffects().effects > 0, `${lines} go on the taskbar`);
    await capture(`phosphor-surface-${lines}`);
  }
  await choose('surface-lines', 'off');
  await eventually(nothingAttached, 'and they come off');
  require(!anyTurnedOff(), 'every shader Phosphor offers compiles');
}

async function checkTransitions() {
  for (const look of TRANSITIONS) {
    await choose('open-effect', look);
    await choose('close-effect', look);
    const window = await open(`Shown ${look}`, 500, 200);
    await settled();
    require(nothingAttached(), `${look} leaves nothing on the window once it's open`);
    window.delete(global.get_current_time());
    await eventually(() => !global.get_window_actors().some(actor => actor.meta_window?.get_title() === `Shown ${look}`), `the window closes with ${look}`);
  }
  await choose('open-effect', 'off');
  await choose('close-effect', 'off');
  require(!anyTurnedOff(), 'every transition compiles');
}

export async function run() {
  installStripedApp();
  try {
    await installProbes();
    await eventually(shadersRun, 'the probe runs');
    await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
    await open('Striped', 100, 90);
    await open('Other', 760, 300, 'boardWindow');
    await checkEveryLook();
    await checkTransitions();
    await stopAll();
    await checkCorners(looks);
  } finally {
    await request('Remove', SHADERS);
    await request('Remove', PHOSPHOR);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions', 'rounded-window-corners']) kestrel.reset(key);
  }
}
