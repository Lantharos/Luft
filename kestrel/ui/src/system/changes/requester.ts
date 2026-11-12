import GLib from 'gi://GLib';

import { identifyProcess, verifiedApp } from '../../shared/apps/identity.js';
import { readProcFile } from '../../shared/dbus/processes.js';

const SHELLS = new Set(['bash', 'sh', 'zsh', 'fish', 'dash', 'env', 'nohup', 'timeout', 'sudo']);
const FURTHEST = 8;

function parentOf(pid: number): number | null {
  const stat = readProcFile(`/proc/${pid}/stat`);
  const parent = Number(stat?.slice(stat.lastIndexOf(') ') + 2).split(' ')[1]);
  return parent > 1 ? parent : null;
}

/**
 * The program luft asks for: whatever started it, past the shells in
 * between, named the way every prompt names a program, by what it runs.
 */
export function requester(pid: number): string | null {
  for (let current: number | null = parentOf(pid), steps = 0; current && steps < FURTHEST; current = parentOf(current), steps++) {
    const identity = identifyProcess(current);
    if (!identity) return null;
    if ('program' in identity && SHELLS.has(GLib.path_get_basename(identity.program))) continue;
    return verifiedApp(identity).name;
  }
  return null;
}
