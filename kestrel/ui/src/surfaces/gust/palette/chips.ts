import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { t } from '../../../shared/i18n/index.js';
import { CATEGORIES, CATEGORY_NAMES, type Category } from './categories.js';

const LEAVING = new Set([Clutter.KEY_Tab, Clutter.KEY_ISO_Left_Tab, Clutter.KEY_Down, Clutter.KEY_Return, Clutter.KEY_KP_Enter, Clutter.KEY_Escape]);
const TYPED = /^[^\p{C}\s]$/u;
const STEPS = new Map([[Clutter.KEY_Left, -1], [Clutter.KEY_Right, 1]]);
const WHEEL_STEP = 48;
const WHEEL = new Map([[Clutter.ScrollDirection.UP, -1], [Clutter.ScrollDirection.LEFT, -1], [Clutter.ScrollDirection.DOWN, 1], [Clutter.ScrollDirection.RIGHT, 1]]);

export type Chip = Category | 'open' | null;

export class CategoryChips {
  private readonly box = new St.BoxLayout({ name: 'kestrel-gust-chips', style_class: 'kestrel-gust-chips' });
  readonly actor = new St.ScrollView({
    style_class: 'kestrel-gust-chips-scroll', hscrollbar_policy: St.PolicyType.EXTERNAL, vscrollbar_policy: St.PolicyType.NEVER,
    x_expand: true, child: this.box,
  });
  private chips: [Chip, St.Button][] = [];
  private present = '';
  selected: Chip = null;

  constructor(private readonly changed: () => void, private readonly leave: (text: string) => void) {
    this.actor.connect('scroll-event', (_actor, event) => {
      const direction = event.get_scroll_direction();
      const [dx, dy] = event.get_scroll_delta();
      const delta = direction === Clutter.ScrollDirection.SMOOTH ? dx + dy : WHEEL.get(direction) ?? 0;
      this.actor.hadjustment.value += delta * WHEEL_STEP;
      return Clutter.EVENT_STOP;
    });
  }

  show(categories: Set<Category>, windows: boolean): void {
    const shown: Chip[] = [null, ...windows ? ['open' as const] : [], ...CATEGORIES.filter(category => categories.has(category))];
    const present = shown.join();
    if (present === this.present) return;
    this.present = present;
    this.box.destroy_all_children();
    this.box.add_child(new St.Widget({ style_class: 'kestrel-gust-chips-inset' }));
    this.chips = shown.map(category => [category, this.chip(category)]);
    this.box.add_child(new St.Widget({ style_class: 'kestrel-gust-chips-inset' }));
    if (!shown.includes(this.selected)) this.selected = null;
    this.mark();
  }

  select(category: Chip): void {
    if (category === this.selected) return;
    this.clear(category);
    this.changed();
  }

  clear(category: Chip = null): void {
    this.selected = category;
    this.mark();
  }

  focus(): void {
    this.chipOf(this.selected).grab_key_focus();
  }

  private chipOf(category: Chip): St.Button {
    return this.chips.find(([chip]) => chip === category)![1];
  }

  private mark(): void {
    for (const [category, chip] of this.chips) chip.checked = category === this.selected;
  }

  private step(steps: number): void {
    const index = this.chips.findIndex(([category]) => category === this.selected);
    const [category, chip] = this.chips[Math.max(0, Math.min(this.chips.length - 1, index + steps))];
    this.select(category);
    chip.grab_key_focus();
    this.reveal(chip);
  }

  private reveal(chip: St.Button): void {
    const adjustment = this.actor.hadjustment;
    const inset = this.chips[0][1].get_allocation_box().x1;
    const { x1, x2 } = chip.get_allocation_box();
    if (x1 - inset < adjustment.value) adjustment.value = x1 - inset;
    else if (x2 + inset > adjustment.value + adjustment.page_size) adjustment.value = x2 + inset - adjustment.page_size;
  }

  private chip(category: Chip): St.Button {
    const label = t(category === 'open' ? 'gust-category-open' : category ? CATEGORY_NAMES[category] : 'gust-category-all');
    const name = new St.Label({ text: label });
    name.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    const chip = new St.Button({
      name: `kestrel-gust-chip-${category ?? 'all'}`, style_class: 'kestrel-gust-chip', child: name,
      accessible_name: label, can_focus: true, track_hover: true,
    });
    chip.connect('clicked', () => this.select(category));
    chip.connect('key-focus-in', () => this.reveal(chip));
    chip.connect('key-press-event', (_chip, event) => {
      const key = event.get_key_symbol();
      const steps = STEPS.get(key);
      if (steps !== undefined) {
        this.step(steps);
        return Clutter.EVENT_STOP;
      }
      const text = event.get_key_unicode();
      const typed = TYPED.test(text);
      if (!typed && !LEAVING.has(key)) return Clutter.EVENT_PROPAGATE;
      this.leave(typed ? text : '');
      return Clutter.EVENT_STOP;
    });
    this.box.add_child(chip);
    return chip;
  }
}
