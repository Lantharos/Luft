import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import type { Context } from '../../context.js';
import { ChordShortcut } from './chordShortcut.js';
import type { Dictation } from './dictation.js';
import { GrabbedShortcut } from './grabbedShortcut.js';
import { PressAndHold } from './pressAndHold.js';

const KEY = 'dictate';
const MODIFIERS: Record<string, Clutter.ModifierType> = {
  super: Clutter.ModifierType.SUPER_MASK,
  alt: Clutter.ModifierType.MOD1_MASK,
  mod1: Clutter.ModifierType.MOD1_MASK,
  control: Clutter.ModifierType.CONTROL_MASK,
  ctrl: Clutter.ModifierType.CONTROL_MASK,
  primary: Clutter.ModifierType.CONTROL_MASK,
  shift: Clutter.ModifierType.SHIFT_MASK,
};

function modifiersAlone(accelerator: string): Clutter.ModifierType | null {
  if (accelerator.replace(/<[^>]+>/g, '')) return null;
  let modifiers = 0;
  for (const [, name] of accelerator.matchAll(/<([^>]+)>/g)) modifiers |= MODIFIERS[name.toLowerCase()] ?? 0;
  return modifiers;
}

/** The dictation shortcut, Super and Alt unless changed: hold it to talk, or press it to start and stop listening. */
export class DictationShortcut {
  private readonly keybindings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.keybindings' });
  private readonly presses: PressAndHold;
  private readonly changed: number;
  private triggers: { destroy(): void }[] = [];

  constructor(private readonly context: Context, dictation: Dictation) {
    this.presses = new PressAndHold({
      press: () => dictation.toggle(),
      begin: () => dictation.begin('hold'),
      end: () => dictation.end(),
      cancel: () => dictation.cancel(),
    }, () => true);
    this.changed = this.keybindings.connect(`changed::${KEY}`, () => this.bind());
    this.bind();
  }

  private bind(): void {
    this.unbind();
    for (const accelerator of this.keybindings.get_strv(KEY).filter(Boolean)) {
      const modifiers = modifiersAlone(accelerator);
      this.triggers.push(modifiers === null
        ? new GrabbedShortcut([accelerator], this.context.keybindings, this.presses)
        : new ChordShortcut(modifiers, this.presses, () => !this.context.sessionMode.isLocked));
    }
  }

  private unbind(): void {
    for (const trigger of this.triggers) trigger.destroy();
    this.triggers = [];
  }

  destroy(): void {
    this.keybindings.disconnect(this.changed);
    this.unbind();
    this.presses.destroy();
  }
}
