import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { SKIN_TONES } from '../catalog/catalog.js';
import { stripButton, type StripEvents } from './tabStrip.js';

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
