import {withApp} from './lib/apps.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {forgetCreated} from './keys/cleanup.js';
import {checkDeadKeys} from './keys/deadKeys.js';
import {checkLayout} from './keys/layout.js';
import {checkMethod} from './keys/method.js';
import {checkShowLayout} from './keys/showLayout.js';
import {savedSources, startInputMethods} from './keys/typing.js';

export const timeout = 420000;

export async function run() {
  const restoreSources = savedSources();
  const forget = forgetCreated();
  try {
    await startInputMethods();
    await withPalette(async palette => {
      const id = await withApp('keys', [], async app => {
        await checkPalette(app, palette);
        await showDark(app, palette);
        return checkLayout(app, palette);
      });
      await checkMethod(palette);
      await checkDeadKeys(palette);
      await checkShowLayout(palette, id);
    });
  } finally {
    restoreSources();
    forget();
  }
}
