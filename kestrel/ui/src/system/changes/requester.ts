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
 * Who asked luft: the first app among the programs that started it, such as
 * the terminal it runs in, or else the program that ran it, past the shells
 * in between, named the way every prompt names a program.
 */
export function requester(pid: number): string | null {
  let program: string | null = null;
  for (let current: number | null = parentOf(pid), steps = 0; current && steps < FURTHEST; current = parentOf(current), steps++) {
    const identity = identifyProcess(current);
    if (!identity) break;
    if ('program' in identity && SHELLS.has(GLib.path_get_basename(identity.program))) continue;
    const { name, app } = verifiedApp(identity);
    if (app) return name;
    program ??= name;
  }
  return program;
}
