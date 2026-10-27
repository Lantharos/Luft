import GLib from 'gi://GLib';
import IBus from 'gi://IBus';
import {IBusManager} from 'resource:///com/lantharos/kestrel/kestrel.js';

const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);

export function inputMethodSettled() {
  const ibus = IBusManager.getIBusManager();
  const daemon = IBus.get_socket_path();
  if (!ibus.getEngineDesc('xkb:us::eng') || !GLib.file_test(daemon, GLib.FileTest.EXISTS)) return false;
  const address = read(daemon);
  const pid = address.match(/^IBUS_DAEMON_PID=(\d+)$/m)?.[1];
  return address.includes(`guid=${ibus.daemonGuid}`) && read(`/proc/${pid}/cmdline`).split('\0').includes('--xim');
}
