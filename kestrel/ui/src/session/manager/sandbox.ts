import type Gio from 'gi://Gio';

import { callerProcess, readProcFile } from '../../shared/dbus/processes.js';

const rootMountOf = (pid: number | 'self') => readProcFile(`/proc/${pid}/mountinfo`)?.split(' ', 1)[0] ?? null;

export async function sandboxed(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
  const process = await callerProcess(invocation);
  if (!process) return true;
  try {
    const pid = process.pid;
    return pid === null || rootMountOf(pid) !== rootMountOf('self') || process.pid !== pid;
  } finally {
    process.close();
  }
}
