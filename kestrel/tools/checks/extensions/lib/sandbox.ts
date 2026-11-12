import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {install, ownFolder, rewrite} from './extensions.js';

const PAGE_KIB = 4;
const decoder = new TextDecoder();

function read(path: string): string | null {
  try {
    return decoder.decode(GLib.file_get_contents(path)[1]);
  } catch {
    return null;
  }
}

function processes(): string[] {
  const enumerator = Gio.File.new_for_path('/proc').enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const pids: string[] = [];
  for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null)) if (/^\d+$/.test(info.get_name())) pids.push(info.get_name());
  return pids;
}

const parentOf = (pid: string) => read(`/proc/${pid}/status`)?.match(/^PPid:\s+(\d+)/m)?.[1] ?? null;

export function hostsOf(id: string, folder = ownFolder(id)): string[] {
  return processes().filter(pid => {
    if (read(`/proc/${pid}/cmdline`) !== '/usr/bin/gjs\0-m\0/host.js\0') return false;
    const parent = parentOf(pid);
    return !!parent && (read(`/proc/${parent}/cmdline`) ?? '').split('\0').includes(folder);
  });
}

export function privateKib(pid: string): number {
  const [, resident, shared] = (read(`/proc/${pid}/statm`) ?? '0 0 0').split(' ').map(Number);
  return (resident - shared) * PAGE_KIB;
}

export function installOwn(fixture: string, id: string, change: (manifest: string) => string = text => text) {
  install(fixture, id, ownFolder);
  rewrite(GLib.build_filenamev([ownFolder(id), 'extension.toml']), text => change(text.replace(/^id = ".*"$/m, `id = "${id}"`)));
}

export function longestStall(): {stop(): number} {
  let last = GLib.get_monotonic_time();
  let longest = 0;
  const source = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
    const now = GLib.get_monotonic_time();
    longest = Math.max(longest, now - last);
    last = now;
    return GLib.SOURCE_CONTINUE;
  });
  return {
    stop: () => {
      GLib.source_remove(source);
      return longest / 1000;
    },
  };
}
