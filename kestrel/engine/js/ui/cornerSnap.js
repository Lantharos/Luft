import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import * as KestrelUi from './kestrelUi.js';
import * as Main from './main.js';

const CORNER_REACH = 96;
const EDGE_REACH = 4;
const POINTER_MOVE_OPS = [Meta.GrabOp.MOVING, Meta.GrabOp.MOVING_UNCONSTRAINED];

/**
 * @param {number} x
 * @param {number} y
 * @param {{x: number, y: number, width: number, height: number}} monitor
 * @param {Mtk.Rectangle} area
 * @returns {Mtk.Rectangle | null}
 */
function cornerAt(x, y, monitor, area) {
    const atLeft = x <= monitor.x + EDGE_REACH;
    const atRight = x >= monitor.x + monitor.width - 1 - EDGE_REACH;
    const atTop = y <= monitor.y + EDGE_REACH;
    const nearTop = y < area.y + CORNER_REACH;
    const nearBottom = y > area.y + area.height - CORNER_REACH;
    const nearLeft = x < area.x + CORNER_REACH;
    const nearRight = x > area.x + area.width - CORNER_REACH;

    let column, row;
    if ((atLeft && nearTop) || (atTop && nearLeft))
        [column, row] = [0, 0];
    else if ((atRight && nearTop) || (atTop && nearRight))
        [column, row] = [1, 0];
    else if (atLeft && nearBottom)
        [column, row] = [0, 1];
    else if (atRight && nearBottom)
        [column, row] = [1, 1];
    else
        return null;

    const width = Math.floor(area.width / 2);
    const height = Math.floor(area.height / 2);
    return new Mtk.Rectangle({
        x: area.x + column * width,
        y: area.y + row * height,
        width: column ? area.width - width : width,
        height: row ? area.height - height : height,
    });
}

/**
 * @param {Mtk.Rectangle} rect
 * @param {Mtk.Rectangle} area
 * @returns {Meta.Direction} the edges of the work area that the rectangle lies against
 */
function edgesAgainst(rect, area) {
    let edges = 0;
    if (rect.x === area.x)
        edges |= Meta.Direction.LEFT;
    if (rect.y === area.y)
        edges |= Meta.Direction.TOP;
    if (rect.x + rect.width === area.x + area.width)
        edges |= Meta.Direction.RIGHT;
    if (rect.y + rect.height === area.y + area.height)
        edges |= Meta.Direction.BOTTOM;
    return edges;
}

export class CornerSnap {
    /**
     * @param {(window: Meta.Window, rect: Mtk.Rectangle | null, monitorIndex: number) => void} preview
     * @param {(window: Meta.Window) => void} morph animates the window from where it is to where it is moved next
     */
    constructor(preview, morph) {
        this._preview = preview;
        this._morph = morph;
        this._window = null;
        this._zone = null;
        this._motionFilter = 0;
        this._snapped = new WeakMap();

        global.display.connect('grab-op-begin', (_display, window, op) => this._begin(window, op));
        global.display.connect('grab-op-end', (_display, window) => this._end(window));
    }

    get active() {
        return this._zone !== null;
    }

    /**
     * @param {Meta.Window} window
     * @param {Mtk.Rectangle} rect
     * @param {{width: number, height: number}} size the size to restore when the window is dragged out
     */
    snap(window, rect, size = window.get_frame_rect()) {
        const restore = this._snapped.get(window) ?? {width: size.width, height: size.height};
        this._morph(window);
        const monitorIndex = global.display.get_monitor_index_for_rect(rect);
        window.set_tiled_edges(edgesAgainst(rect, Main.layoutManager.getWorkAreaForMonitor(monitorIndex)));
        if (window.maximized_horizontally || window.maximized_vertically)
            window.unmaximize();
        window.move_resize_frame(true, rect.x, rect.y, rect.width, rect.height);
        this._snapped.set(window, {...restore, rect});
    }

    /**
     * @param {Meta.Window} window
     * @returns {Meta.Window[]} windows arranged alongside it on its workspace and monitor, most recent first
     */
    group(window) {
        const workspace = window.get_workspace();
        const monitor = window.get_monitor();
        const arranged = candidate => candidate.get_workspace() === workspace &&
            candidate.get_monitor() === monitor &&
            ((candidate.get_tiled_edges() && this._snapped.get(candidate)?.rect?.equal(candidate.get_frame_rect())) ||
             (candidate.maximized_vertically && !candidate.maximized_horizontally));
        if (!arranged(window))
            return [];

        const members = [window];
        for (const candidate of global.display.get_tab_list(Meta.TabList.NORMAL, workspace)) {
            const frame = candidate.get_frame_rect();
            if (!members.includes(candidate) && arranged(candidate) &&
                !members.some(member => member.get_frame_rect().overlap(frame)))
                members.push(candidate);
        }
        return members.slice(1);
    }

    _begin(window, op) {
        if (!window || window.unconstrained || !KestrelUi.snappingAllowed())
            return;
        if (op === Meta.GrabOp.KEYBOARD_MOVING)
            this._release(window);
        if (!POINTER_MOVE_OPS.includes(op))
            return;

        this._restore(window);
        this._window = window;
        const {width, height} = window.get_frame_rect();
        this._startSize = {width, height};
        this._motionFilter = Clutter.Event.prepend_filter(null, event => {
            if (event.type() === Clutter.EventType.MOTION)
                this._track(...event.get_coords().map(Math.floor));
            return Clutter.EVENT_PROPAGATE;
        });
    }

    /**
     * Lets a snapped window float again where it is.
     *
     * @param {Meta.Window} window
     * @returns {{width: number, height: number, rect: Mtk.Rectangle} | undefined} how it was snapped
     */
    _release(window) {
        const snapped = this._snapped.get(window);
        this._snapped.delete(window);
        window.set_tiled_edges(0);
        return snapped;
    }

    _restore(window) {
        const snapped = this._release(window);
        if (!snapped)
            return;

        const frame = window.get_frame_rect();
        if (!snapped.rect?.equal(frame))
            return;

        const [pointerX] = global.get_pointer();
        const x = Math.round(pointerX - (pointerX - frame.x) * snapped.width / frame.width);
        window.move_resize_frame(true, x, frame.y, snapped.width, snapped.height);
    }

    _track(x, y) {
        const monitorIndex = global.display.get_monitor_index_for_rect(new Mtk.Rectangle({x, y, width: 1, height: 1}));
        const monitor = Main.layoutManager.monitors[monitorIndex];
        const zone = monitor
            ? cornerAt(x, y, monitor, Main.layoutManager.getWorkAreaForMonitor(monitorIndex))
            : null;

        if (zone === this._zone || (zone && this._zone?.equal(zone)))
            return;
        this._zone = zone;
        this._preview(this._window, zone, monitorIndex);
    }

    _end(window) {
        if (window !== this._window)
            return;

        Clutter.Event.remove_filter(this._motionFilter);
        this._motionFilter = 0;
        const zone = this._zone;
        this._zone = null;
        this._window = null;
        if (!zone)
            return;

        this._preview(window, null, -1);
        const size = this._startSize;
        GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.snap(window, zone, size));
    }
}
