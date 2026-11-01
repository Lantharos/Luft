import GLib from 'gi://GLib';
import IBus from 'gi://IBus';
import {IBusManager} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {spawn} from '../processes.js';

const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);

let wokeXwayland = false;

/** Xwayland starts with its first X11 client, and IBus restarts with it to serve X11 apps. */
function wakeXwayland() {
  if (wokeXwayland) return;
  wokeXwayland = true;
  spawn(['xprop', '-root', '-len', '0']);
}

export function inputMethodSettled() {
  wakeXwayland();
  const ibus = IBusManager.getIBusManager();
  const daemon = IBus.get_socket_path();
  if (!ibus.getEngineDesc('xkb:us::eng') || !GLib.file_test(daemon, GLib.FileTest.EXISTS)) return false;
  const address = read(daemon);
  const pid = address.match(/^IBUS_DAEMON_PID=(\d+)$/m)?.[1];
  return address.includes(`guid=${ibus.daemonGuid}`) && read(`/proc/${pid}/cmdline`).split('\0').includes('--xim');
}
