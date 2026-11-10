import GLib from 'gi://GLib';

import type {Eventually} from '../check.js';
import {scratch, spawn, stop} from '../processes.js';
import {pause} from '../wait.js';
import {RATE} from './music.js';
import {givePorts, link, speakers} from './routing.js';

const EAR = 'check-ear';
const SETTLE_MS = 150;
const AFTER_MS = 350;
const WAV_HEADER = 44;
const CHANNELS = 2;
const LOUD_ENOUGH = 0.015;
const QUIET_BETWEEN_MS = 22;

function dataOf(bytes: Uint8Array): Uint8Array {
  const text = new TextDecoder('latin1').decode(bytes.subarray(0, 4096));
  const at = text.indexOf('data');
  return bytes.subarray(at < 0 ? WAV_HEADER : at + 8);
}

function leftChannel(bytes: Uint8Array): Float32Array {
  const data = dataOf(bytes);
  const whole = data.length - data.length % (CHANNELS * 4);
  const interleaved = new Float32Array(data.buffer.slice(data.byteOffset, data.byteOffset + whole));
  return Float32Array.from({length: interleaved.length / CHANNELS}, (_, index) => interleaved[index * CHANNELS]);
}

export async function recorded(eventually: Eventually, connect: (ear: string) => Promise<boolean>, label: string, act: () => void | Promise<void>, afterMs = AFTER_MS): Promise<Float32Array> {
  const path = scratch(`${EAR}-${GLib.uuid_string_random()}.wav`);
  const ear = spawn(['pw-record', '-P', `{ node.name = ${EAR} }`, '--rate', `${RATE}`, '--channels', `${CHANNELS}`, '--format', 'f32', path]);
  await eventually(async () => await givePorts({'node.name': EAR}, 'Input', CHANNELS) && await connect(EAR), label);
  await pause(SETTLE_MS);
  await act();
  await pause(afterMs);
  await stop(ear);
  const samples = leftChannel(GLib.file_get_contents(path)[1]);
  GLib.unlink(path);
  return samples;
}

export const overhear = (eventually: Eventually, act: () => void | Promise<void>, afterMs = AFTER_MS) => recorded(eventually, async ear =>
  await speakers() && await link('speakers:monitor_FL', `${ear}:input_FL`) && await link('speakers:monitor_FR', `${ear}:input_FR`), 'the ear hears the speakers', act, afterMs);

export function toneStrength(samples: Float32Array, pitch: number): number {
  if (!samples.length) return 0;
  const step = 2 * Math.PI * pitch / RATE;
  let real = 0;
  let imaginary = 0;
  for (let index = 0; index < samples.length; index++) {
    real += samples[index] * Math.cos(step * index);
    imaginary += samples[index] * Math.sin(step * index);
  }
  return 2 * Math.hypot(real, imaginary) / samples.length;
}

export function onsets(samples: Float32Array): number[] {
  const gap = RATE * QUIET_BETWEEN_MS / 1000;
  const starts: number[] = [];
  let lastLoud = -gap;
  for (let index = 0; index < samples.length; index++) {
    if (Math.abs(samples[index]) < LOUD_ENOUGH) continue;
    if (index - lastLoud >= gap) starts.push(index);
    lastLoud = index;
  }
  return starts;
}

export function pitchAt(samples: Float32Array, start: number, length = RATE / 100): number {
  let crossings = 0;
  for (let index = start + 1; index < start + length; index++)
    if ((samples[index - 1] < 0) !== (samples[index] < 0)) crossings++;
  return crossings / 2 * RATE / length;
}
