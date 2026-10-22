import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { callerProcess, readProcFile } from '../../shared/dbus/processes.js';
import { answerOf, FULL_ACCESS, lookup } from '../../shared/dbus/permissionStore.js';

const SANDBOX_INFO = '/.flatpak-info';

type Sandbox = { kind: 'none' } | { kind: 'app'; app: string } | { kind: 'unknown' };

const mountsSandboxInfo = (pid: number) =>
  readProcFile(`/proc/${pid}/mountinfo`)?.split('\n').some(line => line.split(' ')[4] === SANDBOX_INFO) ?? true;

function sandboxOf(pid: number): Sandbox {
  const info = new GLib.KeyFile();
  try {
    info.load_from_file(`/proc/${pid}/root${SANDBOX_INFO}`, GLib.KeyFileFlags.NONE);
    const app = info.get_string('Application', 'name');
    return app ? { kind: 'app', app } : { kind: 'unknown' };
  } catch (error) {
    if (error instanceof GLib.Error && error.matches(GLib.file_error_quark(), GLib.FileError.NOENT)) return { kind: 'none' };
    return mountsSandboxInfo(pid) ? { kind: 'unknown' } : { kind: 'none' };
  }
}

async function callerSandbox(invocation: Gio.DBusMethodInvocation): Promise<Sandbox> {
  const process = await callerProcess(invocation);
  if (!process) return { kind: 'unknown' };
  try {
    const pid = process.pid;
    const sandbox = pid === null ? null : sandboxOf(pid);
    return sandbox && process.pid === pid ? sandbox : { kind: 'unknown' };
  } finally {
    process.close();
  }
}

export async function sandboxed(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
  const sandbox = await callerSandbox(invocation);
  if (sandbox.kind !== 'app') return sandbox.kind === 'unknown';
  const apps = await lookup(invocation.get_connection(), FULL_ACCESS).catch(() => ({}));
  return answerOf(apps, sandbox.app) !== 'yes';
}
