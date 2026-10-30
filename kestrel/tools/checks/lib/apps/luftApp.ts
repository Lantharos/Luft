import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import IBus from 'gi://IBus';
import type Meta from 'gi://Meta';

import {atSessionEnd} from '../../../automation/runner.js';
import {requireFresh} from './freshness.js';
import {prepareHome} from './home.js';
import {click, type Point} from '../input/input.js';
import {repository, spawn, type Process} from '../processes.js';
import {captureFrame, type Area, type Frame} from '../screenshots.js';
import {pause, settled, Timeout, waitUntil, type Truthy} from '../wait.js';

const FIRST_PAINT = 'browser.first_paint';
const LIFECYCLE = /\blifecycle\.(active|suspended|frozen)\./;
const LAUNCH_TIMEOUT = 30000;
const SHOW_TIMEOUT = 5000;
const LOG_LINES = 40;
const SETTLE_TIMEOUT = 5000;
const SETTLE_INTERVAL = 50;
const CHANGE_TIMEOUT = 5000;
const SABINE = GLib.build_filenamev([GLib.get_user_data_dir(), 'sabine']);

interface Service {
  stop(): Promise<void>;
}

interface LifecycleChange {
  state: string;
  at: number;
}

let home: string | null = null;
let service: Promise<Service> | null = null;

function environment(manifest: string | null = null): Record<string, string | null> {
  home ??= prepareHome();
  const ibus = IBus.get_address();
  return {
    LD_LIBRARY_PATH: null,
    GI_TYPELIB_PATH: null,
    HOME: home,
    SABINE_TRACE: '1',
    XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR'),
    WAYLAND_DISPLAY: GLib.build_filenamev([GLib.get_user_runtime_dir(), GLib.getenv('WAYLAND_DISPLAY')!]),
    ...manifest && {SABINE_MANIFEST_PATH: manifest},
    ...ibus && {IBUS_ADDRESS: ibus},
  };
}

function command(name: string) {
  requireFresh(name);
  const app = repository('apps', name);
  return {path: repository('target/release', name), manifest: GLib.build_filenamev([app, 'Sabine.toml'])};
}

export const appBinary = (name: string) => command(name).path;

/** Starts an app with its output in a file instead of a pipe to Kestrel, so it keeps running when Kestrel stops. */
export function launchDetached(name: string, log: string): number {
  const {path, manifest} = command(name);
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.STDOUT_SILENCE});
  for (const [variable, value] of Object.entries(environment(manifest))) {
    if (value === null) launcher.unsetenv(variable);
    else launcher.setenv(variable, value, true);
  }
  launcher.set_stderr_file_path(log);
  launcher.set_cwd(home!);
  return Number(launcher.spawnv([path]).get_identifier());
}

function inScope(slice: string, id: string, argv: string[]) {
  const unit = `app-${id}-${GLib.random_int()}.scope`;
  const app = ['env', `XDG_RUNTIME_DIR=${GLib.getenv('KESTREL_APP_RUNTIME_DIR')}`, ...argv];
  return ['systemd-run', '--user', '--scope', '--quiet', '--collect', `--slice=${slice}`, `--unit=${unit}`, '--', ...app];
}

function readLines(stream: Gio.InputStream, onLine: (line: string) => void) {
  const lines = new Gio.DataInputStream({base_stream: stream});
  const next = () => lines.read_line_async(GLib.PRIORITY_DEFAULT, null, (_source, result) => {
    const [line] = lines.read_line_finish_utf8(result);
    if (line === null) return;
    onLine(line);
    next();
  });
  next();
}

const exited = (process: Gio.Subprocess) => new Promise<void>(resolve => process.wait_async(null, () => resolve()));
const readJson = (path: string) => JSON.parse(new TextDecoder().decode(GLib.file_get_contents(path)[1]));

async function startSabineService(): Promise<Service> {
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE});
  for (const [name, value] of Object.entries(environment())) {
    if (value === null) launcher.unsetenv(name);
    else launcher.setenv(name, value, true);
  }
  launcher.set_cwd(home!);
  const {active} = readJson(GLib.build_filenamev([SABINE, 'bin/current.json']));
  const daemon = launcher.spawnv([GLib.build_filenamev([SABINE, 'bin/versions', active, 'sabine-service-daemon'])]);
  const state = GLib.build_filenamev([SABINE, 'daemon-state.json']);
  await waitUntil(() => GLib.file_test(state, GLib.FileTest.EXISTS) && readJson(state).pid === Number(daemon.get_identifier()),
    'the Sabine service starts');
  return {stop: async () => {
    daemon.send_signal(15);
    await exited(daemon);
  }};
}

