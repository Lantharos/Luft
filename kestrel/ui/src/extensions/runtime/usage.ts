import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const CLOCK_TICKS = 100;
const decoder = new TextDecoder();

export interface Usage {
  /** Share of one processor used since the extension started, from 0 to 1. */
  cpu: number;
  /** Bytes its helper keeps in memory, or 0 without one. */
  memory: number;
}

function proc(pid: string, file: string): string {
  try {
    return decoder.decode(GLib.file_get_contents(`/proc/${pid}/${file}`)[1]);
  } catch {
    return '';
  }
}

function helperCpuMicros(pid: string): number {
  const fields = proc(pid, 'stat').split(') ')[1]?.split(' ') ?? [];
  return (Number(fields[11] ?? 0) + Number(fields[12] ?? 0)) * GLib.USEC_PER_SEC / CLOCK_TICKS;
}

function helperMemory(pid: string): number {
  const resident = /^VmRSS:\s+(\d+) kB$/m.exec(proc(pid, 'status'));
  return resident ? Number(resident[1]) * 1024 : 0;
}

/** What an extension costs: time spent in its code on Kestrel's thread, and what its helpers use, read from /proc. */
export function measure(busyMicros: number, since: number, helpers: Iterable<Gio.Subprocess>): Usage {
  const pids = [...helpers].map(helper => helper.get_identifier()).filter(pid => pid !== null);
  const elapsed = Math.max(1, GLib.get_monotonic_time() - since);
  const cpu = busyMicros + pids.reduce((sum, pid) => sum + helperCpuMicros(pid), 0);
  return { cpu: cpu / elapsed, memory: pids.reduce((sum, pid) => sum + helperMemory(pid), 0) };
}
