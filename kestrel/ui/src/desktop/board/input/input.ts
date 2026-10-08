import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import type { Camera } from '../view/camera.js';
import { copyView, FULL_SIZE, type View } from '../view/geometry.js';

const TAP_DURATION = 250;
const TAP_TO_DRAG = 400;
const DIRECTION_THRESHOLD = 16;
const DOUBLE_CLICK_TIME = 400;
const DOUBLE_CLICK_DISTANCE = 8;
const ZOOM_STEP = 1.25;
const WHEEL_PAN = 60;
const FINGER_PAN = 10;
const FINGER_ZOOM = 0.04;
const PINCH_ENTER = 1.15;
const MAGNIFIED = 1.06;
const STEP_THRESHOLD = 48;
const SHIELD_BELOW = 0.6;
const DRAG_SLOP = 6;
const VELOCITY_SMOOTHING = 0.3;
const SUPER = Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK;
const BUTTONS = Clutter.ModifierType.BUTTON1_MASK | Clutter.ModifierType.BUTTON2_MASK | Clutter.ModifierType.BUTTON3_MASK |
  Clutter.ModifierType.BUTTON4_MASK | Clutter.ModifierType.BUTTON5_MASK;

type SwipeMode = 'none' | 'pan' | 'move' | 'step' | 'direction' | 'switch' | 'passed';

export interface BoardActions {
  readonly camera: Camera;
  active(): boolean;
  canInteract(): boolean;
  enter(): void;
  exit(): void;
  fitAll(): void;
  enteredWindow(): Meta.Window | null;
  enterWindow(window: Meta.Window, from?: View): void;
  overview(): void;
  freeView(): void;
  navigate(directionX: number, directionY: number): void;
  onCanvas(x: number, y: number): boolean;
  windowAt(x: number, y: number): Meta.Window | null;
  beginMove(window: Meta.Window): void;
  moveBy(screenDx: number, screenDy: number): void;
  endMove(): void;
  pointerMoved(x: number, y: number): void;
}

export class BoardInput {
  readonly shield = new Clutter.Actor({ name: 'kestrel-board-shield', reactive: true, visible: false });
  private swipeMode: SwipeMode = 'none';
  private swipeX = 0;
  private swipeY = 0;
  private velocityX = 0;
  private velocityY = 0;
  private lastSwipeTime = 0;
  private holdStart = 0;
  private tapTime = -Infinity;
  private pinching = false;
  private pinchScale = 1;
  private pinchEntered: Meta.Window | null = null;
  private readonly pinchStart: View = { x: 0, y: 0, scale: 1 };
  private dragging: Clutter.Grab | null = null;
  private dragX = 0;
  private dragY = 0;
  private panned = false;
  private picked: Meta.Window | null = null;
  private pickMoved = false;
  private lastClickTime = -Infinity;
  private lastClickX = 0;
  private lastClickY = 0;
  private swallowedButton = 0;

  constructor(private readonly actions: BoardActions, private readonly grabActor: Clutter.Actor) {
    grabActor.connect('event', (_actor, event: Clutter.Event) =>
      this.dragging && this.handle(event) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE);
  }

  syncShield(shown: boolean): void {
    const shielded = shown && !this.actions.enteredWindow() && this.actions.camera.view.scale < SHIELD_BELOW;
    if (this.shield.visible !== shielded) this.shield.visible = shielded;
  }

  handle(event: Clutter.Event): boolean {
    switch (event.type()) {
    case Clutter.EventType.MOTION: return this.motion(event);
    case Clutter.EventType.BUTTON_RELEASE: return this.release(event);
    case Clutter.EventType.TOUCHPAD_SWIPE: return this.actions.canInteract() && this.swipe(event);
    case Clutter.EventType.TOUCHPAD_PINCH: return this.actions.canInteract() && this.pinch(event);
    case Clutter.EventType.TOUCHPAD_HOLD: return this.actions.canInteract() && this.hold(event);
    case Clutter.EventType.BUTTON_PRESS: return this.actions.canInteract() && this.press(event);
    case Clutter.EventType.SCROLL: return this.actions.canInteract() && this.scroll(event);
    default: return false;
    }
  }

