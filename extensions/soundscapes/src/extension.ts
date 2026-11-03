import type { Enable } from '@luft/extension-api';

import { describePage } from './page.js';
import { Soundscapes, type Granted } from './soundscapes.js';
import { addTile } from './tile.js';

const enable: Enable<Granted> = extension => {
  const soundscapes = new Soundscapes(extension);
  addTile(soundscapes);
  describePage(soundscapes);
};

export default enable;
