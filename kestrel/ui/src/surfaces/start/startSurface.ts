import type St from 'gi://St';

import type { Monitor } from '../../desktop/panel/panel.js';

export interface StartArea {
  monitor: Monitor;
  bottom: number;
  available: number;
  cornered: boolean;
}

export interface StartSurface {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly slideDistance: number;
  readonly focusOnTouch: boolean;
  focus(): void;
  reset(): void;
  place(area: StartArea): void;
}
