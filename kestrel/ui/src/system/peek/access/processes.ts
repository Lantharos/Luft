import GLib from 'gi://GLib';

const decoder = new TextDecoder();
const UNIT = /\.(?:scope|service)$/;

export interface ProcessStat {
  readonly parent: number;
  readonly started: number;
}

function read(path: string): string | null {
  try {
    return decoder.decode(GLib.file_get_contents(path)[1]);
  } catch {
    return null;
  }
}

export class PidFd {
  constructor(readonly fd: number) {}

  get pid(): number | null {
    const pid = Number(/^Pid:\s*(-?\d+)$/m.exec(read(`/proc/self/fdinfo/${this.fd}`) ?? '')?.[1] ?? -1);
    return pid > 0 ? pid : null;
  }

  close(): void {
    GLib.close(this.fd);
  }
}

export function cgroupOf(pid: number | 'self'): string | null {
  return read(`/proc/${pid}/cgroup`)?.split('\n').find(line => line.startsWith('0::'))?.slice(3) ?? null;
}

export function statOf(pid: number): ProcessStat | null {
  const stat = read(`/proc/${pid}/stat`);
  if (!stat) return null;
  const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
  return { parent: Number(fields[1]), started: Number(fields[19]) };
}

export function unitOf(cgroup: string): string | null {
  const parts = cgroup.split('/');
  while (parts.length && !UNIT.test(parts.at(-1)!)) parts.pop();
  return parts.length ? parts.join('/') : null;
}

export function unitName(unit: string): string {
  return unit.slice(unit.lastIndexOf('/') + 1);
}

export function unitPopulated(unit: string): boolean {
  return /^populated 1$/m.test(read(`/sys/fs/cgroup${unit}/cgroup.events`) ?? '');
}

export function processUnit(pid: number): string | null {
  const cgroup = cgroupOf(pid);
  return cgroup && unitOf(cgroup);
}
