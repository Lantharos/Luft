import type { Disposable, Extension } from '@luft/extension-api';

import type { Preset } from './presets.js';

const QUIETEST = 0.25;
const LOUDEST = 0.6;

/** The sound people picked for their pictures landing, played now and then while they fall where it shows. */
export class ImpactSound {
  private timer: Disposable | null = null;
  private playing: Preset | null = null;

  constructor(private readonly seasons: Extension<'sounds'>) {}

  sync(preset: Preset | null): void {
    const wanted = preset?.impact && preset.landing !== 'through' ? preset : null;
    if (wanted === this.playing) return;
    this.timer?.dispose();
    this.timer = null;
    this.playing = wanted;
    if (wanted) this.next(wanted);
  }

  private next(preset: Preset): void {
    const average = 1600 / preset.amount;
    this.timer = this.seasons.timers.timeout(average * (0.3 + 1.4 * Math.random()), () => {
      this.seasons.sounds.play(preset.impact!, { volume: QUIETEST + (LOUDEST - QUIETEST) * Math.random() });
      this.next(preset);
    });
  }
}
