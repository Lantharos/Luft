import Gio from 'gi://Gio';

import { callerOwns, callerProcess, readProcFile } from './processes.js';

const SETGID = 0o2000;
const WRITABLE_BY_OTHERS = 0o022;
const USER = new Gio.Credentials().get_unix_user();

function groupOf(program: string): number | null {
  try {
    const info = Gio.File.new_for_path(program).query_info('unix::uid,unix::gid,unix::mode', Gio.FileQueryInfoFlags.NONE, null);
    const mode = info.get_attribute_uint32('unix::mode');
    const group = info.get_attribute_uint32('unix::gid');
    const protectedByRoot = info.get_attribute_uint32('unix::uid') === 0 && !(mode & WRITABLE_BY_OTHERS);
    return protectedByRoot && mode & SETGID && group !== 0 ? group : null;
  } catch {
    return null;
  }
}

function ids(status: string, field: string): number[] {
  return new RegExp(`^${field}:(.*)$`, 'm').exec(status)?.[1].trim().split(/\s+/).map(Number) ?? [];
}

function startedWithGroup(status: string, group: number): boolean {
  const users = ids(status, 'Uid');
  const [real, effective] = ids(status, 'Gid');
  return users.length > 0 && users.every(id => id === USER) && ids(status, 'TracerPid').join() === '0' &&
    real !== effective && effective === group;
}

async function callerStartedShielded(invocation: Gio.DBusMethodInvocation, program: string): Promise<boolean> {
  const group = groupOf(program);
  if (group === null) return false;
  const process = await callerProcess(invocation).catch(() => null);
  if (!process) return false;
  try {
    const pid = process.pid;
    const status = pid && readProcFile(`/proc/${pid}/status`);
    return !!status && startedWithGroup(status, group) && process.pid === pid;
  } finally {
    process.close();
  }
}

export async function callerIsShielded(invocation: Gio.DBusMethodInvocation, name: string, program: string): Promise<boolean> {
  return await callerOwns(invocation, name) && await callerStartedShielded(invocation, program);
}
