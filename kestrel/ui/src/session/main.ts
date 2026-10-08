import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';

import { SessionManager } from './manager/sessionManager.js';

const SIGTERM = 15;
const SIGINT = 2;

Gio._promisify(Gio.DBusConnection.prototype, 'call');

const manager = new SessionManager();
const loop = new GLib.MainLoop(null, false);
for (const signal of [SIGTERM, SIGINT]) {
  GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, signal, () => {
    loop.quit();
    return GLib.SOURCE_REMOVE;
  });
}
loop.run();
manager.destroy();
