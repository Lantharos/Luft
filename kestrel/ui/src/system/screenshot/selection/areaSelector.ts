import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from '../../../core/main.js';
import { clamp } from '../../../shared/math.js';
import { EAST_EDGES, type Geometry, NORTH_EDGES, SOUTH_EDGES, WEST_EDGES, cursorTypeAt, orientCursor, snapPoint } from './areaCursor.js';
import { UIAreaIndicator } from './areaIndicator.js';

const isVertical = (direction: St.DirectionType) =>
  direction === St.DirectionType.UP || direction === St.DirectionType.DOWN;

const handle = () => new St.Widget({ style_class: 'screenshot-ui-area-selector-handle' });

const warpPointer = (x: number, y: number) =>
  global.stage.context.get_backend().get_default_seat().warp_pointer(x, y);

export namespace UIAreaSelector {
  export interface Signals extends St.Widget.SignalSignatures {
    'drag-started': () => void;
    'drag-ended': () => void;
  }
}

export class UIAreaSelector extends St.Widget {
  static [GObject.signals] = {
    'drag-started': {},
    'drag-ended': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, UIAreaSelector.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, UIAreaSelector.Signals>['emit'];

  private readonly areaIndicator = new UIAreaIndicator();
  private readonly topLeftHandle = handle();
  private readonly topRightHandle = handle();
  private readonly bottomLeftHandle = handle();
  private readonly bottomRightHandle = handle();
  private readonly panGesture = new Clutter.PanGesture({ begin_threshold: 0, required_button: 0 });
  private handleSize = 0;
  private startX = -1;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private currentSide = St.DirectionType.LEFT;
  private lastResizeDirection = St.DirectionType.LEFT;
  private dragGrab: Clutter.Grab | null = null;
  private dragCursor = Clutter.CursorType.INHERIT;
  private dragStartX = 0;
  private dragStartY = 0;

  constructor(params: Partial<St.Widget.ConstructorProps>) {
    super(params);

    this.areaIndicator.add_constraint(new Clutter.BindConstraint({
      source: this,
      coordinate: Clutter.BindCoordinate.ALL,
    }));
    this.add_child(this.areaIndicator);

    this.add_child(this.topLeftHandle);
    this.add_child(this.topRightHandle);
    this.add_child(this.bottomLeftHandle);
    this.add_child(this.bottomRightHandle);

    this.topLeftHandle.connect('style-changed', widget => {
      this.handleSize = widget.get_theme_node().get_width();
      this.updateSelectionRect();
    });

    this.connect('notify::mapped', () => {
      if (!this.mapped) return;
      const [x, y] = global.get_pointer();
      this.updateCursor(x, y);
    });

    this.panGesture.connect('recognize', () => this.onPanBegin());
    this.panGesture.connect('pan-update', () => this.onPanUpdate());
    this.panGesture.connect('end', () => this.onPanEnd());
    this.add_action(this.panGesture);

    const motionController = new Clutter.MotionController();
    motionController.connect('motion', (_controller, _sprite, x, y) => {
      if (!this.panGesture.get_state()) this.updateCursor(x, y);
    });
    motionController.connect('leave', () => this.set_cursor_type(Clutter.CursorType.INHERIT));
    this.add_action(motionController);

    this.reset();
  }

  reset(): void {
    this.stopDrag();
    this.set_cursor_type(Clutter.CursorType.INHERIT);

    this.currentSide = St.DirectionType.LEFT;
    this.lastResizeDirection = St.DirectionType.LEFT;

    const [x, y, w, h] = this.getGeometry();
    if (x < 0 || y < 0 || x + w > this.width || y + h > this.height) {
      this.startX = -1;
      this.startY = 0;
      this.lastX = 0;
      this.lastY = 0;

      this.resetArea();
    }
  }

  resetArea(): void {
    if (Main.layoutManager.primaryIndex !== -1) {
      const monitor = Main.layoutManager.monitors[Main.layoutManager.primaryIndex];

      this.startX = monitor.x + Math.floor(monitor.width * 3 / 8);
      this.startY = monitor.y + Math.floor(monitor.height * 3 / 8);
      this.lastX = monitor.x + Math.floor(monitor.width * 5 / 8) - 1;
      this.lastY = monitor.y + Math.floor(monitor.height * 5 / 8) - 1;
    }

    this.updateSelectionRect();
  }

  getGeometry(): Geometry {
    const leftX = Math.min(this.startX, this.lastX);
    const topY = Math.min(this.startY, this.lastY);
    const rightX = Math.max(this.startX, this.lastX);
    const bottomY = Math.max(this.startY, this.lastY);

    return [leftX, topY, rightX - leftX + 1, bottomY - topY + 1];
  }

  moveInDirection(direction: St.DirectionType, increment: number): void {
    const [, , selectionWidth, selectionHeight] = this.getGeometry();

    let newStartX = this.startX;
    let newStartY = this.startY;
    let newLastX = this.lastX;
    let newLastY = this.lastY;

    switch (direction) {
    case St.DirectionType.LEFT:
      newStartX -= increment;
      newLastX -= increment;
      break;
    case St.DirectionType.RIGHT:
      newStartX += increment;
      newLastX += increment;
      break;
    case St.DirectionType.UP:
      newStartY -= increment;
      newLastY -= increment;
      break;
    case St.DirectionType.DOWN:
      newStartY += increment;
      newLastY += increment;
      break;
    }

    if (newStartX < 0 || newLastX < 0) {
      newStartX = 0;
      newLastX = newStartX + (selectionWidth - 1);
    } else if (newLastX > this.width - 1) {
      newLastX = this.width - 1;
      newStartX = newLastX - (selectionWidth - 1);
    }

    if (newStartY < 0 || newLastY < 0) {
      newStartY = 0;
      newLastY = newStartY + (selectionHeight - 1);
    } else if (newLastY > this.height - 1) {
      newLastY = this.height - 1;
      newStartY = newLastY - (selectionHeight - 1);
    }

    this.startX = newStartX;
    this.startY = newStartY;
    this.lastX = newLastX;
    this.lastY = newLastY;

    this.updateSelectionRect();
    this.centerCursor();
  }

  resizeInDirection(direction: St.DirectionType, increment: number): void {
    if (this.maybeChangeResizeDirection(direction)) {
      this.moveCursorToSide(direction);
      return;
    }

    const delta = direction === St.DirectionType.LEFT || direction === St.DirectionType.UP ? -increment : increment;
    switch (this.currentSide) {
    case St.DirectionType.LEFT:
      this.startX += delta;
      break;
    case St.DirectionType.RIGHT:
      this.lastX += delta;
      break;
    case St.DirectionType.UP:
      this.startY += delta;
      break;
    case St.DirectionType.DOWN:
      this.lastY += delta;
      break;
    }

    this.startX = clamp(this.startX, 0, this.width - 1);
    this.lastX = clamp(this.lastX, 0, this.width - 1);
    this.startY = clamp(this.startY, 0, this.height - 1);
    this.lastY = clamp(this.lastY, 0, this.height - 1);
    this.lastResizeDirection = direction;

    this.updateSelectionRect();
    this.moveCursorToSide(this.currentSide);
  }

  stopDrag(): void {
    if (this.dragGrab) {
      this.dragGrab.dismiss();
      this.dragGrab = null;
    }

    if (this.dragCursor === Clutter.CursorType.CROSSHAIR &&
      this.lastX === this.startX && this.lastY === this.startY) {
      const offset = 20 * St.ThemeContext.get_for_stage(global.stage).scaleFactor;
      this.startX -= offset;
      this.startY -= offset;
      this.lastX += offset;
      this.lastY += offset;

      if (this.startX < 0) {
        this.lastX -= this.startX;
        this.startX = 0;
      } else if (this.lastX >= this.width) {
        this.startX -= this.lastX - this.width + 1;
        this.lastX = this.width - 1;
      }

      if (this.startY < 0) {
        this.lastY -= this.startY;
        this.startY = 0;
      } else if (this.lastY >= this.height) {
        this.startY -= this.lastY - this.height + 1;
        this.lastY = this.height - 1;
      }

      this.updateSelectionRect();
    }

    this.emit('drag-ended');
  }

  private maybeChangeResizeDirection(direction: St.DirectionType): boolean {
    if (isVertical(direction) === isVertical(this.lastResizeDirection)) return false;

    this.lastResizeDirection = direction;
    this.currentSide = direction;
    return true;
  }

  private centerCursor(): void {
    const [leftX, topY, width, height] = this.getGeometry();
    const rightX = leftX + width - 1;
    const bottomY = topY + height - 1;
    const cursorX = ((rightX - leftX) / 2) + leftX;
    const cursorY = ((topY - bottomY) / 2) + bottomY;

    warpPointer(cursorX, cursorY);
    this.updateCursor(cursorX, cursorY);
  }

  private moveCursorToSide(direction: St.DirectionType): void {
    const [leftX, topY, width, height] = this.getGeometry();
    const rightX = leftX + width - 1;
    const bottomY = topY + height - 1;
    const middleX = ((rightX - leftX) / 2) + leftX;
    const middleY = ((topY - bottomY) / 2) + bottomY;

    let cursorX = middleX;
    let cursorY = middleY;
    switch (direction) {
    case St.DirectionType.LEFT:
      cursorX = this.startX < this.lastX ? leftX : rightX;
      break;
    case St.DirectionType.RIGHT:
      cursorX = this.startX < this.lastX ? rightX : leftX;
      break;
    case St.DirectionType.UP:
      cursorY = this.startY < this.lastY ? topY : bottomY;
      break;
    case St.DirectionType.DOWN:
      cursorY = this.startY < this.lastY ? bottomY : topY;
      break;
    }

    warpPointer(cursorX, cursorY);
    this.updateCursor(cursorX, cursorY);
  }

  private updateSelectionRect(): void {
    const [x, y, w, h] = this.getGeometry();
    this.areaIndicator.setSelectionRect(x, y, w, h);

    const offset = this.handleSize / 2;
    this.topLeftHandle.set_position(x - offset, y - offset);
    this.topRightHandle.set_position(x + w - 1 - offset, y - offset);
    this.bottomLeftHandle.set_position(x - offset, y + h - 1 - offset);
    this.bottomRightHandle.set_position(x + w - 1 - offset, y + h - 1 - offset);
  }

  private updateCursor(x: number, y: number): void {
    this.set_cursor_type(cursorTypeAt(this.getGeometry(), this.handleSize, x, y));
  }

  private onPanBegin(): void {
    const centroid = this.panGesture.get_centroid_abs();
    const cursor = cursorTypeAt(this.getGeometry(), this.handleSize, centroid.x, centroid.y);

    if (cursor === Clutter.CursorType.CROSSHAIR ||
      this.panGesture.get_button() === Clutter.BUTTON_SECONDARY ||
      this.panGesture.get_state() & Clutter.ModifierType.CONTROL_MASK) {
      this.dragCursor = Clutter.CursorType.CROSSHAIR;
      this.set_cursor_type(this.dragCursor);

      this.lastX = this.startX = Math.floor(centroid.x);
      this.lastY = this.startY = Math.floor(centroid.y);

      this.updateSelectionRect();
    } else {
      this.beginMoveOrResize(cursor, centroid.x, centroid.y);
    }

    this.dragGrab = global.stage.grab(this);
    this.emit('drag-started');
  }

  private beginMoveOrResize(cursor: Clutter.CursorType, x: number, y: number): void {
    this.dragCursor = cursor;

    const geometry = this.getGeometry();
    const [leftX, topY, width, height] = geometry;
    const rightX = leftX + width - 1;
    const bottomY = topY + height - 1;

    const [snapX, snapY] = snapPoint(cursor, geometry, x, y);
    this.get_context().get_backend().get_default_seat().warp_pointer(snapX, snapY);
    this.dragStartX = snapX;
    this.dragStartY = snapY;

    if (cursor === Clutter.CursorType.MOVE) {
      this.startX = leftX;
      this.startY = topY;
      this.lastX = rightX;
      this.lastY = bottomY;
    }

    if (WEST_EDGES.includes(cursor)) {
      this.startX = rightX;
      this.lastX = leftX;
    }
    if (EAST_EDGES.includes(cursor)) {
      this.startX = leftX;
      this.lastX = rightX;
    }
    if (NORTH_EDGES.includes(cursor)) {
      this.startY = bottomY;
      this.lastY = topY;
    }
    if (SOUTH_EDGES.includes(cursor)) {
      this.startY = topY;
      this.lastY = bottomY;
    }
  }

  private onPanEnd(): void {
    this.stopDrag();

    const { x, y } = this.panGesture.get_centroid_abs();
    this.updateCursor(x, y);
  }

  private onPanUpdate(): void {
    const centroid = this.panGesture.get_centroid_abs();
    if (this.dragCursor === Clutter.CursorType.CROSSHAIR) {
      this.lastX = Math.floor(centroid.x);
      this.lastY = Math.floor(centroid.y);
    } else {
      let dx = Math.round(centroid.x - this.dragStartX);
      let dy = Math.round(centroid.y - this.dragStartY);

      if (this.dragCursor === Clutter.CursorType.MOVE) [dx, dy] = this.dragMove(dx, dy);
      else [dx, dy] = this.dragResize(dx, dy);

      this.dragStartX += dx;
      this.dragStartY += dy;
    }

    this.updateSelectionRect();
  }

  private dragMove(dx: number, dy: number): [number, number] {
    const [, , selectionWidth, selectionHeight] = this.getGeometry();

    let newStartX = this.startX + dx;
    let newStartY = this.startY + dy;
    let newLastX = this.lastX + dx;
    let newLastY = this.lastY + dy;

    let overshootX = 0;
    let overshootY = 0;

    if (newStartX < 0) {
      overshootX = 0 - newStartX;
      newStartX = 0;
      newLastX = newStartX + (selectionWidth - 1);
    } else if (newLastX > this.width - 1) {
      overshootX = (this.width - 1) - newLastX;
      newLastX = this.width - 1;
      newStartX = newLastX - (selectionWidth - 1);
    }

    if (newStartY < 0) {
      overshootY = 0 - newStartY;
      newStartY = 0;
      newLastY = newStartY + (selectionHeight - 1);
    } else if (newLastY > this.height - 1) {
      overshootY = (this.height - 1) - newLastY;
      newLastY = this.height - 1;
      newStartY = newLastY - (selectionHeight - 1);
    }

    this.startX = newStartX;
    this.startY = newStartY;
    this.lastX = newLastX;
    this.lastY = newLastY;

    return [dx + overshootX, dy + overshootY];
  }

  private dragResize(dx: number, dy: number): [number, number] {
    if (this.dragCursor === Clutter.CursorType.W_RESIZE || this.dragCursor === Clutter.CursorType.E_RESIZE) dy = 0;
    if (this.dragCursor === Clutter.CursorType.N_RESIZE || this.dragCursor === Clutter.CursorType.S_RESIZE) dx = 0;

    this.lastX += dx;
    if (this.lastX >= this.width) {
      dx -= this.lastX - this.width + 1;
      this.lastX = this.width - 1;
    } else if (this.lastX < 0) {
      dx -= this.lastX;
      this.lastX = 0;
    }

    this.lastY += dy;
    if (this.lastY >= this.height) {
      dy -= this.lastY - this.height + 1;
      this.lastY = this.height - 1;
    } else if (this.lastY < 0) {
      dy -= this.lastY;
      this.lastY = 0;
    }

    this.dragCursor = orientCursor(this.dragCursor, this.lastX > this.startX, this.lastY > this.startY);
    this.set_cursor_type(this.dragCursor);

    return [dx, dy];
  }
}
