import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import { SwipeTracker } from '../../shared/input/swipeTracker.js';
import { reducedMotion, Spring } from '../../shared/motion/motion.js';
import type { MonumentLayout } from './layout.js';

const MODIFIER_KEYS = [Clutter.KEY_Shift_L, Clutter.KEY_Shift_R, Clutter.KEY_Shift_Lock, Clutter.KEY_Caps_Lock, Clutter.KEY_Num_Lock];

export interface MonumentWakeOptions {
  actor: St.Widget;
  layout: MonumentLayout;
  actionMode: Shell.ActionMode;
  preparePrompt: () => void;
  asleep: () => void;
  focusPrompt: (typed: string) => void;
}

export class MonumentWake {
  private readonly layout: MonumentLayout;
  private readonly preparePrompt: () => void;
  private readonly asleep: () => void;
  private readonly focusPrompt: (typed: string) => void;
  private readonly adjustment: St.Adjustment;
  private readonly keyController = new Clutter.KeyController();
  private awake = false;

  constructor({ actor, layout, actionMode, preparePrompt, asleep, focusPrompt }: MonumentWakeOptions) {
    this.layout = layout;
    this.preparePrompt = preparePrompt;
    this.asleep = asleep;
    this.focusPrompt = focusPrompt;

    this.adjustment = new St.Adjustment({ actor, lower: 0, upper: 1, page_size: 0, page_increment: 1 });
    this.adjustment.connect('notify::value', () => this.layout.show(this.adjustment.value));

    const swipeTracker = new SwipeTracker(actor, Clutter.Orientation.VERTICAL, actionMode, { name: 'lock-screen-wake' });
    swipeTracker.connect('begin', (tracker, monitor) => this.swipeBegin(tracker, monitor));
    swipeTracker.connect('update', (_tracker, progress) => (this.adjustment.value = progress));
    swipeTracker.connect('end', (_tracker, _duration, endProgress) => this.settle(endProgress === 1));

    const scroll = new Clutter.ScrollController({
      flags: Clutter.ScrollControllerFlags.DISCRETE | Clutter.ScrollControllerFlags.SCROLL_VERTICAL,
    });
    scroll.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
      if (dy < 0) this.sleep();
      else if (dy > 0) this.wake();
    });
    actor.add_action(scroll);

    this.keyController.connect('key-press', () => this.onKeyPress());
    actor.add_action(this.keyController);

    const click = new Clutter.ClickGesture();
    click.connect('recognize', () => this.wake());
    actor.add_action(click);
  }

  get promptShown(): boolean {
    return this.awake;
  }

  sleep(): void {
    if (!this.awake) return;
    this.settle(false);
  }

  wake(): void {
    this.preparePrompt();
    if (!this.awake) this.settle(true);
  }

  private settle(awake: boolean): void {
    if (awake) this.preparePrompt();
    this.awake = awake;
    const onStopped = (finished: boolean) => {
      if (finished && !this.awake) this.asleep();
    };
    if (reducedMotion()) {
      this.adjustment.remove_transition('value');
      this.adjustment.value = awake ? 1 : 0;
      onStopped(true);
      return;
    }
    this.adjustment.ease(awake ? 1 : 0, { spring: Spring.smooth, onStopped });
  }

  private onKeyPress(): boolean {
    const [, keyval, , text] = this.keyController.get_key();
    const typed = text && GLib.unichar_isgraph(text) ? text : '';
    if (this.awake && (!typed || global.stage.key_focus instanceof Clutter.Text)) return Clutter.EVENT_PROPAGATE;
    if (MODIFIER_KEYS.includes(keyval)) return Clutter.EVENT_PROPAGATE;

    this.wake();
    this.focusPrompt(typed);
    return Clutter.EVENT_STOP;
  }

  private swipeBegin(tracker: SwipeTracker, monitor: number): void {
    if (monitor !== Main.layoutManager.primaryIndex) return;
    this.adjustment.remove_transition('value');
    this.preparePrompt();
    const progress = this.adjustment.value;
    tracker.confirmSwipe(global.stage.height / 2, [0, 1], progress, Math.round(progress));
  }
}
