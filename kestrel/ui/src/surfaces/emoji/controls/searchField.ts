import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { CaretBlink } from '../../../shared/caret.js';

export class SearchField {
  private readonly entry = new St.Entry({
    style_class: 'kestrel-search kestrel-emoji-search', hint_text: 'Search', x_expand: true, can_focus: false,
    primary_icon: new St.Icon({ icon_name: 'edit-find-symbolic', icon_size: 16 }),
  });
  private readonly caret = new St.Widget({ style_class: 'kestrel-emoji-caret', x_expand: true, x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.CENTER, opacity: 0 });
  readonly actor = new St.Widget({ layout_manager: new Clutter.BinLayout(), x_expand: true });
  private readonly blink = new CaretBlink(visible => { this.caret.opacity = visible ? 255 : 0; });
  private active = false;

  constructor(changed: (text: string) => void, pressed: () => void) {
    const text = this.entry.clutter_text;
    text.reactive = false;
    text.editable = false;
    text.cursor_visible = false;
    this.actor.add_child(this.entry);
    this.actor.add_child(this.caret);
    text.connect('text-changed', () => {
      changed(text.text);
      this.moveCaret();
    });
    this.entry.connect('notify::allocation', () => this.moveCaret());
    this.entry.connect('button-press-event', () => {
      pressed();
      return Clutter.EVENT_STOP;
    });
    this.actor.connect('destroy', () => this.blink.destroy());
  }

  get text(): string {
    return this.entry.text;
  }

  clear(): void {
    this.entry.text = '';
  }

  setActive(active: boolean): void {
    this.active = active;
    if (active) {
      this.entry.add_style_pseudo_class('focus');
      this.blink.restart();
    } else {
      this.entry.remove_style_pseudo_class('focus');
      this.blink.stop();
      this.caret.opacity = 0;
    }
  }

  edit(event: Clutter.Event): boolean {
    const text = this.entry.clutter_text;
    const control = (event.get_state() & Clutter.ModifierType.CONTROL_MASK) !== 0;
    if (event.get_key_symbol() === Clutter.KEY_BackSpace) {
      const length = [...text.text].length;
      text.delete_text(control ? 0 : Math.max(0, length - 1), length);
    } else {
      const character = event.get_key_unicode();
      if (control || !character || /\p{Cc}/u.test(character)) return false;
      text.insert_text(character, -1);
    }
    this.restartBlink();
    return true;
  }

  private restartBlink(): void {
    if (this.active) this.blink.restart();
  }

  private moveCaret(): void {
    const text = this.entry.clutter_text;
    if (!this.actor.mapped) return;
    const [, x] = text.position_to_coords([...text.text].length);
    this.caret.translation_x = text.get_allocation_box().x1 + x;
    this.restartBlink();
  }
}
