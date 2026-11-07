import type Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { MonitorConstraint } from '../../core/stage/layout.js';
import * as KestrelUi from '../../kestrelUi.js';
import { MonumentClock } from './clock.js';
import { MonumentLayout } from './layout.js';
import { MonumentWake } from './wake.js';

export interface MonumentOptions {
  root: St.Widget;
  auth: Clutter.Actor;
  side: Clutter.Actor;
  controls: Clutter.Actor;
  /** The message that says how to bring up the prompt, while the screen rests. */
  hint: string;
  actionMode: Shell.ActionMode;
  preparePrompt: () => void;
  asleep: () => void;
  focusPrompt: (typed: string) => void;
}

export class Monument {
  readonly actor = new St.Widget({ name: 'kestrel-monument', constraints: new MonitorConstraint({ primary: true }) });
  readonly wake: MonumentWake;
  private readonly clock = new MonumentClock();
  private readonly layout: MonumentLayout;

  constructor({ root, auth, side, controls, hint, actionMode, preparePrompt, asleep, focusPrompt }: MonumentOptions) {
    const { time, date } = this.clock;
    const label = new St.Label({ name: 'kestrel-monument-hint', style_class: 'kestrel-monument-hint' });
    KestrelUi.bindText(label, hint);
    this.layout = new MonumentLayout({ time, date, hint: label, auth, side, controls });
    for (const part of [time, date, label, side, auth, controls]) this.actor.add_child(part);
    this.actor.layout_manager = this.layout;
    this.wake = new MonumentWake({ actor: root, layout: this.layout, actionMode, preparePrompt, asleep, focusPrompt });
  }

  set keyboardHeight(height: number) {
    this.layout.keyboardHeight = height;
  }
}
