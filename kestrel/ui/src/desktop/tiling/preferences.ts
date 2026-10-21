import Gio from 'gi://Gio';

import { SURFACE_GAP } from '../../shared/layout/surface.js';
import type { LayoutName } from './layouts/layout.js';

export type TilingMode = 'off' | 'tiling' | 'scrolling';
type Gaps = 'none' | 'small' | 'medium' | 'large';

const GAPS: Record<Gaps, number> = { none: 0, small: SURFACE_GAP / 2, medium: SURFACE_GAP, large: SURFACE_GAP * 2 };
const KEYS = ['window-tiling', 'tiling-layout', 'tiling-gaps', 'tiling-new-windows'] as const;
export type TilingKey = typeof KEYS[number];

export class TilingPreferences {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly signals: number[];

  constructor(changed: (key: TilingKey) => void) {
    this.signals = KEYS.map(key => this.settings.connect(`changed::${key}`, () => changed(key)));
  }

  get mode(): TilingMode { return this.settings.get_string('window-tiling') as TilingMode; }
  get layout(): LayoutName { return this.settings.get_string('tiling-layout') as LayoutName; }
  get gap(): number { return GAPS[this.settings.get_string('tiling-gaps') as Gaps]; }
  get besideFocused(): boolean { return this.settings.get_string('tiling-new-windows') === 'beside-focused'; }

  destroy(): void {
    for (const id of this.signals) this.settings.disconnect(id);
  }
}
