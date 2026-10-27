import Clutter from 'gi://Clutter';
import Mtk from 'gi://Mtk';

const EDGE = 48;

const MIDDLE = 1;
const END = 2;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function place(cell: Clutter.Actor, parent: Clutter.Actor, orientation: Clutter.Orientation, span: number, edge: number): void {
  const horizontal = orientation === Clutter.Orientation.HORIZONTAL;
  const coordinate = horizontal ? Clutter.BindCoordinate.WIDTH : Clutter.BindCoordinate.HEIGHT;
  const axis = horizontal ? Clutter.AlignAxis.X_AXIS : Clutter.AlignAxis.Y_AXIS;
  if (span === MIDDLE) {
    cell[horizontal ? 'x' : 'y'] = edge;
    cell.add_constraint(new Clutter.BindConstraint({ source: parent, coordinate, offset: -2 * edge }));
    return;
  }
  cell[horizontal ? 'width' : 'height'] = edge;
  if (span === END)
    cell.add_constraint(new Clutter.AlignConstraint({ source: parent, align_axis: axis, factor: 1 }));
}

export class WindowSnapshot {
  readonly actor: Clutter.Actor;

  constructor(content: Clutter.TextureContent, rect: Rect) {
    this.actor = new Clutter.Actor({
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      offscreen_redirect: 0 as Clutter.OffscreenRedirect,
    });
    const texture = content.get_texture();
    const scaleX = texture.get_width() / rect.width;
    const scaleY = texture.get_height() / rect.height;
    const edgeX = Math.floor(Math.min(EDGE, rect.width / 3));
    const edgeY = Math.floor(Math.min(EDGE, rect.height / 3));
    const columns = [0, edgeX, rect.width - edgeX, rect.width].map(x => Math.round(x * scaleX));
    const rows = [0, edgeY, rect.height - edgeY, rect.height].map(y => Math.round(y * scaleY));
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        const clip = new Mtk.Rectangle({
          x: columns[column], y: rows[row],
          width: columns[column + 1] - columns[column], height: rows[row + 1] - rows[row],
        });
        const cell = new Clutter.Actor({ content: Clutter.TextureContent.new_from_texture(texture, clip) });
        place(cell, this.actor, Clutter.Orientation.HORIZONTAL, column, edgeX);
        place(cell, this.actor, Clutter.Orientation.VERTICAL, row, edgeY);
        this.actor.add_child(cell);
      }
    }
  }

  get rect(): Rect {
    const { x, y, width, height } = this.actor;
    return { x, y, width, height };
  }

  destroy(): void {
    this.actor.destroy();
  }
}
