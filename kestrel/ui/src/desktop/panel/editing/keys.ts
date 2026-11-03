import Clutter from 'gi://Clutter';
import type St from 'gi://St';

import { stepElement, stepIsland, type Direction } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { rightToLeft } from '../../../shared/layout/edge.js';
import type { Island } from '../islands/islandSet.js';
import type { Grip } from './drag.js';
import type { TaskbarEditor } from './editor.js';

const ELEMENT_RADIUS = 12;

type Item = { island: Island } | { element: string } | { button: St.Button };

const DIRECTIONS = new Map<number, Direction>([
  [Clutter.KEY_Left, [-1, 0]], [Clutter.KEY_Right, [1, 0]], [Clutter.KEY_Up, [0, -1]], [Clutter.KEY_Down, [0, 1]],
]);

/** Arranging with the keyboard: Tab walks through islands, their elements and the buttons, and the arrow keys move what's picked. */
export class EditorKeys {
  private picked: Item | null = null;

  constructor(private readonly editor: TaskbarEditor) {}

  private get islands(): readonly Island[] {
    return this.editor.panel.islandSet.islands;
  }

  private get items(): Item[] {
    return [
      ...this.islands.flatMap(island => [{ island }, ...island.elements.map(element => ({ element }))]),
      { button: this.editor.reset }, { button: this.editor.done },
    ];
  }

  focusFirst(): void {
    this.pick(this.items[0]);
  }

  focusGrip(grip: Grip): void {
    this.pick('island' in grip ? { island: grip.island } : { element: grip.element });
  }

  /** Rings the picked item again once the taskbar has moved it. */
  refocus(): void {
    if (this.picked) this.pick(this.picked);
  }

  press(event: Clutter.Event): boolean {
    const key = event.get_key_symbol();
    if (key === Clutter.KEY_Escape) {
      this.editor.cancel();
      return Clutter.EVENT_STOP;
    }
    if (key === Clutter.KEY_Return || key === Clutter.KEY_KP_Enter) {
      if (this.picked && 'button' in this.picked) return Clutter.EVENT_PROPAGATE;
      this.editor.finish();
      return Clutter.EVENT_STOP;
    }
    if (key === Clutter.KEY_Tab || key === Clutter.KEY_ISO_Left_Tab) {
      const backwards = key === Clutter.KEY_ISO_Left_Tab || (event.get_state() & Clutter.ModifierType.SHIFT_MASK) !== 0;
      this.step(backwards ? -1 : 1);
      return Clutter.EVENT_STOP;
    }
    const direction = DIRECTIONS.get(key);
    if (!direction || !this.picked || 'button' in this.picked) return Clutter.EVENT_PROPAGATE;
    if ('island' in this.picked) this.moveIsland(this.picked.island, direction);
    else this.moveElement(this.picked.element, direction);
    return Clutter.EVENT_STOP;
  }

  private step(by: number): void {
    const items = this.items;
    const index = items.findIndex(item => this.same(item, this.picked));
    this.pick(items[(index + by + items.length) % items.length]);
  }

  private same(item: Item, other: Item | null): boolean {
    if (!other) return false;
    if ('island' in item && 'island' in other) return item.island === other.island;
    if ('element' in item && 'element' in other) return item.element === other.element;
    return 'button' in item && 'button' in other && item.button === other.button;
  }

  private pick(item: Item): void {
    const island = 'island' in item ? this.islands.find(shown => shown === item.island) ?? null : null;
    this.picked = 'island' in item && !island ? { island: this.islands[0] } : item;
    const { handles, panel, layer } = this.editor;
    if ('button' in this.picked) {
      handles.focus(null, 0);
      this.picked.button.grab_key_focus();
      return;
    }
    layer.grab_key_focus();
    const { elements } = panel;
    const named = 'island' in this.picked ? this.picked.island.elements : [this.picked.element];
    layer.accessible_name = named.map(id => elements.label(id)).join(', ');
    if ('island' in this.picked) handles.focus(this.picked.island.actor, panel.screen.metrics.radius);
    else handles.focus(panel.elements.actor(this.picked.element), ELEMENT_RADIUS);
  }

  private moveIsland(island: Island, direction: Direction): void {
    const { editor } = this;
    editor.preview(stepIsland(editor.draft, island.spot, direction, editor.targets.targets, editor.joined));
    this.refocus();
  }

  private moveElement(element: string, direction: Direction): void {
    const { editor } = this;
    editor.preview(stepElement(editor.draft, element, direction, editor.targets.targets, editor.joined, rightToLeft()));
    this.refocus();
  }
}
