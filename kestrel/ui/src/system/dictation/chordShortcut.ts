import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import type { Presses } from './pressAndHold.js';

interface ModifierChord {
  connect(signal: 'activated' | 'released' | 'cancelled', callback: () => void): number;
  run_dispose(): void;
}

const ModifierChord = (Shell as unknown as { ModifierChord: new (properties: { modifiers: Clutter.ModifierType }) => ModifierChord }).ModifierChord;

/** Modifier keys alone, such as Super and Alt, pressed together and nothing else. */
export class ChordShortcut {
  private readonly chord: ModifierChord;

  constructor(modifiers: Clutter.ModifierType, presses: Presses, allowed: () => boolean) {
    this.chord = new ModifierChord({ modifiers });
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
