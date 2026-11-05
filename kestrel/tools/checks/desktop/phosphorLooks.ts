import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {gjs, stopAll, waitForWindow} from '../lib/processes.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {listed, request} from '../extensions/lib/extensions.js';
import {act, attachedEffects, choose, installProbes, nothingAttached, pageItems, PHOSPHOR, SHADERS, shadersRun} from './phosphor/effects.js';
import {installStripedApp, STRIPED_DESKTOP_ID} from './phosphor/windows.js';

const {require, eventually} = checks('phosphor looks');
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

async function shot() {
  await settled();
  const {x, y, width, height} = Main.layoutManager.primaryMonitor!;
  return captureFrame({x, y, width, height: height - 64});
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

async function checkRules(window: Meta.Window) {
  window.activate(global.get_current_time());
  const area = window.get_frame_rect();
  const before = await shot();
  const add = (await pageItems()).find(item => item.options?.some(option => option.value === STRIPED_DESKTOP_ID));
  require(!!add, 'the page offers the striped app for a rule');
  await act(add!.action!, new GLib.Variant('s', STRIPED_DESKTOP_ID));
  const rule = (await pageItems()).find(item => item.type === 'list') as unknown as {items: {actions: {label: string; action: string}[]}[]};
  const crtToggle = rule.items[0].actions.find(action => action.label.startsWith('CRT'))!;
  await act(crtToggle.action, new GLib.Variant('b', true));
  await eventually(() => attachedEffects().effects === 1, 'a CRT on one app goes on that app only');
  await capture('phosphor-rule');
  const after = await shot();
  require(after.pixelsApart(before, 6) > 0, 'the app\'s window changes');
  const {box} = after.differences(before);
  const scale = global.display.get_monitor_scale(global.display.get_primary_monitor());
  require(box.x2 <= (area.x + area.width) * scale + 2 && box.y2 <= (area.y + area.height) * scale + 2, 'and nothing outside it');
}

export async function run() {
  installStripedApp();
  try {
    await installProbes();
    await eventually(shadersRun, 'the probe runs');
    await eventually(async () => (await listed(PHOSPHOR))?.state === 'running', 'Phosphor runs');
    const striped = await open('Striped', 100, 90);
    await open('Other', 760, 300, 'boardWindow');
    for (const source of Main.messageTray.getSources())
      for (const notification of [...source.notifications]) notification.destroy();
    await checkEveryLook();
    await checkTransitions();
    await checkRules(striped);
  } finally {
    await request('Remove', SHADERS);
    await request('Remove', PHOSPHOR);
    await stopAll();
    for (const key of ['extension-settings', 'disabled-extensions']) kestrel.reset(key);
  }
}
