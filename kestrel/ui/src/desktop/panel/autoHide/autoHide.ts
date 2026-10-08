import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Mtk from 'gi://Mtk';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { animateActor } from '../../../shared/motion.js';
import { taskbarPreferences } from '../preferences/taskbarPreferences.js';
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
  private overlap: WindowOverlap | null = null;
  private timer = 0;
  private readonly focusSignal: number;

  constructor(private readonly panel: St.Widget, private readonly monitor: () => Monitor | null) {
    panel.connect('notify::hover', () => this.sync());
    this.edge.connect('notify::hover', () => this.sync());
    const stage = (global as unknown as Shell.Global).stage;
    this.focusSignal = stage.connect('notify::key-focus', () => this.sync());
    panel.connect('destroy', () => {
      this.cancel();
      stage.disconnect(this.focusSignal);
    });
  }

  get hidden(): boolean {
    return !this.revealed;
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

  hold(held: boolean): void {
    this.held = held;
    this.sync();
  }

  watch(overlap: WindowOverlap | null): void {
    this.overlap = overlap;
    this.sync();
  }

  place(): void {
    const monitor = this.monitor();
    if (!monitor) return;
    this.edge.set_position(monitor.x, monitor.y + monitor.height - 1);
    this.edge.set_size(monitor.width, 1);
    if (!this.revealed) this.panel.translation_y = taskbarPreferences.clearance;
  }

  sync(immediate = false): void {
    const mode = taskbarPreferences.autoHide;
    this.panel.track_hover = mode !== 'never';
    const reveal = !this.suppressed && (mode === 'never' || this.wanted(mode === 'windows'));
    this.edge.visible = this.allowed && !this.suppressed && mode !== 'never' && !reveal;
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
        if (!this.wanted(taskbarPreferences.autoHide === 'windows')) this.slide(false, false);
        return GLib.SOURCE_REMOVE;
      });
    }
  }

  private wanted(whenClear: boolean): boolean {
    const stage = (global as unknown as Shell.Global).stage;
    const focus = stage.get_key_focus();
    return this.active || this.panel.hover || this.edge.hover || (!!focus && this.panel.contains(focus)) ||
      (this.held && this.revealed) || (whenClear && !this.touched());
  }

  private touched(): boolean {
    const monitor = this.monitor();
    if (!monitor || !this.overlap) return false;
    const clearance = taskbarPreferences.clearance;
    return this.overlap.touches(new Mtk.Rectangle({ x: monitor.x, y: monitor.y + monitor.height - clearance, width: monitor.width, height: clearance }));
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
      translation_y: revealed ? 0 : taskbarPreferences.clearance,
      duration: SLIDE_DURATION,
      mode: revealed ? Clutter.AnimationMode.EASE_OUT_QUART : Clutter.AnimationMode.EASE_IN_QUART,
      onComplete: () => { if (!this.revealed) this.panel.hide(); },
    });
  }

  private settle(): void {
    this.panel.remove_transition('translation-y');
    this.panel.translation_y = this.revealed ? 0 : taskbarPreferences.clearance;
    this.panel.visible = this.allowed && this.revealed;
  }

  private cancel(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
  }
}
