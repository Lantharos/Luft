import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Mtk from 'gi://Mtk';
import St from 'gi://St';

import { animateActor } from '../../../shared/motion/motion.js';
import { band, toward } from '../../../shared/layout/edge.js';
import { taskbarPreferences, type TaskbarLayout } from '../preferences/taskbarPreferences.js';
import type { Monitor } from '../panel.js';
import type { WindowOverlap } from './windowOverlap.js';

const HIDE_DELAY = 450;
const SLIDE_DURATION = 220;

export class AutoHide {
  readonly edge = new St.Widget({ name: 'kestrel-taskbar-edge', reactive: true, track_hover: true, visible: false });
  private revealed = true;
  private allowed = false;
  private active = false;
  private held = false;
  private suppressed = false;
  private arriving = false;
  private overlap: WindowOverlap | null = null;
  private timer = 0;
  private readonly focusSignal: number;

  constructor(private readonly panel: St.Widget, private readonly monitor: () => Monitor | null, private readonly rest: () => number) {
    panel.connect('notify::hover', () => this.sync());
    this.edge.connect('notify::hover', () => this.sync());
    const stage = global.stage;
    this.focusSignal = stage.connect('notify::key-focus', () => this.sync());
    panel.connect('destroy', () => {
      this.cancel();
      stage.disconnect(this.focusSignal);
    });
  }

  get hidden(): boolean {
    return !this.revealed;
  }

  get shown(): boolean {
    return this.allowed && this.revealed;
  }

  setAllowed(allowed: boolean): void {
    if (allowed === this.allowed) return;
    this.allowed = allowed;
    this.sync(true);
  }

  setActive(active: boolean): void {
    this.active = active;
    this.sync();
  }

  suppress(suppressed: boolean): void {
    this.suppressed = suppressed;
    this.sync();
  }

  holdBack(): void {
    this.arriving = true;
    this.sync(true);
  }

  arrive(): void {
    this.arriving = false;
    this.sync();
  }

  hold(held: boolean): void {
    this.held = held;
    this.sync();
  }

  watch(overlap: WindowOverlap | null): void {
    this.overlap = overlap;
    this.sync();
  }

  private get screen(): TaskbarLayout {
    return taskbarPreferences.on(this.monitor()?.index);
  }

  place(): void {
    const monitor = this.monitor();
    if (!monitor) return;
    const { x, y, width, height } = band(monitor, this.screen.edge, 1);
    this.edge.set_position(x, y);
    this.edge.set_size(width, height);
    if (!this.revealed) this.panel.set(this.offset(false));
  }

  private offset(revealed: boolean) {
    return revealed ? { translation_x: 0, translation_y: this.rest() } : toward(this.screen.edge, this.screen.clearance);
  }

  sync(immediate = false): void {
    const mode = this.screen.autoHide;
    this.panel.track_hover = mode !== 'never';
    const reveal = !this.suppressed && !this.arriving && (mode === 'never' || this.wanted(mode === 'windows'));
    this.edge.visible = this.allowed && !this.suppressed && !this.arriving && mode !== 'never' && !reveal;
    if (reveal) {
      this.cancel();
      this.slide(true, immediate);
    } else if (immediate || !this.allowed) {
      this.cancel();
      this.slide(false, true);
    } else if (this.suppressed) {
      this.cancel();
      this.slide(false, false);
    } else if (this.revealed && !this.timer) {
      this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, HIDE_DELAY, () => {
        this.timer = 0;
        if (!this.wanted(this.screen.autoHide === 'windows')) this.slide(false, false);
        return GLib.SOURCE_REMOVE;
      });
    }
  }

  private wanted(whenClear: boolean): boolean {
    const stage = global.stage;
    const focus = stage.get_key_focus();
    return this.active || this.panel.hover || this.edge.hover || (!!focus && this.panel.contains(focus)) ||
      (this.held && this.revealed) || (whenClear && !this.touched());
  }

  private touched(): boolean {
    const monitor = this.monitor();
    if (!monitor || !this.overlap) return false;
    return this.overlap.touches(new Mtk.Rectangle(band(monitor, this.screen.edge, this.screen.clearance)));
  }

  private slide(revealed: boolean, immediate: boolean): void {
    const changed = revealed !== this.revealed;
    this.revealed = revealed;
    if (immediate || !this.allowed) {
      this.settle();
      return;
    }
    if (!changed) return;
    this.panel.show();
    animateActor(this.panel, {
      ...this.offset(revealed),
      duration: SLIDE_DURATION,
      mode: revealed ? Clutter.AnimationMode.EASE_OUT_QUART : Clutter.AnimationMode.EASE_IN_QUART,
      onComplete: () => { if (!this.revealed) this.panel.hide(); },
    });
  }

  private settle(): void {
    this.panel.remove_transition('translation-x');
    this.panel.remove_transition('translation-y');
    this.panel.set(this.offset(this.revealed));
    this.panel.visible = this.allowed && this.revealed;
  }

  private cancel(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
  }
}
