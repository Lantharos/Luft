import type Gio from 'gi://Gio';

import { setSquareSurfaces } from './kestrelGlass.js';
import { setSquareCorners } from './kestrelTheme.js';

const ROUNDED = 'rounded-window-corners';

export function followCorners(kestrel: Gio.Settings): () => void {
  const follow = () => {
    const square = !kestrel.get_boolean(ROUNDED);
    setSquareSurfaces(square);
    setSquareCorners(square);
  };
  const id = kestrel.connect(`changed::${ROUNDED}`, follow);
  follow();
  return () => kestrel.disconnect(id);
}
