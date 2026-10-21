import Clutter from 'gi://Clutter';
import Mtk from 'gi://Mtk';

const EDGE = 48;

/**
 * @param {Clutter.Actor} cell
 * @param {Clutter.Actor} parent
 * @param {Clutter.Orientation} orientation
 * @param {number} span the cell's index across the slices: 0 start, 1 middle, 2 end
 * @param {number} edge the fixed size of the start and end slices
 */
function place(cell, parent, orientation, span, edge) {
    const horizontal = orientation === Clutter.Orientation.HORIZONTAL;
    const coordinate = horizontal ? Clutter.BindCoordinate.WIDTH : Clutter.BindCoordinate.HEIGHT;
    const axis = horizontal ? Clutter.AlignAxis.X_AXIS : Clutter.AlignAxis.Y_AXIS;
    if (span === 1) {
        cell[horizontal ? 'x' : 'y'] = edge;
        cell.add_constraint(new Clutter.BindConstraint({source: parent, coordinate, offset: -2 * edge}));
        return;
    }
    cell[horizontal ? 'width' : 'height'] = edge;
    if (span === 2)
        cell.add_constraint(new Clutter.AlignConstraint({source: parent, align_axis: axis, factor: 1}));
}

/**
 * A still picture of a window that stretches only between its edges, so
 * corners and title bar ends keep their shape while it changes size.
 */
export class WindowSnapshot {
    /**
     * @param {Clutter.TextureContent} content the window painted at `rect`
     * @param {{x: number, y: number, width: number, height: number}} rect
     */
    constructor(content, rect) {
        this.actor = new Clutter.Actor({
            x: rect.x, y: rect.y, width: rect.width, height: rect.height,
            offscreen_redirect: 0,
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
                const cell = new Clutter.Actor({content: Clutter.TextureContent.new_from_texture(texture, clip)});
                place(cell, this.actor, Clutter.Orientation.HORIZONTAL, column, edgeX);
                place(cell, this.actor, Clutter.Orientation.VERTICAL, row, edgeY);
                this.actor.add_child(cell);
            }
        }
    }

    get rect() {
        const {x, y, width, height} = this.actor;
        return {x, y, width, height};
    }

    destroy() {
        this.actor.destroy();
    }
}
