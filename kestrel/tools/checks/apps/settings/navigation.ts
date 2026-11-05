import Clutter from 'gi://Clutter';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {scroll, type Point} from '../../lib/input/input.js';
import type {Frame} from '../../lib/screenshots.js';
import {changes, followLink, type Region} from '../lib/apps.js';

const SCROLL_POINT: Point = [650, 400];
const SCROLL_STEPS = 5;

export async function show(app: LuftApp, page: string, label = `settings shows ${page} from a kestrel-settings link`, area: Region | null = null) {
  await changes(app, label, () => followLink('settings', `kestrel-settings:${page}`), area);
  return app.settle(() => true);
}

export const showEnd = async (app: LuftApp, page: string) => scrollToEnd(app, await show(app, page));

export async function scrollDown(app: LuftApp, shown: Frame, steps = SCROLL_STEPS) {
  for (let step = 0; step < steps; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(SCROLL_POINT));
  return app.settle(frame => !frame.looksLike(shown));
}

export async function scrollToEnd(app: LuftApp, shown: Frame) {
  let after = shown;
  let before: Frame;
  do {
    before = after;
    after = await scrollDown(app, before);
  } while (!after.looksLike(before));
  return after;
}
