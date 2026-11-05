import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export interface ThreadUse {
  name: string;
  /** Nanoseconds on a processor. */
  onCpu: number;
  /** How many times it stopped and was woken again. */
  switches: number;
}

/** Every thread of Kestrel by its id, for comparing what they did between two moments. */
export function threads() {
  const tasks = Gio.File.new_for_path('/proc/self/task').enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const found = new Map<string, ThreadUse>();
  const decode = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
  for (let info: Gio.FileInfo | null; (info = tasks.next_file(null));) {
    const folder = `/proc/self/task/${info.get_name()}`;
    const status = decode(`${folder}/status`);
    found.set(info.get_name(), {
      name: decode(`${folder}/comm`).trim(),
      onCpu: Number(decode(`${folder}/schedstat`).split(' ')[0]),
      switches: Number(/\nvoluntary_ctxt_switches:\s+(\d+)/.exec(status)![1]) + Number(/nonvoluntary_ctxt_switches:\s+(\d+)/.exec(status)![1]),
    });
  }
  return found;
}
