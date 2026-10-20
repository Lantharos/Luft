import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import {checks} from '../../lib/check.js';
import {press} from '../../lib/input.js';
import {LuftApp} from '../../lib/luftApp.js';
import {windows} from '../../lib/processes.js';
import {pause} from '../../lib/wait.js';
import {openApp} from '../lib/apps.js';

const {require, eventually} = checks('Luft app');
const ID = 'com.lantharos.mailman';
const IDLE_MEMORY_MB = 24;
const SETTLE = 3000;
const QUIT_TIMEOUT = 5000;
const REOPEN_TIMEOUT = 15000;

const mailmanWindow = () => windows().find(window => window.get_wm_class() === ID && window.get_compositor_private()?.mapped);
const listed = () => Shell.AppSystem.get_default().get_running().some(app => app.get_id().startsWith(ID));

export async function checkBackground() {
  const app = await openApp('mailman');
  try {
    app.window.delete(global.get_current_time());
    await eventually(() => !mailmanWindow(), 'closing Mailman closes its window');
    await pause(SETTLE);
    require(app.running, 'Mailman keeps running after its window closes');
    require(!listed(), 'a closed Mailman is not shown among the open apps');
    const memory = app.residentMb;
    require(memory < IDLE_MEMORY_MB, `Mailman uses ${memory.toFixed(1)} MB while its window is closed`);

    await new LuftApp('mailman').finished(QUIT_TIMEOUT);
    await eventually(mailmanWindow, 'opening Mailman again brings its window back', REOPEN_TIMEOUT);
    const reopened = mailmanWindow();
    reopened.activate(global.get_current_time());
    await eventually(() => reopened.has_focus(), 'the window that comes back takes focus');
    await pause(SETTLE);
    press(Clutter.KEY_Control_L, Clutter.KEY_q);
    await app.finished(QUIT_TIMEOUT);
    await eventually(() => !mailmanWindow(), 'Ctrl+Q quits Mailman with its window');
  } finally {
    await app.close();
  }
}