export function sabineService(): Promise<Service> {
  if (!service) {
    const started = startSabineService();
    service = started;
    atSessionEnd(async () => (await started).stop());
  }
  return service;
}

export class LuftApp {
  readonly name: string;
  readonly id: string;
  readonly lifecycle: LifecycleChange[] = [];
  window!: Meta.Window;
  private _log: string[] = [];
  private readonly _process: Process;
  private _painted = false;
  private _exited = false;

  constructor(name: string, args: string[] = [], env: Record<string, string | null> = {}, {slice = null}: {slice?: string | null} = {}) {
    this.name = name;
    this.id = `com.lantharos.${name}`;
    const {path, manifest} = command(name);
    if (!GLib.file_test(path, GLib.FileTest.IS_EXECUTABLE))
      throw new Error(`${name} is not built at ${path}`);
    const argv = slice ? inScope(slice, this.id, [path, ...args]) : [path, ...args];
    const scoped: Record<string, string> = slice ? {XDG_RUNTIME_DIR: GLib.get_user_runtime_dir()} : {};
    this._process = spawn(argv, {env: {...environment(manifest), ...env, ...scoped}, flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_PIPE, cwd: home});
    this._process.exited.then(() => (this._exited = true));
    readLines(this._process.get_stderr_pipe()!, line => {
      this._log = [...this._log.slice(1 - LOG_LINES), line];
      this._painted ||= line.includes(`[${this.id}]`) && line.endsWith(FIRST_PAINT);
      const [, state] = line.match(LIFECYCLE) ?? [];
      if (state) this.lifecycle.push({state, at: GLib.get_monotonic_time()});
    });
  }

  async waitUntil<T>(condition: () => T | Promise<T>, label: string, timeout?: number): Promise<Truthy<T>> {
    try {
      return await waitUntil(condition, label, timeout);
    } catch (error) {
      if (error instanceof Timeout) error.message += `\n${this.log}`;
      throw error;
    }
  }

  get log() {
    return this._log.join('\n');
  }

  get running() {
    return !this._exited;
  }

  get pid() {
    return Number(this._process.get_identifier());
  }

  get residentMb() {
    const [, status] = GLib.file_get_contents(`/proc/${this.pid}/status`);
    return Number(/VmRSS:\s+(\d+)/.exec(new TextDecoder().decode(status))![1]) / 1024;
  }

  async open() {
    await this.waitUntil(() => this._painted || this._exited, `${this.name} paints`, LAUNCH_TIMEOUT);
    if (!this._painted) throw new Error(`${this.name} exited before it painted:\n${this.log}`);
    this.window = await this.waitUntil(() => global.get_window_actors()
      .find(actor => actor.mapped && actor.meta_window?.get_wm_class() === this.id)?.meta_window, `${this.name} shows its window`, SHOW_TIMEOUT);
    this.window.activate(global.get_current_time());
  }

  at([x, y]: Point): Point {
    const frame = this.window.get_frame_rect();
    return [frame.x + x, frame.y + y];
  }

  area({x, y, width, height}: {x: number; y: number; width: number; height?: number}): Area {
    const frame = this.window.get_frame_rect();
    return {x: frame.x + x, y: frame.y + y, width, height: height ?? frame.height - y};
  }

  click(point: Point, button: number = Clutter.BUTTON_PRIMARY) {
    click(this.at(point), button);
  }

  frame(area: Area = this.window.get_frame_rect()) {
    return captureFrame(area);
  }

  async settle(condition: (frame: Frame) => boolean, area?: Area): Promise<Frame> {
    const deadline = GLib.get_monotonic_time() + SETTLE_TIMEOUT * 1000;
    let previous: Frame | null = null;
    for (;;) {
      const current = await this.frame(area);
      if ((current.same(previous) && condition(current)) || GLib.get_monotonic_time() > deadline) return current;
      previous = current;
      await pause(SETTLE_INTERVAL);
    }
  }

  async changes(before: Frame, label: string, area?: Area): Promise<Frame> {
    await this.waitUntil(async () => !(await this.frame(area)).looksLike(before), label, CHANGE_TIMEOUT);
    await settled();
    return this.frame(area);
  }

  async reaches(state: string, since: number, milliseconds?: number): Promise<number> {
    const reached = () => this.lifecycle.find(change => change.state === state && change.at >= since);
    await this.waitUntil(reached, `${this.name} becomes ${state}`, milliseconds);
    return (reached()!.at - since) / 1000;
  }

  async finished(milliseconds?: number) {
    await this.waitUntil(() => this._exited, `${this.name} exits`, milliseconds);
  }

  async close() {
    if (this._exited) return;
    this._process.send_signal(15);
    await this._process.exited;
  }
}
