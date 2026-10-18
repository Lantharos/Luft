import type { Palette } from '../../../appearance/palette.js';
import { rgba } from '../../../appearance/stylesheet.js';

type Variant = 'light' | 'dark';

const HOVER_FILL = 0.065;
const RESTING_BACKDROP_INK = 0.7;

export function titleBarStylesheet(palette: Palette, variant: Variant): string {
  const colors = palette[variant].colors;
  const surface = variant === 'light' ? colors.surfaceContainer : colors.surfaceDim;
  return `.kestrel-titlebar.kestrel-titlebar { background-color: ${surface}; color: ${colors.onSurface}; }
.kestrel-titlebar.kestrel-titlebar:backdrop { color: ${colors.outline}; }
.kestrel-titlebar.kestrel-titlebar .kestrel-titlebar-button { color: ${colors.outline}; }
.kestrel-titlebar.kestrel-titlebar .kestrel-titlebar-button:hover { background-color: ${rgba(colors.onSurface, HOVER_FILL)}; color: ${colors.onSurface}; }
.kestrel-titlebar.kestrel-titlebar:backdrop .kestrel-titlebar-button { color: ${rgba(colors.outline, RESTING_BACKDROP_INK)}; }
.kestrel-titlebar.kestrel-titlebar:backdrop .kestrel-titlebar-button:hover { color: ${colors.onSurface}; }
`;
}
