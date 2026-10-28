import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import St from 'gi://St';

import * as Main from '../../core/main.js';
import type { FocusTracker } from './focusTracker.js';

export const KEYBOARD_ANIMATION_TIME = 150;
const FIELD_CLEARANCE = 16;

function focusedField(): Clutter.Actor | null {
  const focus = global.stage.key_focus;
  if (!(focus instanceof Clutter.Text)) return null;
  const parent = focus.get_parent();
  return parent instanceof St.Entry ? parent : focus;
}

function chromeOf(actor: Clutter.Actor): Clutter.Actor | null {
  const uiGroup = Main.layoutManager.uiGroup;
  let chrome: Clutter.Actor | null = actor;
  while (chrome && chrome.get_parent() !== uiGroup) chrome = chrome.get_parent();
  return chrome === Main.layoutManager.screenShieldGroup ? null : chrome;
}

function easeLift(chrome: Clutter.Actor, translation: number): void {
  chrome.ease({
    translation_y: translation,
    duration: KEYBOARD_ANIMATION_TIME,
    mode: Clutter.AnimationMode.EASE_OUT_QUAD,
  });
}

export class FocusLift {
  private focusWindow: Meta.Window | null = null;
  private focusWindowStartY: number | null = null;
  private liftedChrome: Clutter.Actor | null = null;
  private windowMovedId: number;

  constructor(
    private readonly keyboard: Clutter.Actor,
    private readonly focusTracker: FocusTracker,
    private readonly keyboardShown: () => boolean,
    private readonly onWindowMoving: () => void,
  ) {
    this.windowMovedId = focusTracker.connect('window-moved', onWindowMoving);
  }

  disconnect(): void {
    this.focusTracker.disconnect(this.windowMovedId);
  }

  letGo(): void {
    if (this.focusTracker.currentWindow !== this.focusWindow) return;
    this.focusWindow = null;
    this.focusWindowStartY = null;
  }

  liftChrome(shown: boolean): void {
    const field = shown ? focusedField() : null;
    const chrome = field && chromeOf(field);
    if (this.liftedChrome && this.liftedChrome !== chrome) easeLift(this.liftedChrome, 0);
    this.liftedChrome = chrome;
    if (!field || !chrome) return;

    const monitor = Main.layoutManager.keyboardMonitor;
    const keyboardTop = monitor.y + monitor.height - this.keyboard.height;
    const [, fieldY] = field.get_transformed_position();
    const fieldBottom = fieldY - chrome.translation_y + field.height;
    const lift = Math.min(Math.max(0, fieldBottom + FIELD_CLEARANCE - keyboardTop), this.keyboard.height);
    easeLift(chrome, -lift);
  }

  slideWindow(show: boolean): void {
    if (this.focusWindow) this.animateWindow(this.focusWindow, show);
  }

  followGesture(offset: number): void {
    const windowActor = this.focusWindow?.get_compositor_private() as Meta.WindowActor | null | undefined;
    if (windowActor) windowActor.y = (this.focusWindowStartY ?? 0) - offset;
  }

  setCursorLocation(window: Meta.Window | null, y: number, height: number): void {
    const monitor = Main.layoutManager.keyboardMonitor;
    if (!window || !monitor) {
      this.setFocusWindow(null);
      return;
    }

    const keyboardHeight = Main.layoutManager.keyboardBox.height;
    const keyboardY1 = (monitor.y + monitor.height) - keyboardHeight;

    if (this.focusWindow === window) {
      if (y + height + keyboardHeight < keyboardY1) this.setFocusWindow(null);
      return;
    }

    this.setFocusWindow(y + height >= keyboardY1 ? window : null);
  }

  setFocusWindow(window: Meta.Window | null): void {
    if (this.focusWindow === window) return;

    if (this.keyboardShown() && this.focusWindow) this.animateWindow(this.focusWindow, false);

    const windowActor = window?.get_compositor_private() as Meta.WindowActor | null | undefined;
    windowActor?.remove_transition('y');
    this.focusWindowStartY = windowActor ? windowActor.y : null;

    if (this.keyboardShown() && window) this.animateWindow(window, true);

    this.focusWindow = window;
  }

  private animateWindow(window: Meta.Window, show: boolean): void {
    const windowActor = window.get_compositor_private() as Meta.WindowActor | null;
    if (!windowActor) return;

    const startY = this.focusWindowStartY ?? 0;
    const finalY = show ? startY - Main.layoutManager.keyboardBox.height : startY;

    let unmanaged = false;
    const winUnmanagedId = window.connect('unmanaged', () => {
      unmanaged = true;
    });

    windowActor.ease({
      y: finalY,
      duration: KEYBOARD_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => {
        window.disconnect(winUnmanagedId);
        if (unmanaged) return;

        windowActor.y = finalY;
        this.windowSlideComplete(window, finalY);
      },
    });
  }

  private windowSlideComplete(window: Meta.Window, finalY: number): void {
    const frameRect = window.get_frame_rect();
    const bufferRect = window.get_buffer_rect();
    frameRect.y = finalY + frameRect.y - bufferRect.y;

    this.focusTracker.disconnect(this.windowMovedId);
    window.move_frame(true, frameRect.x, frameRect.y);
    this.windowMovedId = this.focusTracker.connect('window-moved', this.onWindowMoving);
  }
}
