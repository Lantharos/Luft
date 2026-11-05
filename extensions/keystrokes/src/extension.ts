import type { Enable } from '@luft/extension-api';

import { Keystrokes } from './keystrokes.js';
import { describePage } from './page.js';

const enable: Enable<'sounds' | 'input-sounds'> = async extension => {
  const keystrokes = new Keystrokes(extension);
  describePage(keystrokes);
  await keystrokes.start();
};

export default enable;
