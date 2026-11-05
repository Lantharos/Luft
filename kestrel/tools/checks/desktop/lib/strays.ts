import type Clutter from 'gi://Clutter';
import type GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {descendants} from '../../lib/actors.js';
import {pause} from '../../lib/wait.js';
import {setSetting} from '../../extensions/lib/extensions.js';

export const STRAYS = 'com.lantharos.Strays';
const CLOSE_ENOUGH = 3;

export const sprites = () => descendants(global.stage).filter(actor => actor.name === `extension-sprite:${STRAYS}`);
export const sprite = () => sprites()[0];
export const foot = (actor: Clutter.Actor = sprite()) => actor.get_transformed_position()[1] + actor.height;
export const middle = (actor: Clutter.Actor = sprite()) => actor.get_transformed_position()[0] + actor.width / 2;
export const mood = (actor: Clutter.Actor = sprite()) => actor.accessible_name;
export const atRest = () => sprites().length > 0 && sprites().every(actor => /sitting|standing|sleeping|hovering/.test(mood(actor)));
export const near = (a: number, b: number, tolerance = CLOSE_ENOUGH) => Math.abs(a - b) <= tolerance;
export const taskbarTop = () => {
  const area = global.workspace_manager.get_active_workspace().get_work_area_for_monitor(global.display.get_primary_monitor());
  return area.y + area.height;
};
export const surfaceTop = (window: Meta.Window) => window.get_frame_rect().y;

export function report(name: string, value: unknown) {
  console.log(`Kestrel strays, ${name}: ${JSON.stringify(value)}`);
}

export async function paintsOver(milliseconds: number) {
  let frames = 0;
  const painted = global.stage.connect('after-paint', () => frames++);
  await pause(milliseconds);
  global.stage.disconnect(painted);
  return frames;
}

export async function withRandom(value: number, action: () => Promise<void>) {
  const random = Math.random;
  Math.random = () => value;
  try {
    await action();
  } finally {
    Math.random = random;
  }
}

export async function setStrays(values: Record<string, GLib.Variant>) {
  for (const [key, value] of Object.entries(values)) await setSetting(STRAYS, key, value);
}
