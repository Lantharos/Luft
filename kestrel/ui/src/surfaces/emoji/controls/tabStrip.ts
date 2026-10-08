import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor, animateAdjustment } from '../../../shared/motion.js';
import type { Tab } from '../catalog/catalog.js';

const INDICATOR_DURATION = 220;
const REVEAL_MARGIN = 28;
const WHEEL_STEP = 48;

export interface StripEvents {
  hovered(title: string | null): void;
  activated(index: number): void;
}

export function stripButton(child: Clutter.Actor, title: string, events: StripEvents, index: number): St.Bin {
  const button = new St.Bin({ style_class: 'kestrel-emoji-tab', reactive: true, track_hover: true, x_expand: true, child, accessible_name: title });
  button.connect('notify::hover', () => events.hovered(button.hover ? title : null));
  button.connect('button-press-event', (_actor, event) => {
    if (event.get_button() !== Clutter.BUTTON_PRIMARY) return Clutter.EVENT_PROPAGATE;
    events.activated(index);
    return Clutter.EVENT_STOP;
  });
  return button;
}

function face(tab: Tab): Clutter.Actor {
  return tab.glyph
    ? new St.Label({ text: tab.glyph, style_class: 'kestrel-emoji-tab-glyph', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER })
    : new St.Icon({ icon_name: tab.icon, icon_size: 16 });
}

export class TabStrip {
  private readonly content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  readonly actor = new St.ScrollView({
    style_class: 'kestrel-emoji-tab-scroll', hscrollbar_policy: St.PolicyType.EXTERNAL,
    vscrollbar_policy: St.PolicyType.NEVER, child: this.content, x_expand: true,
  });
  private readonly row = new St.BoxLayout({ style_class: 'kestrel-emoji-tabs' });
  private readonly indicator = new St.Widget({ style_class: 'kestrel-emoji-tab-indicator', opacity: 0 });
  private readonly buttons: St.Bin[];
  private current = -1;
  private focused = -1;
  private scrollTarget = 0;

  constructor(readonly tabs: readonly Tab[], events: StripEvents) {
    this.buttons = tabs.map((tab, index) => stripButton(face(tab), tab.title, events, index));
    for (const button of this.buttons) {
      button.x_expand = false;
      button.accessible_role = Atk.Role.PAGE_TAB;
      button.add_style_class_name('kestrel-emoji-category');
      this.row.add_child(button);
    }
    const track = new St.Widget({ style_class: 'kestrel-emoji-tab-track' });
    track.add_child(this.indicator);
    this.content.add_child(this.row);
    this.content.add_child(track);
    this.row.connect('notify::allocation', () => this.moveIndicator(false));
    this.actor.connect('scroll-event', (_actor, event) => this.scrollSideways(event));
  }

  get focusedIndex(): number {
    return this.focused;
  }

  get currentIndex(): number {
    return this.current;
  }

  setCurrent(tab: Tab | null): void {
    const index = tab ? this.tabs.indexOf(tab) : -1;
    if (index === this.current) return;
    this.buttons[this.current]?.remove_style_pseudo_class('checked');
    this.buttons[this.current]?.remove_accessible_state(Atk.StateType.SELECTED);
    this.current = index;
    this.buttons[index]?.add_style_pseudo_class('checked');
    this.buttons[index]?.add_accessible_state(Atk.StateType.SELECTED);
    this.moveIndicator(true);
    if (this.focused < 0) this.reveal(index);
  }

  focus(index: number): void {
    this.buttons[this.focused]?.remove_style_pseudo_class('focus');
    this.focused = index;
    this.buttons[index]?.add_style_pseudo_class('focus');
    this.reveal(index);
  }

  private reveal(index: number): void {
    const button = this.buttons[index];
    if (!button?.has_allocation()) return;
    const box = button.get_allocation_box();
    const adjustment = this.actor.hadjustment;
    const { page_size: page, upper } = adjustment;
    const value = adjustment.get_transition('value') ? this.scrollTarget : adjustment.value;
    let target = value;
    if (box.x1 - REVEAL_MARGIN < value) target = box.x1 - REVEAL_MARGIN;
    else if (box.x2 + REVEAL_MARGIN > value + page) target = box.x2 + REVEAL_MARGIN - page;
    this.scrollTarget = Math.max(0, Math.min(upper - page, target));
    if (this.scrollTarget !== value) animateAdjustment(adjustment, this.scrollTarget, { duration: INDICATOR_DURATION, mode: Clutter.AnimationMode.EASE_OUT_CUBIC });
  }

  private scrollSideways(event: Clutter.Event): boolean {
    const direction = event.get_scroll_direction();
    let delta: number;
    if (direction === Clutter.ScrollDirection.UP || direction === Clutter.ScrollDirection.DOWN) {
      delta = direction === Clutter.ScrollDirection.UP ? -WHEEL_STEP : WHEEL_STEP;
    } else if (direction === Clutter.ScrollDirection.SMOOTH) {
      const [dx, dy] = event.get_scroll_delta();
      if (dx || !dy) return Clutter.EVENT_PROPAGATE;
      delta = dy * WHEEL_STEP;
    } else {
      return Clutter.EVENT_PROPAGATE;
    }
    const adjustment = this.actor.hadjustment;
    adjustment.remove_transition('value');
    adjustment.value = Math.max(0, Math.min(adjustment.upper - adjustment.page_size, adjustment.value + delta));
    return Clutter.EVENT_STOP;
  }

  private moveIndicator(animate: boolean): void {
    const button = this.buttons[this.current];
    if (!button) {
      this.indicator.opacity = 0;
      return;
    }
    if (!button.has_allocation()) return;
    const box = button.get_allocation_box();
    const x = Math.round(box.x1 + (box.get_width() - this.indicator.width) / 2);
    if (animate && this.indicator.opacity) animateActor(this.indicator, { translation_x: x, duration: INDICATOR_DURATION, mode: Clutter.AnimationMode.EASE_OUT_CUBIC });
    else this.indicator.translation_x = x;
    this.indicator.opacity = 255;
  }
}
