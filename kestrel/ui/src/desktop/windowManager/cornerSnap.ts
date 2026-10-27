import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import type { Monitor } from '../../core/stage/layout.js';
import { setEdgesTiled } from '../windows/frames.js';

const CORNER_REACH = 96;
const EDGE_REACH = 4;
const POINTER_MOVE_OPS = [Meta.GrabOp.MOVING, Meta.GrabOp.MOVING_UNCONSTRAINED];

interface Size {
  width: number;
  height: number;
}

interface Snapped extends Size {
  rect: Mtk.Rectangle;
}

export type CornerPreview = (window: Meta.Window, rect: Mtk.Rectangle | null, monitorIndex: number) => void;

function cornerAt(x: number, y: number, monitor: Monitor, area: Mtk.Rectangle): Mtk.Rectangle | null {
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

function edgesAgainst(rect: Mtk.Rectangle, area: Mtk.Rectangle): Meta.Direction {
  let edges = 0;
  if (rect.x === area.x) edges |= Meta.Direction.LEFT;
  if (rect.y === area.y) edges |= Meta.Direction.TOP;
  if (rect.x + rect.width === area.x + area.width) edges |= Meta.Direction.RIGHT;
  if (rect.y + rect.height === area.y + area.height) edges |= Meta.Direction.BOTTOM;
  return edges;
}

export class CornerSnap {
  private window: Meta.Window | null = null;
  private zone: Mtk.Rectangle | null = null;
  private motionFilter = 0;
  private startSize: Size = { width: 0, height: 0 };
  private readonly snapped = new WeakMap<Meta.Window, Snapped>();

  constructor(private readonly preview: CornerPreview, private readonly morph: (window: Meta.Window) => void) {
    global.display.connect('grab-op-begin', (_display, window, op) => this.begin(window, op));
    global.display.connect('grab-op-end', (_display, window) => this.end(window));
  }

  get active(): boolean {
    return this.zone !== null;
  }

  snap(window: Meta.Window, rect: Mtk.Rectangle, size: Size = window.get_frame_rect()): void {
    const restore = this.snapped.get(window) ?? { width: size.width, height: size.height };
    this.morph(window);
    const monitorIndex = global.display.get_monitor_index_for_rect(rect);
    window.set_tiled_edges(edgesAgainst(rect, Main.layoutManager.getWorkAreaForMonitor(monitorIndex)));
    if (window.maximized_horizontally || window.maximized_vertically) window.unmaximize();
    window.move_resize_frame(true, rect.x, rect.y, rect.width, rect.height);
    this.snapped.set(window, { width: restore.width, height: restore.height, rect });
  }

  group(window: Meta.Window): Meta.Window[] {
    const workspace = window.get_workspace();
    const monitor = window.get_monitor();
    const arranged = (candidate: Meta.Window) => candidate.get_workspace() === workspace &&
      candidate.get_monitor() === monitor &&
      ((candidate.get_tiled_edges() && this.snapped.get(candidate)?.rect.equal(candidate.get_frame_rect())) ||
       (candidate.maximized_vertically && !candidate.maximized_horizontally));
    if (!arranged(window)) return [];

    const members = [window];
    for (const candidate of global.display.get_tab_list(Meta.TabList.NORMAL, workspace)) {
      const frame = candidate.get_frame_rect();
      if (!members.includes(candidate) && arranged(candidate) &&
        !members.some(member => member.get_frame_rect().overlap(frame)))
        members.push(candidate);
    }
    return members.slice(1);
  }

  private begin(window: Meta.Window | null, op: Meta.GrabOp): void {
    if (!window || window.unconstrained || !KestrelUi.snappingAllowed()) return;
    if (op === Meta.GrabOp.KEYBOARD_MOVING) this.release(window);
    if (!POINTER_MOVE_OPS.includes(op)) return;

    this.restore(window);
    this.window = window;
    const { width, height } = window.get_frame_rect();
    this.startSize = { width, height };
    this.motionFilter = Clutter.Event.prepend_filter(null, event => {
      if (event.type() === Clutter.EventType.MOTION) {
        const [x, y] = event.get_coords();
        this.track(Math.floor(x), Math.floor(y));
      }
      return Clutter.EVENT_PROPAGATE;
    });
  }

  private release(window: Meta.Window): Snapped | undefined {
    const snapped = this.snapped.get(window);
    this.snapped.delete(window);
    setEdgesTiled(window, false);
    return snapped;
  }

  private restore(window: Meta.Window): void {
    const snapped = this.release(window);
    if (!snapped) return;

    const frame = window.get_frame_rect();
    if (!snapped.rect.equal(frame)) return;

    const [pointerX] = global.get_pointer();
    const x = Math.round(pointerX - (pointerX - frame.x) * snapped.width / frame.width);
    window.move_resize_frame(true, x, frame.y, snapped.width, snapped.height);
  }

  private track(x: number, y: number): void {
    const monitorIndex = global.display.get_monitor_index_for_rect(new Mtk.Rectangle({ x, y, width: 1, height: 1 }));
    const monitor = Main.layoutManager.monitors[monitorIndex];
    const zone = monitor
      ? cornerAt(x, y, monitor, Main.layoutManager.getWorkAreaForMonitor(monitorIndex))
      : null;

    if (zone === this.zone || (zone && this.zone?.equal(zone))) return;
    this.zone = zone;
    this.preview(this.window!, zone, monitorIndex);
  }

  private end(window: Meta.Window | null): void {
    if (!window || window !== this.window) return;

    Clutter.Event.remove_filter(this.motionFilter);
    this.motionFilter = 0;
    const zone = this.zone;
    this.zone = null;
    this.window = null;
    if (!zone) return;

    this.preview(window, null, -1);
    const size = this.startSize;
    GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.snap(window, zone, size));
  }
}
