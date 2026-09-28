import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { animateActor } from '../../shared/motion.js';
import type { ControlMenu } from '../quickControls.js';

const GAP = 8;
const MOVE = { duration: 280, mode: Clutter.AnimationMode.EASE_OUT_CUBIC };
const REVEAL_DELAY = 170;
const HIDE_DURATION = 90;

interface Slot { x: number; y: number; width: number; height: number }

function naturalHeight(tile: St.Widget, width: number): number {
  const theme = tile.get_theme_node();
  const [min, natural] = tile.get_first_child()!.get_preferred_height(theme.adjust_for_width(width));
  return theme.adjust_preferred_height(min, natural)[1];
}

export interface GridEvents {
  resized(): void;
  menuOpened(menu: ControlMenu): void;
  menuClosed(menu: ControlMenu): void;
}

export class TileGrid {
  readonly actor = new St.Widget({ clip_to_allocation: true, x_expand: true });
  private tiles: St.Widget[] = [];
  private readonly menus = new Map<St.Widget, ControlMenu>();
  private readonly placed = new Set<Clutter.Actor>();
  private slots = new Map<St.Widget, Slot>();
  private expanded: St.Widget | null = null;
  private held: St.Widget | null = null;
  private instant = false;
  private width = 0;
  private rowHeight = 0;

  constructor(private readonly events: GridEvents) {
    this.actor.connect('notify::height', () => events.resized());
  }

  get order(): St.Widget[] {
    return this.tiles;
  }

  get openMenu(): ControlMenu | null {
    return this.expanded ? this.menus.get(this.expanded)! : null;
  }

  setTiles(tiles: St.Widget[], animate: boolean): void {
    for (const tile of this.tiles.filter(tile => !tiles.includes(tile))) {
      if (tile === this.expanded) this.collapse(false);
      this.actor.remove_child(tile);
      this.placed.delete(tile);
    }
    for (const tile of tiles.filter(tile => !this.tiles.includes(tile))) this.actor.add_child(tile);
    this.tiles = tiles;
    this.layout(animate);
  }

  addMenu(tile: St.Widget, menu: ControlMenu): void {
    menu.hosted = true;
    menu.actor.add_style_class_name('kestrel-tile-menu');
    menu.actor.height = -1;
    menu.actor.hide();
    this.menus.set(tile, menu);
    this.actor.add_child(menu.actor);
    menu.actor.connect('notify::height', () => {
      if (this.expanded === tile) this.layout(true);
    });
    menu.connect('open-state-changed', (_menu, open) => open ? this.expand(tile, menu) : this.collapsed(tile, menu));
  }

  collapse(animate: boolean): void {
    this.instant = !animate;
    this.openMenu?.close({ animate });
    this.instant = false;
  }

  setWidth(width: number): void {
    const rowHeight = this.measureRow(width);
    if (width === this.width && rowHeight === this.rowHeight) return;
    this.width = width;
    this.layout(false);
  }

  refresh(): void {
    this.layout(true);
  }

  hold(tile: St.Widget): void {
    this.collapse(true);
    this.held = tile;
    this.actor.set_child_above_sibling(tile, null);
  }

  dragTo(tile: St.Widget, x: number, y: number): void {
    const target = [...this.slots].find(([other, slot]) =>
      other !== tile && x >= slot.x && x < slot.x + slot.width && y >= slot.y && y < slot.y + slot.height)?.[0];
    if (!target) return;
    const tiles = this.tiles.filter(other => other !== tile);
    tiles.splice(this.tiles.indexOf(target), 0, tile);
    this.tiles = tiles;
    this.layout(true);
  }

  release(): void {
    this.held = null;
    this.layout(true);
  }

