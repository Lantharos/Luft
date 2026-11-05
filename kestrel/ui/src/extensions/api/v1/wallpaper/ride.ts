import type Clutter from 'gi://Clutter';
import type GObject from 'gi://GObject';
import type Meta from 'gi://Meta';

type Connection = [GObject.Object, number];

const WINDOW_MOVES = ['position-changed', 'size-changed'] as const;
const LIVE_TRANSFORM = ['notify::translation-x', 'notify::translation-y', 'notify::scale-x', 'notify::scale-y'] as const;
const PICTURE_MOVES = ['notify::x', 'notify::y'] as const;

/**
 * Keeps a sprite right in front of the window it stands on. Everything here runs as the window changes, before the
 * frame that shows it, and the sprite keeps one distance from the window's corner, so the two never part by a pixel.
 */
export class WindowRide {
  private readonly actor: Meta.WindowActor;
  private readonly connections: Connection[] = [];
  private pictureConnections: Connection[] = [];
  private picture: Clutter.Actor | null = null;
  private offsetX = 0;
  private offsetY = 0;

  constructor(readonly window: Meta.Window, private readonly sprite: Clutter.Actor, private readonly pictureOf: (actor: Meta.WindowActor) => Clutter.Actor | null) {
    this.actor = window.get_compositor_private() as Meta.WindowActor;
    const sync = () => this.sync();
    this.connections.push(
      ...WINDOW_MOVES.map((signal): Connection => [window, window.connect(signal, sync)]),
      ...LIVE_TRANSFORM.map((signal): Connection => [this.actor, this.actor.connect(signal, sync)]),
      [this.actor, this.actor.connect('notify::opacity', () => this.followPicture())],
      [this.actor, this.actor.connect('destroy', () => this.stop())],
      [global.display, global.display.connect('restacked', () => this.stack())],
    );
    this.stack();
    this.followPicture();
  }

  /** Puts the sprite's top left corner this far from the corner of the window's frame, on a screen pixel. */
  place(x: number, y: number, scale: number): void {
    const { x: left, y: top } = this.window.get_frame_rect();
    const snapped = (position: number, from: number) => Math.round((from + position) * scale) / scale - from;
    this.offsetX = snapped(x, left);
    this.offsetY = snapped(y, top);
    this.sync();
  }

  /** Mutter lowers windows past everything else in the window group when it restacks them, so this runs after every restack. */
  private stack(): void {
    const group = global.window_group;
    if (this.sprite.get_parent() !== group) {
      this.sprite.get_parent()?.remove_child(this.sprite);
      group.add_child(this.sprite);
    }
    group.set_child_above_sibling(this.sprite, this.actor);
  }

  /** While a window changes size a picture of it stands in and moves, and the window itself is hidden. */
  private followPicture(): void {
    const picture = this.pictureOf(this.actor);
    if (picture === this.picture) return;
    this.stopFollowingPicture();
    this.picture = picture;
    if (picture) this.pictureConnections = PICTURE_MOVES.map((signal): Connection => [picture, picture.connect(signal, () => this.sync())]);
    this.sync();
  }

  private stopFollowingPicture(): void {
    for (const [object, id] of this.pictureConnections.splice(0)) object.disconnect(id);
    this.picture = null;
  }

  private shownCorner(): [number, number] {
    if (this.picture) return [this.picture.x, this.picture.y];
    const frame = this.window.get_frame_rect();
    const buffer = this.window.get_buffer_rect();
    const { translation_x: moveX, translation_y: moveY, scale_x: scaleX, scale_y: scaleY } = this.actor;
    return [buffer.x + moveX + (frame.x - buffer.x) * scaleX, buffer.y + moveY + (frame.y - buffer.y) * scaleY];
  }

  private sync(): void {
    const [x, y] = this.shownCorner();
    this.sprite.set_position(x + this.offsetX, y + this.offsetY);
  }

  stop(): void {
    this.stopFollowingPicture();
    for (const [object, id] of this.connections.splice(0)) object.disconnect(id);
  }
}
