import type Clutter from 'gi://Clutter';
import type GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import Meta from 'gi://Meta';

import * as Main from '../../core/main.js';
import { EventEmitter } from '../../core/runtime/signals.js';
import { getIBusManager } from '../../system/inputSources/ibusManager.js';

export interface CursorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FocusTrackerSignals {
  'window-grabbed': () => void;
  'window-moved': () => void;
  'position-changed': () => void;
  'focus-changed': (focused: boolean) => void;
}

export class FocusTracker extends EventEmitter {
  declare connect: GObject.SignalMethods<this, FocusTrackerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, FocusTrackerSignals>['emit'];

  private rect: Graphene.Rect | null = null;
  private window: Meta.Window | null = null;
  private readonly ibusManager = getIBusManager();

  constructor() {
    super();

    global.display.connectObject(
      'notify::focus-window', () => this.setCurrentWindow(global.display.focus_window),
      'grab-op-begin', (_display: Meta.Display, window: Meta.Window, op: Meta.GrabOp) => {
        if (window === this.window && (op === Meta.GrabOp.MOVING || op === Meta.GrabOp.KEYBOARD_MOVING))
          this.emit('window-grabbed');
      }, this);

    this.setCurrentWindow(global.display.focus_window);

    Main.inputMethod.connectObject('cursor-location-changed',
      (_method: Clutter.InputMethod, rect: Graphene.Rect) => this.setCurrentRect(rect), this);

    this.ibusManager.connectObject(
      'set-cursor-location', (_manager: unknown, rect: CursorRect) => {
        if (Main.inputMethod.currentFocus) return;

        const grapheneRect = new Graphene.Rect();
        grapheneRect.init(rect.x, rect.y, rect.width, rect.height);
        this.setCurrentRect(grapheneRect);
      },
      'focus-in', () => this.emit('focus-changed', true),
      'focus-out', () => this.emit('focus-changed', false),
      this);
  }

  destroy(): void {
    this.window?.disconnectObject(this);
    global.display.disconnectObject(this);
    Main.inputMethod.disconnectObject(this);
    this.ibusManager.disconnectObject(this);
  }

  get currentWindow(): Meta.Window | null {
    return this.window;
  }

  getCurrentRect(): CursorRect {
    const { origin, size } = this.rect!;
    return { x: origin.x, y: origin.y, width: size.width, height: size.height };
  }

  private setCurrentWindow(window: Meta.Window | null): void {
    this.window?.disconnectObject(this);
    this.window = window;
    this.window?.connectObject('position-changed', () => this.emit('window-moved'), this);
  }

  private setCurrentRect(rect: Graphene.Rect): void {
    if (rect.size.width <= 0) rect.size.width = 1;
    if (rect.size.height <= 0) rect.size.height = 1;

    if (this.window) {
      const frameRect = this.window.get_frame_rect();
      const grapheneFrameRect = new Graphene.Rect();
      grapheneFrameRect.init(frameRect.x, frameRect.y, frameRect.width, frameRect.height);

      const [intersects] = grapheneFrameRect.intersection(rect);
      if (!intersects) return;
    }

    if (this.rect && this.rect.equal(rect)) return;

    this.rect = rect;
    this.emit('position-changed');
  }
}
