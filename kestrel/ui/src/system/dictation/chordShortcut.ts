import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import type { Presses } from './pressAndHold.js';

/** Modifier keys alone, such as Super and Alt, pressed together and nothing else. */
export class ChordShortcut {
  private readonly chord: Shell.ModifierChord;

  constructor(modifiers: Clutter.ModifierType, presses: Presses, allowed: () => boolean) {
    this.chord = new Shell.ModifierChord({ modifiers });
    this.chord.connect('activated', () => {
      if (allowed()) presses.down();
    });
    this.chord.connect('released', () => presses.up());
    this.chord.connect('cancelled', () => presses.cancel());
  }

  destroy(): void {
    this.chord.run_dispose();
  }
}
