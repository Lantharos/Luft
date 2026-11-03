import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { Edge } from '../../../shared/layout/edge.js';
import { animateActor, Spring } from '../../../shared/motion/motion.js';
import type { Island } from '../islands/islandSet.js';

const HANDLE_LENGTH = 36;
const HANDLE_DEPTH = 18;
const HANDLE_GAP = 4;
const RING = 4;

type Box = { x: number; y: number; width: number; height: number };

function boxOf(actor: Clutter.Actor): Box {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return { x, y, width, height };
}

/** Where a handle sits: on the side of its island that faces the middle of the screen. */
function handleBox({ x, y, width, height }: Box, edge: Edge): Box {
  switch (edge) {
    case 'bottom': return { x: x + (width - HANDLE_LENGTH) / 2, y: y - HANDLE_GAP - HANDLE_DEPTH, width: HANDLE_LENGTH, height: HANDLE_DEPTH };
    case 'top': return { x: x + (width - HANDLE_LENGTH) / 2, y: y + height + HANDLE_GAP, width: HANDLE_LENGTH, height: HANDLE_DEPTH };
    case 'left': return { x: x + width + HANDLE_GAP, y: y + (height - HANDLE_LENGTH) / 2, width: HANDLE_DEPTH, height: HANDLE_LENGTH };
    case 'right': return { x: x - HANDLE_GAP - HANDLE_DEPTH, y: y + (height - HANDLE_LENGTH) / 2, width: HANDLE_DEPTH, height: HANDLE_LENGTH };
  }
}

interface Handle {
  island: Island;
  actor: St.Widget;
}

const MOVES = ['notify::allocation', 'notify::translation-x', 'notify::translation-y'];
const onMove = (actor: Clutter.Actor, moved: () => void, tracker: Clutter.Actor) =>
  actor.connectObject(...MOVES.flatMap(signal => [signal, moved]), tracker);

/** A grip beside each island to move it by, and a ring around what the keyboard has picked. */
export class Handles {
  private handles: Handle[] = [];
  private readonly ring = new St.Widget({ name: 'kestrel-arrange-focus', style_class: 'kestrel-arrange-focus', visible: false });
  private ringed: Clutter.Actor | null = null;
  private hovered: Handle | null = null;

  constructor(private readonly layer: St.Widget) {
    layer.add_child(this.ring);
  }

  sync(islands: readonly Island[]): void {
    const kept = new Map(this.handles.map(handle => [handle.island, handle]));
    this.handles = islands.map(island => {
      const handle = kept.get(island) ?? this.create(island);
      kept.delete(island);
      return handle;
    });
    for (const handle of kept.values()) handle.actor.destroy();
    for (const handle of this.handles) this.place(handle);
  }

  islandAt(x: number, y: number): Island | null {
    return this.handles.find(({ actor }) => {
      const box = boxOf(actor);
      return x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height;
    })?.island ?? null;
  }

  hover(island: Island | null): void {
    const handle = this.handles.find(shown => shown.island === island) ?? null;
    if (handle === this.hovered) return;
    for (const [shown, lit] of [[this.hovered, false], [handle, true]] as const) {
      if (!shown) continue;
      if (lit) shown.actor.add_style_pseudo_class('hover');
      else shown.actor.remove_style_pseudo_class('hover');
      animateActor(shown.actor, { scale_x: lit ? 1.2 : 1, scale_y: lit ? 1.2 : 1, spring: Spring.snappy });
    }
    this.hovered = handle;
  }

  /** Rings `actor`, an island or one of its elements, or nothing with `null`. */
  focus(actor: Clutter.Actor | null, radius: number): void {
    this.ringed?.disconnectObject(this.ring);
    this.ringed = actor;
    this.ring.visible = !!actor;
    if (!actor) return;
    this.ring.style = `border-radius: ${radius + RING}px;`;
    onMove(actor, () => this.placeRing(), this.ring);
    this.placeRing();
  }

  destroy(): void {
    this.focus(null, 0);
    for (const handle of this.handles) handle.actor.destroy();
    this.handles = [];
  }

  private placeRing(): void {
    const box = boxOf(this.ringed!);
    this.ring.set_position(box.x - RING, box.y - RING);
    this.ring.set_size(box.width + 2 * RING, box.height + 2 * RING);
  }

  private create(island: Island): Handle {
    const actor = new St.Widget({ style_class: 'kestrel-arrange-handle', layout_manager: new Clutter.BinLayout() });
    actor.add_child(new St.Widget({ style_class: 'kestrel-arrange-handle-grip', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER }));
    actor.set_pivot_point(0.5, 0.5);
    this.layer.insert_child_below(actor, this.ring);
    const handle: Handle = { island, actor };
    onMove(island.actor, () => this.place(handle), actor);
    return handle;
  }

  private place(handle: Handle): void {
    const box = handleBox(boxOf(handle.island.actor), handle.island.edge);
    handle.actor.name = `kestrel-arrange-handle-${handle.island.spot}`;
    handle.actor.set_position(Math.round(box.x), Math.round(box.y));
    handle.actor.set_size(box.width, box.height);
    (handle.actor.get_first_child() as St.Widget).style = handle.island.edge === 'left' || handle.island.edge === 'right'
      ? 'width: 5px; height: 26px;' : 'width: 26px; height: 5px;';
  }
}
