import GLib from 'gi://GLib';

import {pause} from '../lib/wait.js';
import {withApp} from './lib/apps.js';
import {exists, removeTree} from './lib/files.js';
import {saveBothStyles, withPalette} from './lib/palette.js';
import {LIBRARY, placeLibrary, STATE, USER_FOLDERS} from './heft/library.js';

const WINDOW = {x: 80, y: 30, width: 1280, height: 800};
const LOADING = 4000;

export async function run() {
  placeLibrary();
  try {
    await withPalette(palette => withApp('heft', [], async app => {
      app.window.unmaximize();
      app.window.move_resize_frame(true, WINDOW.x, WINDOW.y, WINDOW.width, WINDOW.height);
      await pause(LOADING);
      await saveBothStyles(app, palette, 'heft-split');
    }));
  } finally {
    removeTree(LIBRARY);
    for (const file of [STATE, USER_FOLDERS]) if (exists(file)) GLib.unlink(file);
  }
}
