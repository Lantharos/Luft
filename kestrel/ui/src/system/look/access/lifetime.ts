import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { unitPopulated } from './processes.js';

export function watchUnit(unit: string, ended: () => void): () => void {
  const monitor = Gio.File.new_for_path(`/sys/fs/cgroup${unit}/cgroup.events`).monitor_file(Gio.FileMonitorFlags.NONE, null);
  const end = () => {
    monitor.cancel();
    ended();
  };
  monitor.connect('changed', () => {
    if (!unitPopulated(unit)) end();
  });
  if (!unitPopulated(unit)) GLib.idle_add(GLib.PRIORITY_DEFAULT, () => (end(), GLib.SOURCE_REMOVE));
  return () => monitor.cancel();
}
