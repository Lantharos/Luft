import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Keybindings } from '../../context.js';
import type { Presses } from './pressAndHold.js';

export const SHORTCUT_MODES = Shell.ActionMode.ALL & ~(Shell.ActionMode.LOGIN_SCREEN | Shell.ActionMode.LOCK_SCREEN | Shell.ActionMode.UNLOCK_SCREEN);

/**
 * Keys grabbed from the compositor that tell when they go down and come up.
 * Mutter only reports letting go when the shortcut's own key comes up, so
 * the first of its keys to come up ends it, even a modifier. Keys typed
 * while it's held don't.
 */
export class GrabbedShortcut {
  private readonly actions: number[] = [];
  private readonly signals: number[];
  private releaseFilter = 0;

  constructor(accelerators: string[], keybindings: Keybindings, private readonly presses: Presses) {
    for (const accelerator of accelerators) {
      const action = global.display.grab_accelerator(accelerator, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT | Meta.KeyBindingFlags.TRIGGER_RELEASE);
      if (action === Meta.KeyBindingAction.NONE) continue;
      keybindings.allow(Meta.external_binding_name_for_action(action), SHORTCUT_MODES);
      this.actions.push(action);
    }
    this.signals = [
      global.display.connect('accelerator-activated', (_display, action: number) => {
        if (this.actions.includes(action)) this.pressed();
      }),
      global.display.connect('accelerator-deactivated', (_display, action: number) => {
        if (this.actions.includes(action)) this.released();
      }),
    ];
  }

  private pressed(): void {
    this.presses.down();
    if (this.releaseFilter) return;
    const typed = new Set<number>();
    this.releaseFilter = Clutter.Event.prepend_filter(null, event => {
      const type = event.type();
      if (type === Clutter.EventType.KEY_PRESS && !(event.get_flags() & Clutter.EventFlags.FLAG_REPEATED)) typed.add(event.get_key_code());
      else if (type === Clutter.EventType.KEY_RELEASE && !typed.delete(event.get_key_code())) this.released();
      return Clutter.EVENT_PROPAGATE;
    });
  }

  private released(): void {
    this.stopWatchingRelease();
    this.presses.up();
  }

  private stopWatchingRelease(): void {
    if (this.releaseFilter) Clutter.Event.remove_filter(this.releaseFilter);
    this.releaseFilter = 0;
  }

  destroy(): void {
    this.stopWatchingRelease();
    this.presses.cancel();
    for (const signal of this.signals) global.display.disconnect(signal);
    for (const action of this.actions) global.display.ungrab_accelerator(action);
  }
}
