import Gio from 'gi://Gio';
import type {StatusRing} from '../../../ui/src/auth/prompt/statusRing.js';

import {firstStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {capture, captureFrame, type Area, type Frame} from '../lib/screenshots.js';
import {settled, pause} from '../lib/wait.js';
import {lockAndWake, showPrompt, unlock} from './lib/shield.js';

const {require} = checks('status ring');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const RING_SIZE = 94;
const CORNER = 8;
const LIT = 24;
const SWEEP_MS = 300;

const ring = () => firstStyled('kestrel-auth-who') as unknown as StatusRing;

function cornerOfRing(): Area {
  const [x, y] = ring().get_transformed_position();
  const [width] = ring().get_size();
  return {x: Math.round(x + (width - RING_SIZE) / 2), y: Math.round(y + (width - RING_SIZE) / 2), width: CORNER, height: CORNER};
}

const lit = (frame: Frame, empty: Frame) => frame.pixelsApart(empty, LIT) > 0;

async function checkShape(name: string, square: boolean) {
  kestrel.set_boolean('rounded-window-corners', !square);
  await settled();
  ring().clear();
  await pause(SWEEP_MS);
  const empty = await captureFrame(cornerOfRing());
  ring().fill(1, 0);
  await pause(SWEEP_MS);
  await capture(`status-ring-${name}-full`);
  require(lit(await captureFrame(cornerOfRing()), empty) === square, `the ring ${square ? 'reaches into the corner of a square avatar' : 'stays round around a round avatar'}`);
  ring().clear();
  ring().sweep();
  await pause(SWEEP_MS);
  await capture(`status-ring-${name}-sweeping`);
  ring().fail();
  await pause(SWEEP_MS / 3);
  await capture(`status-ring-${name}-failed`);
  ring().clear();
}

export async function run() {
  await lockAndWake();
  await showPrompt();
  try {
    await checkShape('round', false);
    await checkShape('square', true);
  } finally {
    kestrel.reset('rounded-window-corners');
    await unlock();
  }
}
