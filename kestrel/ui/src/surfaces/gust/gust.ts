import type St from 'gi://St';

import type { Monitor } from '../../desktop/panel/panel.js';
import type { Box } from '../../shared/layout/box.js';
import type { Anchor } from '../../shared/layout/anchor.js';
import type { Edge, Offset } from '../../shared/layout/edge.js';
import { taskbarPreferences } from '../../desktop/panel/preferences/taskbarPreferences.js';
import type { SearchHost } from '../search/engine.js';
import { GustPalette } from './palette/palette.js';
import { GustPanel } from './panel/panel.js';

export interface GustArea {
  monitor: Monitor;
  area: Box;
  available: number;
  anchor: Anchor;
}

export interface GustSurface {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly focusOnTouch: boolean;
  slideFrom(edge: Edge): Offset;
  focus(): void;
  reset(): void;
  place(area: GustArea): void;
}

export function createGust(host: SearchHost): GustSurface {
  return taskbarPreferences.gustLook === 'palette' ? new GustPalette(host) : new GustPanel(host);
}
