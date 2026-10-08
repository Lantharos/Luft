import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {drag} from '../lib/input.js';
import {gjs, scratch, waitForWindow} from '../lib/processes.js';
import {settled} from '../lib/wait.js';
import {withApp} from './lib/apps.js';
import {children, exists, removeTree, write} from './lib/files.js';
import {checkPalette, showDark, withPalette} from './lib/palette.js';
import {checkDelivery} from './mailman/delivery.js';

const {eventually} = checks('Luft app');
const MESSAGE = 'From: Ayesha <ayesha@example.test>\r\nTo: luft@example.test\r\nSubject: Harbour photos\r\n\r\nThe photos from Saturday are in the shared folder.\r\n';
const DRAG = {steps: 24, interval: 30, hover: 300};
const DATA = GLib.build_filenamev([GLib.get_user_data_dir(), 'mailman']);
const CACHE = scratch('mailman');

async function checkDrop(app, palette) {
  const message = GLib.build_filenamev([GLib.get_home_dir(), 'Harbour photos.eml']);
  write(message, MESSAGE);
  const stashed = GLib.build_filenamev([CACHE, 'compose']);
  const received = () => children(stashed).some(info => exists(GLib.build_filenamev([stashed, info.get_name(), 'Harbour photos.eml'])));
  try {
    await showDark(app, palette);
    gjs('clients/fileDragSource.js', [message]);
    const source = await waitForWindow('Kestrel drag source');
    await settled();
    const {x, y, width, height} = app.window.get_frame_rect();
    await drag(source.get_compositor_private(), [x + width / 3, y + height / 2], DRAG);
    await eventually(received, 'a message file dropped from another app reaches Mailman');
    app.window.activate(global.get_current_time());
    (await app.settle(() => true)).save('mailman-dropped-message-dark');
  } finally {
    GLib.unlink(message);
  }
}

export async function run() {
  try {
    await withPalette(palette => withApp('mailman', [], async app => {
      await checkPalette(app, palette, {accent: true});
      await checkDrop(app, palette);
    }));
    const stalwart = GLib.find_program_in_path('stalwart');
    if (stalwart) await checkDelivery(stalwart);
    else console.log('Kestrel Luft app check: mailman delivery skipped without stalwart');
  } finally {
    for (const folder of [DATA, CACHE]) if (exists(folder)) removeTree(folder);
  }
}
