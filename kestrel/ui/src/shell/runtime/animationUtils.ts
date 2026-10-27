import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { logErrorUnlessCancelled } from './errorUtils.js';

const SCROLL_TIME = 100;

const WIGGLE_OFFSET = 6;
const WIGGLE_DURATION = 65;
const N_WIGGLES = 3;

interface WiggleOptions {
  offset?: number;
  duration?: number;
  wiggleCount?: number;
}

export function adjustAnimationTime(msecs: number, { animationRequired = false } = {}): number {
  const settings = St.Settings.get();

  if (!settings.enable_animations && !animationRequired) return 0;
  return settings.slow_down_factor * msecs;
}

export function ensureActorVisibleInScrollView(scrollView: St.ScrollView, actor: Clutter.Actor): void {
  const adjustment = scrollView.vadjustment;
  let [value, , upper, , , pageSize] = adjustment.get_values();

  const vfade = scrollView.get_effect('fade') as St.ScrollViewFade | null;
  const offset = vfade ? vfade.fade_margins.top : 0;

  let box = actor.get_allocation_box();
  let y1 = box.y1;
  let y2 = box.y2;

  let parent = actor.get_parent();
  while (parent !== scrollView) {
    if (!parent) throw new Error('actor not in scroll view');

    box = parent.get_allocation_box();
    y1 += box.y1;
    y2 += box.y1;
    parent = parent.get_parent();
  }

  if (y1 < value + offset) value = Math.max(0, y1 - offset);
  else if (y2 > value + pageSize - offset) value = Math.min(upper, y2 + offset - pageSize);
  else return;

  adjustment.ease(value, {
    mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    duration: SCROLL_TIME,
  });
}

export async function wiggle(actor: Clutter.Actor, options?: WiggleOptions): Promise<void> {
  if (!St.Settings.get().enable_animations || options?.duration === 0) return;

  const { offset = WIGGLE_OFFSET, duration = WIGGLE_DURATION, wiggleCount = N_WIGGLES } = options ?? {};
  actor.translation_x = 0;

  try {
    await actor.easeAsync({
      translation_x: -offset,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    });
    await actor.easeAsync({
      translation_x: offset,
      duration,
      mode: Clutter.AnimationMode.LINEAR,
      repeatCount: wiggleCount,
      autoReverse: true,
    });
    await actor.easeAsync({
      translation_x: 0,
      duration,
      mode: Clutter.AnimationMode.EASE_IN_QUAD,
    });
  } catch (e) {
    logErrorUnlessCancelled(e);
  }
}
