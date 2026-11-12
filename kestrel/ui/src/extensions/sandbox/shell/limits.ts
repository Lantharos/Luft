import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SYSTEMD = 'org.freedesktop.systemd1';
const SYSTEMD_PATH = '/org/freedesktop/systemd1';
const MANAGER = 'org.freedesktop.systemd1.Manager';
const MOST_MEMORY = 768 * 1024 * 1024;
const MOST_TASKS = 64;
const CPU_WEIGHT = 20;
const CALL_TIMEOUT = 5000;

const unitName = (id: string, pid: number) => `app-kestrel-extension-${id.replace(/[^A-Za-z0-9:_.]/g, '_')}-${pid}.scope`;

export async function limitScope(id: string, pid: number): Promise<void> {
  const properties: [string, GLib.Variant][] = [
    ['Description', GLib.Variant.new_string(`Extension ${id}, sandboxed by Kestrel`)],
    ['Slice', GLib.Variant.new_string('app.slice')],
    ['PIDs', new GLib.Variant('au', [pid])],
    ['MemoryMax', new GLib.Variant('t', MOST_MEMORY)],
    ['MemorySwapMax', new GLib.Variant('t', 0)],
    ['TasksMax', new GLib.Variant('t', MOST_TASKS)],
    ['CPUWeight', new GLib.Variant('t', CPU_WEIGHT)],
    ['CollectMode', GLib.Variant.new_string('inactive-or-failed')],
  ];
  try {
    await Gio.DBus.session.call(SYSTEMD, SYSTEMD_PATH, MANAGER, 'StartTransientUnit', new GLib.Variant('(ssa(sv)a(sa(sv)))', [unitName(id, pid), 'fail', properties, []]),
      null, Gio.DBusCallFlags.NO_AUTO_START, CALL_TIMEOUT, null);
  } catch (error) {
    console.warn(`The sandbox of ${id} runs without a systemd scope of its own: ${(error as Error).message}`);
  }
}
