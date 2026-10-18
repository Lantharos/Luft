import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Keybindings } from '../../context.js';

const HOLD_MS = 300;
const MODES = Shell.ActionMode.ALL & ~(Shell.ActionMode.LOGIN_SCREEN | Shell.ActionMode.LOCK_SCREEN | Shell.ActionMode.UNLOCK_SCREEN);
const COPILOT_KEY_AS_F23 = ['<Shift><Super>F23', '<Shift><Super>XF86TouchpadOff'];
const ASSISTANT_KEY = 'XF86Assistant';

export interface Hold {
  begin(): void;
  end(): void;
}

const display = () => (global as unknown as Shell.Global).display;

export class CopilotKey {
  private readonly actions: number[] = [];
  private readonly signals: number[];
  private holdTimer = 0;
  private down = false;
  private holding = false;

  constructor(keybindings: Keybindings, private readonly press: () => void, private readonly hold: Hold) {
    for (const accelerator of [...COPILOT_KEY_AS_F23, ASSISTANT_KEY]) {
      const action = display().grab_accelerator(accelerator, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT | Meta.KeyBindingFlags.TRIGGER_RELEASE);
      if (action === Meta.KeyBindingAction.NONE) continue;
      keybindings.allow(Meta.external_binding_name_for_action(action), MODES);
      this.actions.push(action);
    }
    this.signals = [
      display().connect('accelerator-activated', (_display, action: number) => {
        if (this.actions.includes(action)) this.pressed();
      }),
      display().connect('accelerator-deactivated', (_display, action: number) => {
        if (this.actions.includes(action)) this.released();
      }),
    ];
  }

  private pressed(): void {
    if (this.down) return;
    this.down = true;
    this.holdTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, HOLD_MS, () => {
      this.holdTimer = 0;
      this.holding = true;
      this.hold.begin();
      return GLib.SOURCE_REMOVE;
    });
  }

  private released(): void {
    if (!this.down) return;
    this.down = false;
    if (this.holdTimer) GLib.Source.remove(this.holdTimer);
    this.holdTimer = 0;
    if (!this.holding) {
      this.press();
      return;
    }
    this.holding = false;
    this.hold.end();
  }

  destroy(): void {
    if (this.holdTimer) GLib.Source.remove(this.holdTimer);
    for (const signal of this.signals) display().disconnect(signal);
    for (const action of this.actions) display().ungrab_accelerator(action);
  }
}
