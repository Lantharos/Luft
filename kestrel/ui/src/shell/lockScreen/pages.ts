import Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import * as Main from '../main.js';
import { SwipeTracker } from '../input/swipeTracker.js';

const CROSSFADE_TIME = 300;
const FADE_OUT_TRANSLATION = 200;
const FADE_OUT_SCALE = 0.3;
const MODIFIER_KEYS = [Clutter.KEY_Shift_L, Clutter.KEY_Shift_R, Clutter.KEY_Shift_Lock, Clutter.KEY_Caps_Lock, Clutter.KEY_Num_Lock];

export interface LockPagesOptions {
  actor: St.Widget;
  clock: Clutter.Actor;
  prompt: Clutter.Actor;
  companions: Clutter.Actor[];
  actionMode: Shell.ActionMode;
  preparePrompt: () => void;
  clockShown: () => void;
  focusPrompt: () => void;
}

const shrunk = (value: number): number => FADE_OUT_SCALE + (1 - FADE_OUT_SCALE) * value;

export class LockPages {
  private readonly clock: Clutter.Actor;
  private readonly prompt: Clutter.Actor;
  private readonly companions: Clutter.Actor[];
  private readonly preparePrompt: () => void;
  private readonly clockShown: () => void;
  private readonly focusPrompt: () => void;
  private readonly adjustment: St.Adjustment;
  private readonly keyController = new Clutter.KeyController();
  private activePage: Clutter.Actor | null = null;

  constructor({ actor, clock, prompt, companions, actionMode, preparePrompt, clockShown, focusPrompt }: LockPagesOptions) {
    this.clock = clock;
    this.prompt = prompt;
    this.companions = companions;
    this.preparePrompt = preparePrompt;
    this.clockShown = clockShown;
    this.focusPrompt = focusPrompt;

    clock.set_pivot_point(0.5, 0.5);
    prompt.set_pivot_point(0.5, 0.5);
    for (const companion of companions) companion.set_pivot_point(0.5, 0.5);

    this.adjustment = new St.Adjustment({ actor, lower: 0, upper: 2, page_size: 1, page_increment: 1 });
    this.adjustment.connect('notify::value', () => this.setProgress(this.adjustment.value));

    const swipeTracker = new SwipeTracker(actor, Clutter.Orientation.VERTICAL, actionMode, { name: 'Lock screen swipe tracker' });
    swipeTracker.connect('begin', (tracker, monitor) => this.swipeBegin(tracker, monitor));
    swipeTracker.connect('update', (_tracker, progress) => (this.adjustment.value = progress));
    swipeTracker.connect('end', (_tracker, duration, endProgress) => this.swipeEnd(duration, endProgress));

    const scroll = new Clutter.ScrollController({
      flags: Clutter.ScrollControllerFlags.DISCRETE | Clutter.ScrollControllerFlags.SCROLL_VERTICAL,
    });
    scroll.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
      if (dy < 0) this.showClock();
      else if (dy > 0) this.showPrompt();
    });
    actor.add_action(scroll);

    this.keyController.connect('key-press', () => this.onKeyPress());
    actor.add_action(this.keyController);

    const click = new Clutter.ClickGesture();
    click.connect('recognize', () => this.showPrompt());
    actor.add_action(click);

    this.setProgress(0);
    this.showClock();
  }

  get promptShown(): boolean {
    return this.activePage === this.prompt;
  }

  showClock(): void {
    if (this.activePage === this.clock) return;
    this.activePage = this.clock;
    this.adjustment.ease(0, {
      duration: CROSSFADE_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => this.clockShown(),
    });
  }

  showPrompt(): void {
    this.preparePrompt();
    if (this.activePage === this.prompt) return;
    this.activePage = this.prompt;
    this.adjustment.ease(1, {
      duration: CROSSFADE_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
    });
  }

  private onKeyPress(): boolean {
    if (this.activePage === this.prompt || this.prompt.visible) return Clutter.EVENT_PROPAGATE;

    const [, keyval] = this.keyController.get_key();
    if (MODIFIER_KEYS.includes(keyval)) return Clutter.EVENT_PROPAGATE;

    this.showPrompt();
    this.focusPrompt();
    return Clutter.EVENT_STOP;
  }

  private swipeBegin(tracker: SwipeTracker, monitor: number): void {
    if (monitor !== Main.layoutManager.primaryIndex) return;
    this.adjustment.remove_transition('value');
    this.preparePrompt();
    const progress = this.adjustment.value;
    tracker.confirmSwipe(this.clock.get_parent()!.height, [0, 1], progress, Math.round(progress));
  }

  private swipeEnd(duration: number, endProgress: number): void {
    this.activePage = endProgress ? this.prompt : this.clock;
    this.adjustment.ease(endProgress, {
      mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
      duration,
      onComplete: () => {
        if (this.activePage === this.clock) this.clockShown();
      },
    });
  }

  private setProgress(progress: number): void {
    this.prompt.visible = progress > 0;
    this.clock.visible = progress < 1;

    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    const useMotion = St.Settings.get().reducedMotion !== St.ReducedMotion.REDUCE;
    const scale = (value: number) => (useMotion ? { scale_x: value, scale_y: value } : {});

    this.prompt.set({
      opacity: 255 * progress,
      ...scale(shrunk(progress)),
      ...useMotion ? { translation_y: FADE_OUT_TRANSLATION * (1 - progress) * scaleFactor } : {},
    });
    this.clock.set({
      opacity: 255 * (1 - progress),
      ...scale(shrunk(1 - progress)),
      ...useMotion ? { translation_y: -FADE_OUT_TRANSLATION * progress * scaleFactor } : {},
    });
    for (const companion of this.companions)
      companion.set({ opacity: 255 * progress, visible: progress > 0, ...scale(shrunk(progress)) });
  }
}
