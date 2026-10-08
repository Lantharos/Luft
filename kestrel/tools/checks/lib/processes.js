import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {waitUntil} from './wait.js';

const TOOLS = GLib.path_get_dirname(GLib.path_get_dirname(GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0])));
const OPEN_TIMEOUT = 15000;
const CLOSE_TIMEOUT = 5000;
const running = new Set();

export const repository = (...parts) => GLib.build_filenamev([TOOLS, '..', '..', ...parts]);
export const fixture = (...parts) => GLib.build_filenamev([TOOLS, 'fixtures', ...parts]);
export const scratch = (...parts) => GLib.build_filenamev([GLib.get_user_cache_dir(), ...parts]);

export function spawn(argv, {env = {}, flags = Gio.SubprocessFlags.NONE, cwd = null} = {}) {
  const launcher = new Gio.SubprocessLauncher({flags});
  for (const [name, value] of Object.entries(env)) {
    if (value === null) launcher.unsetenv(name);
    else launcher.setenv(name, value, true);
  }
  if (cwd) launcher.set_cwd(cwd);
  const process = launcher.spawnv(argv);
  running.add(process);
  process.exited = new Promise(resolve => process.wait_async(null, () => {
    running.delete(process);
    resolve();
  }));
  return process;
}

export function gjs(script, args = [], options = {}) {
  return spawn(['gjs', '-m', fixture(...script.split('/')), ...args], options);
}

export const windows = () => global.get_window_actors().map(actor => actor.meta_window);

const matcher = match => typeof match === 'function' ? match : window => window.get_title() === match;

export function findWindow(match) {
  return windows().find(matcher(match)) ?? null;
}

export async function waitForWindow(match, label = `a window titled ${match} opens`, timeout = OPEN_TIMEOUT) {
  const accepts = matcher(match);
  return waitUntil(() => windows().find(window => accepts(window) && window.get_compositor_private()?.mapped), label, timeout);
}

export async function waitForWindows(titles, timeout = OPEN_TIMEOUT) {
  return Promise.all(titles.map(title => waitForWindow(title, `a window titled ${title} opens`, timeout)));
}

export async function stop(process) {
  if (!running.has(process)) return;
  const pid = Number(process.get_identifier());
  process.force_exit();
  await process.exited;
  await waitUntil(() => !windows().some(window => window.get_pid() === pid), `the windows of process ${pid} close`, CLOSE_TIMEOUT);
}

export async function stopAll() {
  await Promise.all([...running].map(stop));
}

export function firstLine(process) {
  return new Promise(resolve => new Gio.DataInputStream({base_stream: process.get_stdout_pipe()})
    .read_line_async(GLib.PRIORITY_DEFAULT, null, (source, result) => resolve(source.read_line_finish_utf8(result)[0])));
}
