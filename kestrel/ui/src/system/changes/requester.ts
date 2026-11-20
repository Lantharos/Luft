import { launchers } from '../../shared/apps/identity.js';

/**
 * Who asked luft: the first app among the programs that started it, such as
 * the terminal it runs in, or else the program that ran it, named the way
 * every prompt names a program.
 */
export function requester(pid: number): string | null {
  let program: string | null = null;
  for (const { name, app } of launchers(pid)) {
    if (app) return name;
    program ??= name;
  }
  return program;
}