  private swipe(event: Clutter.Event): boolean {
    const phase = event.get_gesture_phase();
    const time = event.get_time();
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) this.beginSwipe(event.get_touchpad_gesture_finger_count(), time, event);
    const mode = this.swipeMode;
    if (phase === Clutter.TouchpadGesturePhase.END || phase === Clutter.TouchpadGesturePhase.CANCEL) {
      this.endSwipe();
      return mode !== 'none' && mode !== 'passed';
    }
    if (mode === 'pan' || mode === 'move') {
      const [dx, dy] = event.get_gesture_motion_delta();
      const elapsed = Math.max(1, time - this.lastSwipeTime);
      this.lastSwipeTime = time;
      this.velocityX += (dx / elapsed - this.velocityX) * VELOCITY_SMOOTHING;
      this.velocityY += (dy / elapsed - this.velocityY) * VELOCITY_SMOOTHING;
      if (mode === 'pan') this.actions.camera.panBy(dx, dy);
      else this.actions.moveBy(dx, dy);
      return true;
    }
    if (mode === 'step') return this.chooseStep(event);
    if (mode === 'direction') return this.chooseDirection(event);
    return mode === 'switch';
  }

  private beginSwipe(fingers: number, time: number, event: Clutter.Event): void {
    this.swipeX = this.swipeY = this.velocityX = this.velocityY = 0;
    this.lastSwipeTime = time;
    if (fingers === 4) {
      this.swipeMode = 'direction';
      return;
    }
    if (fingers !== 3 || !this.actions.active()) {
      this.swipeMode = 'none';
      return;
    }
    const [x, y] = event.get_coords();
    const window = time - this.tapTime < TAP_TO_DRAG ? this.actions.windowAt(x, y) : null;
    this.tapTime = -Infinity;
    if (!window && this.actions.enteredWindow()) {
      this.swipeMode = 'step';
      return;
    }
    this.actions.camera.stop();
    if (window) this.actions.beginMove(window);
    this.swipeMode = window ? 'move' : 'pan';
  }

  private chooseStep(event: Clutter.Event): boolean {
    const [dx, dy] = event.get_gesture_motion_delta_unaccelerated();
    this.swipeX += dx;
    this.swipeY += dy;
    if (Math.hypot(this.swipeX, this.swipeY) < STEP_THRESHOLD) return true;
    this.swipeMode = 'switch';
    if (Math.abs(this.swipeX) >= Math.abs(this.swipeY)) this.actions.navigate(this.swipeX < 0 ? 1 : -1, 0);
    else if (this.swipeY > 0) this.actions.overview();
    return true;
  }

  private chooseDirection(event: Clutter.Event): boolean {
    const [dx, dy] = event.get_gesture_motion_delta_unaccelerated();
    this.swipeX += dx;
    this.swipeY += dy;
    if (Math.hypot(this.swipeX, this.swipeY) < DIRECTION_THRESHOLD) return false;
    if (Math.abs(this.swipeX) >= Math.abs(this.swipeY)) {
      this.swipeMode = 'passed';
      return false;
    }
    this.swipeMode = 'switch';
    if (this.swipeY < 0 && !this.actions.active()) this.actions.enter();
    else if (this.swipeY > 0 && this.actions.active()) this.actions.exit();
    return true;
  }

  private endSwipe(): void {
    if (this.swipeMode === 'pan') this.actions.camera.glide(this.velocityX, this.velocityY);
    if (this.swipeMode === 'move') this.actions.endMove();
    this.swipeMode = 'none';
  }

  private hold(event: Clutter.Event): boolean {
    if (!this.actions.active() || event.get_touchpad_gesture_finger_count() !== 3) return false;
    const phase = event.get_gesture_phase();
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) this.holdStart = event.get_time();
    else if (event.get_time() - this.holdStart < TAP_DURATION) this.tapTime = event.get_time();
    return false;
  }

  private pinch(event: Clutter.Event): boolean {
    const phase = event.get_gesture_phase();
    const camera = this.actions.camera;
    const [x, y] = event.get_coords();
    if (phase === Clutter.TouchpadGesturePhase.BEGIN) {
      this.pinching = this.actions.active() && (event.get_touchpad_gesture_finger_count() >= 3 || this.shielded(x, y) || this.actions.onCanvas(x, y));
      if (this.pinching) {
        camera.stop();
        copyView(this.pinchStart, camera.view);
        this.pinchScale = 1;
        this.pinchEntered = this.actions.enteredWindow();
      }
      return this.pinching;
    }
    if (!this.pinching) return false;
    if (phase === Clutter.TouchpadGesturePhase.UPDATE) {
      const [dx, dy] = event.get_gesture_motion_delta();
      this.pinchScale = event.get_gesture_pinch_scale();
      camera.zoomAt(this.pinchStart.scale * this.pinchScale, x, y, dx, dy);
      return true;
    }
    this.pinching = false;
    this.endPinch(x, y);
    return true;
  }

  private endPinch(x: number, y: number): void {
    const entered = this.pinchEntered;
    this.pinchEntered = null;
    const camera = this.actions.camera;
    if (camera.view.scale >= FULL_SIZE * MAGNIFIED) {
      this.actions.freeView();
      return;
    }
    const window = this.pinchScale > PINCH_ENTER ? this.actions.windowAt(x, y) : null;
    if (window) this.actions.enterWindow(window, this.pinchStart);
    else if (entered && this.pinchScale < 1 / PINCH_ENTER) this.actions.overview();
    else if (entered) this.actions.enterWindow(entered);
    else camera.snapToFullSize(x, y);
  }

  private press(event: Clutter.Event): boolean {
    const button = event.get_button();
    if (button === Clutter.BUTTON_MIDDLE && event.get_time() - this.tapTime < TAP_DURATION &&
      event.get_source_device().get_device_type() === Clutter.InputDeviceType.TOUCHPAD_DEVICE) {
      this.swallowedButton = button;
      return true;
    }
    if (!this.actions.active() || this.dragging) return false;
    const [x, y] = event.get_coords();
    const onCanvas = this.actions.onCanvas(x, y);
    const withSuper = (event.get_state() & SUPER) !== 0;
    if (button === Clutter.BUTTON_PRIMARY && onCanvas && this.isDoubleClick(event.get_time(), x, y)) {
      this.actions.fitAll();
      return true;
    }
    const shielded = this.shielded(x, y);
    const picked = button === Clutter.BUTTON_PRIMARY && shielded ? this.actions.windowAt(x, y) : null;
    const pans = (button === Clutter.BUTTON_PRIMARY && onCanvas) || (button === Clutter.BUTTON_MIDDLE && (onCanvas || withSuper || shielded));
    if (!picked && !pans) return false;
    if (pans) this.actions.camera.stop();
    this.picked = picked;
    this.pickMoved = this.panned = false;
    this.dragX = x;
    this.dragY = y;
    this.dragging = (global as unknown as Shell.Global).stage.grab(this.grabActor);
    return true;
  }

  private shielded(x: number, y: number): boolean {
    return this.shield.visible && (global as unknown as Shell.Global).stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y) === this.shield;
  }

  private isDoubleClick(time: number, x: number, y: number): boolean {
    const double = time - this.lastClickTime < DOUBLE_CLICK_TIME &&
      Math.hypot(x - this.lastClickX, y - this.lastClickY) < DOUBLE_CLICK_DISTANCE;
    this.lastClickTime = double ? -Infinity : time;
    this.lastClickX = x;
    this.lastClickY = y;
    return double;
  }

  private motion(event: Clutter.Event): boolean {
    const [x, y] = event.get_coords();
    if (!this.dragging) {
      if (this.actions.active() && !(event.get_state() & BUTTONS)) this.actions.pointerMoved(x, y);
      return false;
    }
    if (this.picked) {
      if (!this.pickMoved && Math.hypot(x - this.dragX, y - this.dragY) < DRAG_SLOP) return true;
      if (!this.pickMoved) this.actions.beginMove(this.picked);
      this.pickMoved = true;
      this.actions.moveBy(x - this.dragX, y - this.dragY);
    } else {
      if (!this.panned) this.actions.freeView();
      this.panned = true;
      this.actions.camera.panBy(x - this.dragX, y - this.dragY);
    }
    this.dragX = x;
    this.dragY = y;
    return true;
  }

  private release(event: Clutter.Event): boolean {
    if (this.swallowedButton && event.get_button() === this.swallowedButton) {
      this.swallowedButton = 0;
      return true;
    }
    if (!this.dragging) return false;
    this.dragging.dismiss();
    this.dragging = null;
    const picked = this.picked;
    this.picked = null;
    if (picked && this.pickMoved) this.actions.endMove();
    else if (picked) this.actions.enterWindow(picked);
    return true;
  }

  private scroll(event: Clutter.Event): boolean {
    if (!this.actions.active()) return false;
    const [x, y] = event.get_coords();
    const state = event.get_state();
    const withSuper = (state & SUPER) !== 0;
    const withControl = (state & Clutter.ModifierType.CONTROL_MASK) !== 0;
    if (withSuper && !withControl) return false;
    const onCanvas = this.shielded(x, y) || this.actions.onCanvas(x, y);
    const zooms = withControl && (withSuper || onCanvas);
    if (!zooms && !onCanvas) return false;
    if (event.get_scroll_direction() !== Clutter.ScrollDirection.SMOOTH) return true;
    this.actions.freeView();
    const camera = this.actions.camera;
    const [dx, dy] = event.get_scroll_delta();
    const fingers = event.get_scroll_source() === Clutter.ScrollSource.FINGER;
    const unit = fingers ? FINGER_PAN : WHEEL_PAN;
    if (zooms && fingers) camera.zoomAt(camera.view.scale * Math.exp(-dy * FINGER_ZOOM), x, y);
    else if (zooms) camera.zoomBy(Math.pow(ZOOM_STEP, -dy), x, y);
    else if ((state & Clutter.ModifierType.SHIFT_MASK) !== 0 && dx === 0) camera.panBy(-dy * unit, 0);
    else camera.panBy(-dx * unit, -dy * unit);
    return true;
  }
}
