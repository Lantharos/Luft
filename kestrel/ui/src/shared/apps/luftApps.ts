import type Meta from 'gi://Meta';

import { developmentPath } from './development.js';
import { identifyProcess } from './identity.js';

const LUFT_APP = 'com.lantharos.';
const INSTALLED_APP = /^\/usr\/lib\/sabine\/com\.lantharos\.[^/]+\//;
const BUILT_APPS = developmentPath('KESTREL_LUFT_APPS');

function isLuftProgram(path: string): boolean {
  return INSTALLED_APP.test(path) || (!!BUILT_APPS && path.startsWith(`${BUILT_APPS}/`));
}

export function luftAppPrograms(appId: string): string[] {
  const built = BUILT_APPS ? [`${BUILT_APPS}/${appId.slice(LUFT_APP.length).toLowerCase()}`] : [];
  return [`/usr/lib/sabine/${appId}/`, ...built];
}

export function systemPrograms(name: string): string[] {
  return [`/usr/libexec/${name}`, ...(BUILT_APPS ? [`${BUILT_APPS}/${name}`] : [])];
}

export const runsProgram = (program: string, programs: string[]) =>
  programs.some(entry => program === entry || (entry.endsWith('/') && program.startsWith(entry)));

export function isLuftAppWindow(window: Meta.Window): boolean {
  if (!window.is_unsandboxed()) return false;
  const identity = identifyProcess(window.get_pid() as number);
  return !!identity && 'program' in identity && isLuftProgram(identity.program);
}
