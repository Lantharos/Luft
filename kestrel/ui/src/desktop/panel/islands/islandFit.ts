import type Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';

import { BUILT_IN_ELEMENTS, fitAlong, type FitPart } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { isVertical } from '../../../shared/layout/edge.js';
import type { Island, PanelElements } from './islandSet.js';

const SYSTEM_RANKS: Record<string, number> = { tray: 1, clock: 2 };
const EXTENSION_RANK = 0;

export interface AppsRoom {
  readonly least: number;
  fit(room: number): void;
}

const rankOf = (id: string) => BUILT_IN_ELEMENTS.includes(id) ? SYSTEM_RANKS[id] : EXTENSION_RANK;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export class IslandFit {
  private collapsed = new Set<string>();
  private wanted = new Set<string>();
  private later = 0;
  private measured = false;

  constructor(private readonly elements: PanelElements, private readonly apps: AppsRoom) {}

  begin(): void {
    this.wanted = new Set();
    this.measured = false;
  }

  lengths(islands: readonly Island[], span: number, gap: number): number[] {
    this.measured = true;
    const fitted = fitAlong(islands.map(island => this.measure(island)), span, gap);
    for (const id of fitted.dropped) this.wanted.add(id);
    const room = fitted.room.get('dock');
    if (room !== undefined) this.apps.fit(room);
    return fitted.lengths;
  }

  finish(): void {
    const same = this.wanted.size === this.collapsed.size && [...this.wanted].every(id => this.collapsed.has(id));
    if (!this.measured || same || this.later) return;
    this.later = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.later = 0;
      this.collapse();
      return false;
    });
  }

  stop(): void {
    if (this.later) global.compositor.get_laters().remove(this.later);
    this.later = 0;
  }

  private collapse(): void {
    for (const id of this.collapsed) if (!this.wanted.has(id)) this.elements.actor(id)?.show();
    for (const id of this.wanted) this.elements.actor(id)?.hide();
    this.collapsed = this.wanted;
  }

  private measure(island: Island) {
    const vertical = isVertical(island.edge);
    const along = (actor: Clutter.Actor) => vertical ? actor.get_preferred_height(-1)[1] : actor.get_preferred_width(-1)[1];
    const present = island.elements
      .map(id => ({ id, actor: this.elements.actor(id) }))
      .filter((part): part is { id: string; actor: Clutter.Actor } => !!part.actor && (part.actor.visible || this.collapsed.has(part.id)));
    const parts: FitPart[] = present.map(({ id, actor }) => {
      const length = along(actor);
      if (id === 'dock') return { id, length, least: Math.min(length, this.apps.least) };
      return { id, length, rank: rankOf(id) };
    });
    const visible = present.filter(({ actor }) => actor.visible).map(({ actor }) => along(actor));
    const spacing = (island.box.layout_manager as Clutter.BoxLayout).spacing;
    const chrome = along(island.actor) - sum(visible) - spacing * Math.max(0, visible.length - 1);
    return { chrome, spacing, parts };
  }
}
