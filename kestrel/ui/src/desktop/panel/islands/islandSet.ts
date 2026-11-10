import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { edgeOf, type Arrangement, type Spot } from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';
import { isVertical, type Edge } from '../../../shared/layout/edge.js';
import { taskbarShapesChanged } from './shapes.js';

export interface Island {
  spot: Spot;
  edge: Edge;
  readonly actor: St.Bin;
  readonly box: St.BoxLayout;
  elements: string[];
}

export interface PanelElements {
  actor(id: string): Clutter.Actor | null;
  orient(id: string, edge: Edge): void;
}

export class IslandSet {
  private shown: Island[] = [];

  constructor(private readonly panel: St.Widget, private readonly elements: PanelElements,
    private readonly changed: (islands: Island[]) => void) {}

  get islands(): readonly Island[] {
    return this.shown;
  }

  islandOf(element: string): Island | null {
    return this.shown.find(island => island.elements.includes(element)) ?? null;
  }

  containing(actor: Clutter.Actor): Island | null {
    return this.shown.find(island => island.actor.contains(actor)) ?? null;
  }

  sync(arrangement: Arrangement, below: Clutter.Actor): void {
    const present = arrangement
      .map(({ spot, elements }) => ({ spot, elements: elements.filter(id => this.elements.actor(id)) }))
      .filter(({ elements }) => elements.length);
    const unused = [...this.shown];
    const islands = present.map(({ spot, elements }) => {
      const kept = this.closest(unused, spot, elements);
      if (kept) unused.splice(unused.indexOf(kept), 1);
      const island = kept ?? this.create(spot, below);
      this.move(island, spot);
      island.elements = elements;
      return island;
    });
    for (const island of islands) this.fill(island);
    for (const island of unused) {
      island.box.remove_all_children();
      island.actor.destroy();
    }
    this.shown = islands;
    this.changed(islands);
  }

  private closest(islands: Island[], spot: Spot, elements: string[]): Island | null {
    const score = (island: Island) => 2 * island.elements.filter(id => elements.includes(id)).length + (island.spot === spot ? 1 : 0);
    return islands.reduce<Island | null>((chosen, island) => score(island) > (chosen ? score(chosen) : 0) ? island : chosen, null);
  }

  private move(island: Island, spot: Spot): void {
    island.spot = spot;
    island.edge = edgeOf(spot);
    island.box.orientation = isVertical(island.edge) ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL;
    island.actor.name = `kestrel-island-${spot}`;
  }

  private create(spot: Spot, below: Clutter.Actor): Island {
    const box = new St.BoxLayout({ style_class: 'kestrel-taskbar', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
    const actor = new St.Bin({ child: box });
    actor.connect('notify::allocation', taskbarShapesChanged);
    this.panel.insert_child_below(actor, below);
    return { spot, edge: edgeOf(spot), actor, box, elements: [] };
  }

  private fill(island: Island): void {
    const actors = island.elements.map(id => this.elements.actor(id)!);
    for (const child of island.box.get_children()) if (!actors.includes(child)) island.box.remove_child(child);
    island.elements.forEach((id, index) => {
      const actor = actors[index];
      const parent = actor.get_parent();
      if (parent !== island.box) {
        parent?.remove_child(actor);
        island.box.insert_child_at_index(actor, index);
      } else if (island.box.get_child_at_index(index) !== actor) island.box.set_child_at_index(actor, index);
      this.elements.orient(id, island.edge);
    });
  }
}
