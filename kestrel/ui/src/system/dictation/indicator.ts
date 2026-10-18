import Clutter from 'gi://Clutter';
import Mtk from 'gi://Mtk';
import Pango from 'gi://Pango';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { Context } from '../../context.js';
import { animateActor, Curve, Duration, reducedMotion, Spring } from '../../shared/motion.js';
import type { Box } from '../../shared/placement.js';
import { blurSurface } from '../../shared/surface.js';

const BAR_WEIGHTS = [0.55, 1, 0.75, 0.4];
const QUIETEST_BAR = 4;
const LOUDEST_BAR = 18;
const LEVEL_GAIN = 1.4;
const CARET_GAP = 10;
const EDGE_GAP = 16;
const HIDDEN_SCALE = 0.92;

export class DictationIndicator {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-dictation', visible: false, opacity: 0 });
  private readonly bars: St.Widget[];
  private readonly text = new St.Label({ style_class: 'kestrel-dictation-text', y_align: Clutter.ActorAlign.CENTER, visible: false });
  private caret: Box | null = null;

  constructor(private readonly context: Context) {
    blurSurface(this.actor, 18);
    const level = new St.BoxLayout({ style_class: 'kestrel-dictation-level', y_align: Clutter.ActorAlign.CENTER });
    this.bars = BAR_WEIGHTS.map(() => new St.Widget({ style_class: 'kestrel-dictation-bar', height: QUIETEST_BAR, y_align: Clutter.ActorAlign.CENTER }));
    for (const bar of this.bars) level.add_child(bar);
    this.text.clutter_text.ellipsize = Pango.EllipsizeMode.START;
    this.actor.add_child(level);
    this.actor.add_child(this.text);
    this.actor.set_pivot_point(0.5, 0.5);
    context.layoutManager.addTopChrome(this.actor);
  }

  show(caret: Box | null, showsText: boolean): void {
    this.text.text = '';
    this.text.visible = showsText;
    this.actor.remove_style_pseudo_class('busy');
    this.level(0);
    this.caret = caret;
    this.actor.show();
    this.place();
    const scale = reducedMotion() ? 1 : HIDDEN_SCALE;
    if (this.actor.opacity === 0) this.actor.set_scale(scale, scale);
    animateActor(this.actor, { opacity: 255, scale_x: 1, scale_y: 1, spring: Spring.snappy });
  }

  heard(text: string): void {
    if (!this.text.visible) return;
    this.text.text = text;
    this.place();
  }

  level(level: number): void {
    BAR_WEIGHTS.forEach((weight, index) => animateActor(this.bars[index], {
      height: QUIETEST_BAR + (LOUDEST_BAR - QUIETEST_BAR) * Math.min(1, level * weight * LEVEL_GAIN),
      duration: Duration.tap,
      curve: Curve.decelerate,
    }));
  }

  finishing(): void {
    this.level(0);
    this.actor.add_style_pseudo_class('busy');
  }

  hide(): void {
    const scale = reducedMotion() ? 1 : HIDDEN_SCALE;
    animateActor(this.actor, {
      opacity: 0, scale_x: scale, scale_y: scale, duration: Duration.quick, curve: Curve.decelerate,
      onComplete: () => { if (this.actor.opacity === 0) this.actor.hide(); },
    });
  }

  private place(): void {
    const display = (global as unknown as Shell.Global).display;
    const [, , width, height] = this.actor.get_preferred_size();
    const caret = this.caret;
    const monitor = caret ? display.get_monitor_index_for_rect(new Mtk.Rectangle({ x: caret.x, y: caret.y, width: 1, height: 1 })) : display.get_current_monitor();
    const area = this.context.layoutManager.getWorkAreaForMonitor(Math.max(0, monitor));
    const x = caret ? caret.x : area.x + (area.width - width) / 2;
    const below = caret ? caret.y + caret.height + CARET_GAP : area.y + EDGE_GAP;
    const y = caret && below + height > area.y + area.height ? caret.y - CARET_GAP - height : below;
    this.actor.set_position(
      Math.round(Math.min(Math.max(x, area.x + EDGE_GAP), area.x + area.width - width - EDGE_GAP)),
      Math.round(Math.max(y, area.y + EDGE_GAP)));
  }

  destroy(): void {
    this.actor.destroy();
  }
}
