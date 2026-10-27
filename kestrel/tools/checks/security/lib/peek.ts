import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

import {shownStyled} from '../../lib/actors.js';
import {inAppScope} from '../../lib/access/sandbox.js';
import {builtFixture, outcome, repository} from '../../lib/processes.js';

const PEEK = repository('target', 'release', 'peek');

export interface PeekWindow {
  id: number;
  title: string;
  access: string;
  handle: string;
  width: number;
  height: number;
}

export const HANDLE = /^[a-z][a-z0-9]{9}$/;
export const peekDialog = () => shownStyled('kestrel-peek-dialog');

export function peek(...args: string[]) {
  return outcome([PEEK, ...args]);
}

export function peekInScopeOf(appId: string, ...args: string[]) {
  return outcome(inAppScope(appId, [PEEK, ...args]));
}

export function runTarget(title: string, ...options: string[]) {
  return peek('run', ...options, '--', 'gjs', '-m', builtFixture('clients', 'apps', 'peekTarget.js'), title);
}

export async function windowsOf(handle: string): Promise<PeekWindow[]> {
  const listed = await peek('list', handle, '--json');
  if (!listed.ok) throw new Error(`peek list ${handle} failed: ${listed.stderr}`);
  return JSON.parse(listed.stdout);
}

export async function titleOf(handle: string) {
  return (await windowsOf(handle))[0]?.title ?? null;
}

export function pngSize(path: string) {
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file(path);
  return [pixbuf.get_width(), pixbuf.get_height()];
}

export function oldScreenshot(filename: string) {
  return outcome(['gdbus', 'call', '--session', '--dest', 'org.gnome.Shell.Screenshot', '--object-path', '/org/gnome/Shell/Screenshot',
    '--method', 'org.gnome.Shell.Screenshot.Screenshot', 'false', 'false', filename]);
}

export async function scopeActive(handle: string) {
  return (await outcome(['systemctl', '--user', 'is-active', `peek-${handle}.scope`])).stdout === 'active';
}

export async function endProgram(handle: string) {
  const group = (await outcome(['systemctl', '--user', 'show', '--property=ControlGroup', '--value', `peek-${handle}.scope`])).stdout;
  const [, pids] = GLib.file_get_contents(`/sys/fs/cgroup${group}/program/cgroup.procs`);
  for (const pid of new TextDecoder().decode(pids).split('\n').filter(Boolean))
    GLib.spawn_command_line_sync(`kill ${pid}`);
}

export function displayLeftovers(handle: string) {
  const runtime = GLib.get_user_runtime_dir();
  return [`${runtime}/peek/${handle}`, `${runtime}/peek-${handle}`].filter(path => GLib.file_test(path, GLib.FileTest.EXISTS));
}