  private expand(tile: St.Widget, menu: ControlMenu): void {
    const previous = this.openMenu;
    if (previous && previous !== menu) previous.close({ animate: true });
    this.expanded = tile;
    menu.actor.remove_all_transitions();
    menu.actor.opacity = 0;
    menu.actor.show();
    this.layout(true);
    animateActor(menu.actor, { opacity: 255, delay: REVEAL_DELAY, duration: 180, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    this.events.menuOpened(menu);
  }

  private collapsed(tile: St.Widget, menu: ControlMenu): void {
    if (this.expanded === tile) this.expanded = null;
    menu.actor.remove_all_transitions();
    if (this.instant) menu.actor.hide();
    else animateActor(menu.actor, { opacity: 0, duration: HIDE_DURATION, onStopped: () => { if (!menu.isOpen) menu.actor.hide(); } });
    this.layout(!this.instant, HIDE_DURATION / 2);
    this.events.menuClosed(menu);
  }

  private measureRow(width: number): number {
    const half = Math.floor((width - GAP) / 2);
    return Math.max(0, ...this.tiles.filter(tile => tile.visible).map(tile => naturalHeight(tile, half)));
  }

  private layout(animate: boolean, delay = 0): void {
    if (!this.width) return;
    const full = this.width;
    const half = Math.floor((full - GAP) / 2);
    const visible = this.tiles.filter(tile => tile.visible);
    const height = this.rowHeight = this.measureRow(full);
    const slots = new Map<St.Widget, Slot>();
    let y = 0;
    const pairUp = (tiles: St.Widget[]) => {
      for (let index = 0; index < tiles.length; index += 2) {
        const [first, second] = tiles.slice(index, index + 2);
        slots.set(first, { x: 0, y, width: second ? half : full, height });
        if (second) slots.set(second, { x: full - half, y, width: half, height });
        y += height + GAP;
      }
    };
    const expanded = this.expanded && visible.includes(this.expanded) ? this.expanded : null;
    const menu = expanded ? this.menus.get(expanded)! : null;
    let menuY = 0;
    if (expanded && menu) {
      const index = visible.indexOf(expanded);
      const rowStart = index - index % 2;
      pairUp(visible.slice(0, rowStart));
      slots.set(expanded, { x: 0, y, width: full, height });
      menuY = y + height + GAP;
      menu.actor.width = full;
      y = menuY + menu.actor.get_preferred_height(full)[1] + GAP;
      pairUp([...visible.slice(rowStart, index), ...visible.slice(index + 1)]);
    } else {
      pairUp(visible);
    }
    this.slots = slots;

    for (const [tile, slot] of slots) {
      if (tile === this.held) continue;
      if (animate && this.placed.has(tile)) {
        animateActor(tile, { ...slot, ...MOVE, delay });
      } else {
        tile.remove_all_transitions();
        tile.set_position(slot.x, slot.y);
        tile.set_size(slot.width, slot.height);
        if (animate) {
          tile.opacity = 0;
          animateActor(tile, { opacity: 255, ...MOVE });
        }
      }
      this.placed.add(tile);
    }
    for (const tile of this.tiles.filter(tile => !slots.has(tile))) this.placed.delete(tile);
    if (menu) {
      if (animate && menu.actor.visible && menu.actor.opacity > 0) animateActor(menu.actor, { y: menuY, ...MOVE });
      else menu.actor.set_position(0, menuY);
    }

    const sequence = [...slots].sort(([, a], [, b]) => a.y - b.y || a.x - b.x).map(([tile]) => tile as Clutter.Actor);
    if (expanded && menu) sequence.splice(sequence.indexOf(expanded) + 1, 0, menu.actor);
    sequence.forEach((actor, index) => this.actor.set_child_at_index(actor, index));
    if (this.held) this.actor.set_child_above_sibling(this.held, null);

    const total = Math.max(0, y - GAP);
    if (animate) {
      animateActor(this.actor, { height: total, ...MOVE, delay });
    } else {
      this.actor.remove_transition('height');
      this.actor.height = total;
    }
  }
}
