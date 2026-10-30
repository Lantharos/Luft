import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {checks} from '../lib/check.js';
import {fixture, spawn, stop, waitForWindow} from '../lib/processes.js';
import {captureFrame} from '../lib/screenshots.js';
import {nextFrame, pause, settled} from '../lib/wait.js';

const {require, eventually} = checks('minimized X11 windows');

export async function run() {
  const binary = GLib.build_filenamev([GLib.get_user_cache_dir(), 'clears-when-hidden']);
  const compiler = spawn(['cc', '-O2', '-o', binary, fixture('clients', 'windows', 'clearsWhenHidden.c'), '-lX11']);
  await compiler.exited;
  const client = spawn([binary]);
  try {
    const window = await waitForWindow(found => found.get_title() === 'Clears when hidden: shown', 'the window opens');
    window.move_resize_frame(true, 200, 200, 400, 300);
    await settled();
    const actor = window.get_compositor_private<Meta.WindowActor>();
    window.minimize();
    await eventually(() => window.get_title() === 'Clears when hidden: hidden', 'the X11 app sees it is hidden and clears its window, like Steam');
    await eventually(() => !actor.visible, 'the window finishes minimizing');
    await pause(400);
    const clone = new Clutter.Clone({source: actor, x: 800, y: 200});
    global.stage.add_child(clone);
    await nextFrame();
    await settled();
    const shot = await captureFrame({x: 800, y: 200, width: 400, height: 300});
    clone.destroy();
    require(shot.near(200, 150, '#00ff00', 30), 'a preview of the minimized window shows the app as it was, not the cleared window');
    window.unminimize();
    await eventually(() => window.get_title() === 'Clears when hidden: shown', 'the app is shown again');
    await settled();
    await pause(400);
    require(actor.get_n_children() === 1, 'the picture is gone once the window is back');
    const back = await captureFrame({x: 200, y: 200, width: 400, height: 300});
    require(back.near(200, 150, '#00ff00', 30), 'the restored window shows the app live again');
  } finally {
    await stop(client);
  }
}
