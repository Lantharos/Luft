import { readProcFile as read } from '../../../shared/dbus/processes.js';

const UNIT = /\.(?:scope|service)$/;

export interface ProcessStat {
  readonly parent: number;
  readonly started: number;
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

function unitOf(cgroup: string): string | null {
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
