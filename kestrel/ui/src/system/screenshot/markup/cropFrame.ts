import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { clamp } from '../../../shared/math.js';
import { EAST_EDGES, type Geometry, NORTH_EDGES, SOUTH_EDGES, WEST_EDGES, cursorTypeAt } from '../selection/areaCursor.js';
import { UIAreaIndicator } from '../selection/areaIndicator.js';

const SMALLEST = 16;

const handle = () => new St.Widget({ style_class: 'screenshot-ui-area-selector-handle' });

/** The part of the shot that's kept, dragged by its corners and edges, or moved as a whole. */
export class CropFrame extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private readonly shade = new UIAreaIndicator();
  private readonly handles = [handle(), handle(), handle(), handle()];
  private area: Geometry = [0, 0, 1, 1];
  private handleSize = 0;
  private grab: Clutter.Grab | null = null;
  private dragging = Clutter.CursorType.INHERIT;
  private start: { x: number; y: number; area: Geometry } | null = null;

  constructor(private readonly cropped: (before: Geometry) => void) {
    super({ style_class: 'screenshot-ui-area-selector', reactive: true });
    this.shade.add_constraint(new Clutter.BindConstraint({ source: this, coordinate: Clutter.BindCoordinate.SIZE }));
    this.add_child(this.shade);
    for (const corner of this.handles) this.add_child(corner);
    this.handles[0].connect('style-changed', widget => {
      this.handleSize = widget.get_theme_node().get_width();
      this.sync();
    });
    this.connect('event', (_actor, event: Clutter.Event) => this.onEvent(event));
  }

  get crop(): Geometry {
    return this.area;
  }

  set crop(area: Geometry) {
    this.area = area;
    this.sync();
  }

  set editing(editing: boolean) {
    this.reactive = editing;
    for (const corner of this.handles) corner.visible = editing;
  }

  private sync(): void {
    const [x, y, width, height] = this.area;
    this.shade.setSelectionRect(x, y, width, height);
    const offset = this.handleSize / 2;
    const corners = [[x, y], [x + width, y], [x, y + height], [x + width, y + height]];
    this.handles.forEach((corner, i) => corner.set_position(corners[i][0] - offset, corners[i][1] - offset));
  }

  private local(event: Clutter.Event): [number, number] {
    const [stageX, stageY] = event.get_coords();
    const [, x, y] = this.transform_stage_point(stageX, stageY);
    return [x, y];
  }

  private onEvent(event: Clutter.Event): boolean {
    const type = event.type();
    if (type === Clutter.EventType.BUTTON_PRESS || type === Clutter.EventType.TOUCH_BEGIN) {
      const [x, y] = this.local(event);
      const cursor = cursorTypeAt(this.area, this.handleSize * 2, x, y);
      if (cursor === Clutter.CursorType.CROSSHAIR) return Clutter.EVENT_PROPAGATE;
      this.dragging = cursor;
      this.start = { x, y, area: this.area };
      this.grab = global.stage.grab(this);
      return Clutter.EVENT_STOP;
    }
    if (type === Clutter.EventType.MOTION && !this.start) {
      const [x, y] = this.local(event);
      this.set_cursor_type(cursorTypeAt(this.area, this.handleSize * 2, x, y));
      return Clutter.EVENT_PROPAGATE;
    }
    if (!this.start) return Clutter.EVENT_PROPAGATE;
    if (type === Clutter.EventType.MOTION || type === Clutter.EventType.TOUCH_UPDATE) {
      const [x, y] = this.local(event);
      this.drag(x - this.start.x, y - this.start.y);
    } else if (type === Clutter.EventType.BUTTON_RELEASE || type === Clutter.EventType.TOUCH_END) {
      const before = this.start.area;
      this.grab?.dismiss();
      this.grab = null;
      this.start = null;
      if (before.some((value, i) => value !== this.area[i])) this.cropped(before);
    } else {
      return Clutter.EVENT_PROPAGATE;
    }
    return Clutter.EVENT_STOP;
  }

  private drag(dx: number, dy: number): void {
    const [x, y, width, height] = this.start!.area;
    let [left, top, right, bottom] = [x, y, x + width, y + height];
    if (this.dragging === Clutter.CursorType.MOVE) {
      const moveX = clamp(dx, -left, this.width - right);
      const moveY = clamp(dy, -top, this.height - bottom);
      this.crop = [left + moveX, top + moveY, width, height];
      return;
    }
    if (WEST_EDGES.includes(this.dragging)) left = clamp(left + dx, 0, right - SMALLEST);
    if (EAST_EDGES.includes(this.dragging)) right = clamp(right + dx, left + SMALLEST, this.width);
    if (NORTH_EDGES.includes(this.dragging)) top = clamp(top + dy, 0, bottom - SMALLEST);
    if (SOUTH_EDGES.includes(this.dragging)) bottom = clamp(bottom + dy, top + SMALLEST, this.height);
    this.crop = [left, top, right - left, bottom - top];
  }
}
