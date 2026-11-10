import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import { identifyProcess } from '../apps/identity.js';
import { runsProgram } from '../apps/luftApps.js';
import { processOf } from './processes.js';

Gio._promisify(Meta.Context.prototype, 'identify_sender');

export type Caller = { kind: 'you' } | { kind: 'app'; app: string } | { kind: 'unknown' };

export async function identify(invocation: Gio.DBusMethodInvocation): Promise<Caller> {
  try {
    const app = await global.context.identify_sender(invocation.get_connection(), invocation.get_sender()!, null);
    return app ? { kind: 'app', app } : { kind: 'you' };
  } catch {
    return { kind: 'unknown' };
  }
}

export async function sandboxed(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
  return (await identify(invocation)).kind !== 'you';
}

export async function refuseSandboxed(invocation: Gio.DBusMethodInvocation, action: string): Promise<boolean> {
  if (!await sandboxed(invocation)) return false;
  invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', `Sandboxed apps cannot ${action}`);
  return true;
}

export async function connectionRuns(connection: Gio.DBusConnection, name: string, programs: string[]): Promise<boolean> {
  const process = await processOf(connection, name).catch(() => null);
  if (!process) return false;
  try {
    const pid = process.pid;
    const identity = pid ? identifyProcess(pid) : null;
    return !!identity && 'program' in identity && runsProgram(identity.program, programs) && process.pid === pid;
  } finally {
    process.close();
  }
}

export const callerRuns = (invocation: Gio.DBusMethodInvocation, programs: string[]) =>
  connectionRuns(invocation.get_connection(), invocation.get_sender()!, programs);
