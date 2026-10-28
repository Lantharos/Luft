import type St from 'gi://St';

import type { Monitor } from '../../desktop/panel/panel.js';
import type { Box } from '../../shared/layout/box.js';
import type { Edge, Offset } from '../../shared/layout/edge.js';

export interface StartArea {
  monitor: Monitor;
  area: Box;
  edge: Edge;
  available: number;
  cornered: boolean;
  anchor: number | null;
}

export interface StartSurface {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly focusOnTouch: boolean;
  slideFrom(edge: Edge): Offset;
  focus(): void;
  reset(): void;
  place(area: StartArea): void;
}
