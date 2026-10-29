import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import { identifyProcess } from './identity.js';

const INSTALLED_APP = /^\/usr\/lib\/sabine\/com\.lantharos\.[^/]+\//;
const BUILT_APPS = GLib.getenv('KESTREL_LUFT_APPS');

function isLuftProgram(path: string): boolean {
  return INSTALLED_APP.test(path) || (!!BUILT_APPS && path.startsWith(`${BUILT_APPS}/`));
}

export function isLuftAppWindow(window: Meta.Window): boolean {
  if (!window.is_unsandboxed()) return false;
  const identity = identifyProcess(window.get_pid() as number);
  return !!identity && 'program' in identity && isLuftProgram(identity.program);
}
