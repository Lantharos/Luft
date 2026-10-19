import type Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

const HOLD_MS = 300;

const seat = () => (global as unknown as Shell.Global).stage.context.get_backend().get_default_seat() as Clutter.Seat & { consume_held_modifiers(): void };

export interface Presses {
  down(): void;
  up(): void;
  cancel(): void;
}

export interface HoldActions {
  press(): void;
  begin(): void;
  end(): void;
  cancel(): void;
}

export class PressAndHold implements Presses {
  private holdTimer = 0;
  private isDown = false;
  private holding = false;
  private pressedAlready = false;

  constructor(private readonly actions: HoldActions, private readonly holds: () => boolean) {}

  down(): void {
    if (this.isDown) return;
    this.isDown = true;
    this.pressedAlready = !this.holds();
    if (this.pressedAlready) {
      this.actions.press();
      return;
    }
    this.holdTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, HOLD_MS, () => {
      this.holdTimer = 0;
      this.holding = true;
      seat().consume_held_modifiers();
      this.actions.begin();
      return GLib.SOURCE_REMOVE;
    });
  }

  up(): void {
    if (!this.release()) return;
    if (this.holding) {
      this.holding = false;
      this.actions.end();
    } else if (!this.pressedAlready) {
      this.actions.press();
    }
  }

  cancel(): void {
    if (!this.release() || !this.holding) return;
    this.holding = false;
    this.actions.cancel();
  }

  private release(): boolean {
    if (!this.isDown) return false;
    this.isDown = false;
    if (this.holdTimer) GLib.Source.remove(this.holdTimer);
    this.holdTimer = 0;
    return true;
  }

  destroy(): void {
    this.cancel();
  }
}
