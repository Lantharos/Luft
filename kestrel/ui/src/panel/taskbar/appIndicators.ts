import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor } from '../../shared/motion.js';
import type { LauncherEntry } from './launcherEntries.js';

const PROGRESS_WIDTH = 28;
const PROGRESS_INSET = 5;
const FLASHES = 3;
const SETTLED_OPACITY = 190;

export class AppIndicators {
  readonly attention = new St.Widget({ style_class: 'kestrel-task-attention', opacity: 0, visible: false });
  private readonly badge = new St.Label({ style_class: 'kestrel-task-badge', visible: false, y: 1 });
  private readonly progress = new St.Widget({ style_class: 'kestrel-task-progress', visible: false, width: PROGRESS_WIDTH });
  private readonly fill = new St.Widget({ style_class: 'kestrel-task-progress-fill' });
  private attending = false;
  private size = 0;

  constructor(content: St.Widget, size: number) {
    content.insert_child_at_index(this.attention, 0);
    this.progress.add_child(this.fill);
    content.add_child(this.progress);
    content.add_child(this.badge);
    this.resize(size);
  }

  resize(size: number): void {
    this.size = size;
    this.attention.set_size(size, size);
    this.progress.set_position((size - PROGRESS_WIDTH) / 2, size - PROGRESS_INSET);
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
      this.fill.height = this.progress.get_theme_node().get_height();
      animateActor(this.fill, { width: Math.round(PROGRESS_WIDTH * Math.min(1, Math.max(0, entry.progress))), duration: 200, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    }
    this.setAttention(attention || entry.urgent);
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
