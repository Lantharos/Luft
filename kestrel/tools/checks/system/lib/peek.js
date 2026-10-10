import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GdkPixbuf from 'gi://GdkPixbuf';

import {shownStyled} from '../../lib/actors.js';
import {fixture, repository, spawn} from '../../lib/processes.js';

const PEEK = repository('kestrel', 'peek', 'target', 'release', 'peek');

export const HANDLE = /^[a-z][a-z0-9]{9}$/;
export const peekDialog = () => shownStyled('kestrel-peek-dialog');

function outcome(argv) {
  const process = spawn(argv, {flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE});
  return new Promise((resolve, reject) => process.communicate_utf8_async(null, null, (_process, result) => {
    try {
      const [, stdout, stderr] = process.communicate_utf8_finish(result);
      resolve({ok: process.get_successful(), stdout: stdout.trim(), stderr: stderr.trim()});
    } catch (error) {
      reject(error);
    }
  }));
}

export function peek(...args) {
  return outcome([PEEK, ...args]);
}

export function runTarget(title, ...options) {
  return peek('run', ...options, '--', 'gjs', '-m', fixture('clients', 'peekTarget.js'), title);
}

export async function windowsOf(handle) {
  const listed = await peek('list', handle, '--json');
  if (!listed.ok) throw new Error(`peek list ${handle} failed: ${listed.stderr}`);
  return JSON.parse(listed.stdout);
}

export async function titleOf(handle) {
  return (await windowsOf(handle))[0]?.title ?? null;
}

export function pngSize(path) {
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file(path);
  return [pixbuf.get_width(), pixbuf.get_height()];
}

export function oldScreenshot(filename) {
  return outcome(['gdbus', 'call', '--session', '--dest', 'org.gnome.Shell.Screenshot', '--object-path', '/org/gnome/Shell/Screenshot',
    '--method', 'org.gnome.Shell.Screenshot.Screenshot', 'false', 'false', filename]);
}

export async function scopeActive(handle) {
  return (await outcome(['systemctl', '--user', 'is-active', `peek-${handle}.scope`])).stdout === 'active';
}

export async function endProgram(handle) {
  const group = (await outcome(['systemctl', '--user', 'show', '--property=ControlGroup', '--value', `peek-${handle}.scope`])).stdout;
  const [, pids] = GLib.file_get_contents(`/sys/fs/cgroup${group}/program/cgroup.procs`);
  for (const pid of new TextDecoder().decode(pids).split('\n').filter(Boolean))
    GLib.spawn_command_line_sync(`kill ${pid}`);
}

export function displayLeftovers(handle) {
  const runtime = GLib.get_user_runtime_dir();
  return [`${runtime}/peek/${handle}`, `${runtime}/peek-${handle}`].filter(path => GLib.file_test(path, GLib.FileTest.EXISTS));
}
