import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

const INSTALLED_APP = /^\/usr\/lib\/sabine\/com\.lantharos\.[^/]+\//;
const BUILT_APPS = GLib.getenv('KESTREL_LUFT_APPS');

function programOf(pid: number): string | null {
  try {
    return GLib.file_read_link(`/proc/${pid}/exe`);
  } catch {
    return null;
  }
}

function isLuftProgram(path: string): boolean {
  return INSTALLED_APP.test(path) || (!!BUILT_APPS && path.startsWith(`${BUILT_APPS}/`));
}

export function isLuftAppWindow(window: Meta.Window): boolean {
  if (!window.is_unsandboxed()) return false;
  const program = programOf(window.get_pid() as number);
  return !!program && isLuftProgram(program);
}
