import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor } from '../../../shared/motion/motion.js';
import { clampUnit } from '../../../shared/math.js';
import type { LauncherEntry } from './launcherEntries.js';
import { isVertical, outward, type Edge } from '../../../shared/layout/edge.js';

const PROGRESS_LENGTH = 28;
const PROGRESS_INSET = 5;
const PROGRESS_THICKNESS = 3;
const FLASHES = 3;
const SETTLED_OPACITY = 190;

export class AppIndicators {
  readonly attention = new St.Widget({ style_class: 'kestrel-task-attention', opacity: 0, visible: false });
  private readonly badge = new St.Label({ style_class: 'kestrel-task-badge', visible: false, y: 1 });
  private readonly progress = new St.Widget({ style_class: 'kestrel-task-progress', visible: false });
  private readonly fill = new St.Widget({ style_class: 'kestrel-task-progress-fill' });
  private attending = false;
  private size = 0;
  private vertical = false;
  private fraction = 0;

  constructor(content: St.Widget, size: number, edge: Edge) {
    content.insert_child_at_index(this.attention, 0);
    this.progress.add_child(this.fill);
    content.add_child(this.progress);
    content.add_child(this.badge);
    this.resize(size, edge);
  }

  resize(size: number, edge: Edge): void {
    this.size = size;
    this.vertical = isVertical(edge);
    this.attention.set_size(size, size);
    const along = (size - PROGRESS_LENGTH) / 2;
    const across = outward(edge) > 0 ? size - PROGRESS_INSET : PROGRESS_INSET - PROGRESS_THICKNESS;
    if (this.vertical) this.progress.set({ x: across, y: along, width: PROGRESS_THICKNESS, height: PROGRESS_LENGTH });
    else this.progress.set({ x: along, y: across, width: PROGRESS_LENGTH, height: PROGRESS_THICKNESS });
    this.fill.set({ x: 0, y: 0, width: PROGRESS_THICKNESS, height: PROGRESS_THICKNESS });
    this.fillProgress(0);
    this.placeBadge();
  }

  private placeBadge(): void {
    if (this.badge.visible) this.badge.x = this.size - 1 - this.badge.get_preferred_width(-1)[1];
  }

  get showsProgress(): boolean {
    return this.progress.visible;
  }

  update(entry: LauncherEntry, attention: boolean): void {
    this.badge.visible = entry.countVisible && entry.count > 0;
    if (this.badge.visible) this.badge.text = entry.count > 99 ? '99+' : `${entry.count}`;
    this.placeBadge();
    this.progress.visible = entry.progressVisible;
    if (this.progress.visible) {
      this.fraction = clampUnit(entry.progress);
      this.fillProgress(200);
    }
    this.setAttention(attention || entry.urgent);
  }

  private fillProgress(duration: number): void {
    const length = Math.round(PROGRESS_LENGTH * this.fraction);
    animateActor(this.fill, { [this.vertical ? 'height' : 'width']: length, duration, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
  }

  private setAttention(attention: boolean): void {
    if (attention === this.attending) return;
    this.attending = attention;
    this.attention.remove_all_transitions();
    if (!attention) {
      animateActor(this.attention, { opacity: 0, duration: 200, onStopped: () => { if (!this.attending) this.attention.hide(); } });
      return;
    }
    this.attention.show();
    this.attention.opacity = 0;
    animateActor(this.attention, {
      opacity: 255, duration: 420, mode: Clutter.AnimationMode.EASE_IN_OUT_QUAD, autoReverse: true, repeatCount: FLASHES * 2 - 1,
      onComplete: () => animateActor(this.attention, { opacity: SETTLED_OPACITY, duration: 300 }),
    });
  }
}
