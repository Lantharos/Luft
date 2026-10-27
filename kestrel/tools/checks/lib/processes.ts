import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import {waitUntil} from './wait.js';

const OPEN_TIMEOUT = 15000;
const CLOSE_TIMEOUT = 5000;
const running = new Set<Process>();

export type Process = Gio.Subprocess & {exited: Promise<void>};

export interface SpawnOptions {
  env?: Record<string, string | null>;
  flags?: Gio.SubprocessFlags;
  cwd?: string | null;
}

export type WindowMatch = string | ((window: Meta.Window) => boolean);

export const repository = (...parts: string[]) => GLib.build_filenamev([KESTREL_TOOLS.root, ...parts]);
export const fixture = (...parts: string[]) => repository('kestrel', 'tools', 'fixtures', ...parts);
export const builtFixture = (...parts: string[]) => GLib.build_filenamev([KESTREL_TOOLS.built, 'fixtures', ...parts]);
export const scratch = (...parts: string[]) => GLib.build_filenamev([GLib.get_user_cache_dir(), ...parts]);

export function spawn(argv: string[], {env = {}, flags = Gio.SubprocessFlags.NONE, cwd = null}: SpawnOptions = {}): Process {
  const launcher = new Gio.SubprocessLauncher({flags});
  for (const [name, value] of Object.entries(env)) {
    if (value === null) launcher.unsetenv(name);
    else launcher.setenv(name, value, true);
  }
  if (cwd) launcher.set_cwd(cwd);
  const subprocess = launcher.spawnv(argv);
  const process: Process = Object.assign(subprocess, {
    exited: new Promise<void>(resolve => subprocess.wait_async(null, () => {
      running.delete(process);
      resolve();
    })),
  });
  running.add(process);
  return process;
}

export interface Outcome {
  ok: boolean;
  stdout: string;
  stderr: string;
}

export function outcome(argv: string[], options: SpawnOptions = {}): Promise<Outcome> {
  const process = spawn(argv, {...options, flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE});
  return new Promise((resolve, reject) => process.communicate_utf8_async(null, null, (_process, result) => {
    try {
      const [, stdout, stderr] = process.communicate_utf8_finish(result);
      resolve({ok: process.get_successful(), stdout: stdout.trim(), stderr: stderr.trim()});
    } catch (error) {
      reject(error);
    }
  }));
}

export function gjs(script: string, args: string[] = [], options: SpawnOptions = {}): Process {
  return spawn(['gjs', '-m', builtFixture(...script.split('/')), ...args], {...options, env: {GSK_RENDERER: 'cairo', ...options.env}});
}

export const windows = (): Meta.Window[] => global.get_window_actors().flatMap(actor => actor.meta_window ?? []);

export function windowShown(window: Meta.Window): boolean {
  const actor = window.get_compositor_private();
  return actor instanceof Meta.WindowActor && actor.mapped;
}

const matcher = (match: WindowMatch) => typeof match === 'function' ? match : (window: Meta.Window) => window.get_title() === match;

export function findWindow(match: WindowMatch): Meta.Window | null {
  return windows().find(matcher(match)) ?? null;
}

export async function waitForWindow(match: WindowMatch, label = `a window titled ${match} opens`, timeout = OPEN_TIMEOUT): Promise<Meta.Window> {
  const accepts = matcher(match);
  return waitUntil(() => windows().find(window => accepts(window) && windowShown(window)), label, timeout);
}

export async function waitForWindows(titles: string[], timeout = OPEN_TIMEOUT): Promise<Meta.Window[]> {
  return Promise.all(titles.map(title => waitForWindow(title, `a window titled ${title} opens`, timeout)));
}

export async function stop(process: Process): Promise<void> {
  if (!running.has(process)) return;
  const pid = Number(process.get_identifier());
  process.force_exit();
  await process.exited;
  await waitUntil(() => !windows().some(window => window.get_pid() === pid), `the windows of process ${pid} close`, CLOSE_TIMEOUT);
}

export async function stopAll(): Promise<void> {
  await Promise.all([...running].map(stop));
}

export function firstLine(process: Gio.Subprocess): Promise<string | null> {
  const stream = new Gio.DataInputStream({base_stream: process.get_stdout_pipe()!});
  return new Promise(resolve => stream.read_line_async(GLib.PRIORITY_DEFAULT, null, (_source, result) => resolve(stream.read_line_finish_utf8(result)[0])));
}

export function outputLines(process: Gio.Subprocess): string[] {
  const stream = new Gio.DataInputStream({base_stream: process.get_stdout_pipe()!});
  const lines: string[] = [];
  const readLine = () => stream.read_line_async(GLib.PRIORITY_DEFAULT, null, (_source, result) => {
    const [line] = stream.read_line_finish_utf8(result);
    if (line === null) return;
    lines.push(line);
    readLine();
  });
  readLine();
  return lines;
}
