import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor } from '../shared/motion.js';
import { SKIN_TONES, type Tab } from './catalog.js';

const INDICATOR_DURATION = 220;

interface StripEvents {
  hovered(title: string | null): void;
  activated(index: number): void;
}

function stripButton(child: Clutter.Actor, title: string, events: StripEvents, index: number): St.Bin {
  const button = new St.Bin({ style_class: 'kestrel-emoji-tab', reactive: true, track_hover: true, x_expand: true, child, accessible_name: title });
  button.connect('notify::hover', () => events.hovered(button.hover ? title : null));
  button.connect('button-press-event', (_actor, event) => {
    if (event.get_button() !== Clutter.BUTTON_PRIMARY) return Clutter.EVENT_PROPAGATE;
    events.activated(index);
    return Clutter.EVENT_STOP;
  });
  return button;
}

export class TabStrip {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true });
  private readonly row = new St.BoxLayout({ style_class: 'kestrel-emoji-tabs', x_expand: true });
  private readonly indicator = new St.Widget({ style_class: 'kestrel-emoji-tab-indicator', opacity: 0 });
  private readonly buttons: St.Bin[];
  private current = -1;
  private focused = -1;

  constructor(readonly tabs: readonly Tab[], events: StripEvents) {
    this.buttons = tabs.map((tab, index) => {
      const face = tab.glyph
        ? new St.Label({ text: tab.glyph, style_class: 'kestrel-emoji-tab-glyph', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER })
        : new St.Icon({ icon_name: tab.icon, icon_size: 16 });
      return stripButton(face, tab.title, events, index);
    });
    for (const button of this.buttons) this.row.add_child(button);
    const track = new St.Widget({ style_class: 'kestrel-emoji-tab-track' });
    track.add_child(this.indicator);
    this.actor.add_child(this.row);
    this.actor.add_child(track);
    this.row.connect('notify::allocation', () => this.moveIndicator(false));
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
    this.current = index;
    this.buttons[index]?.add_style_pseudo_class('checked');
    this.moveIndicator(true);
  }

  focus(index: number): void {
    this.buttons[this.focused]?.remove_style_pseudo_class('focus');
    this.focused = index;
    this.buttons[index]?.add_style_pseudo_class('focus');
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

const HAND = '✋';
const NAMES = ['Default skin tone', 'Light skin tone', 'Medium-light skin tone', 'Medium skin tone', 'Medium-dark skin tone', 'Dark skin tone'];

function hand(tone: number): St.Label {
  return new St.Label({ text: HAND + SKIN_TONES[tone], style_class: 'kestrel-emoji-tone', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
}

export class TonePicker {
  private readonly face = hand(0);
  readonly button: St.Bin;
  readonly options = new St.BoxLayout({ style_class: 'kestrel-emoji-tabs kestrel-emoji-tones', x_expand: true, visible: false, opacity: 0 });
  private readonly choices: St.Bin[];
  private focused = -1;

  constructor(events: StripEvents & { toggled(): void }) {
    this.button = stripButton(this.face, 'Skin tone', { hovered: events.hovered, activated: () => events.toggled() }, 0);
    this.button.add_style_class_name('kestrel-emoji-tone-button');
    this.button.x_expand = false;
    this.choices = SKIN_TONES.map((_modifier, tone) => stripButton(hand(tone), NAMES[tone], events, tone));
    for (const choice of this.choices) this.options.add_child(choice);
  }

  get focusedIndex(): number {
    return this.focused;
  }

  show(tone: number): void {
    this.face.text = HAND + SKIN_TONES[tone];
    this.choices.forEach((choice, index) => {
      if (index === tone) choice.add_style_pseudo_class('checked');
      else choice.remove_style_pseudo_class('checked');
    });
  }

  focus(index: number): void {
    this.choices[this.focused]?.remove_style_pseudo_class('focus');
    this.focused = index;
    this.choices[index]?.add_style_pseudo_class('focus');
  }

  focusButton(focused: boolean): void {
    if (focused) this.button.add_style_pseudo_class('focus');
    else this.button.remove_style_pseudo_class('focus');
  }
}
