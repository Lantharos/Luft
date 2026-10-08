import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import IBus from 'gi://IBus';

import {atSessionEnd} from '../../automation/runner.js';
import {prepareHome} from './home.js';
import {click} from './input.js';
import {repository, spawn} from './processes.js';
import {captureFrame} from './screenshots.js';
import {pause, settled, Timeout, waitUntil} from './wait.js';

const FIRST_PAINT = 'browser.first_paint';
const LIFECYCLE = /\blifecycle\.(active|suspended|frozen)\./;
const LAUNCH_TIMEOUT = 30000;
const LOG_LINES = 40;
const SETTLE_TIMEOUT = 5000;
const SETTLE_INTERVAL = 50;
const CHANGE_TIMEOUT = 5000;
const DEV_APPS = (GLib.getenv('KESTREL_DEV_APPS') ?? '').split(',').filter(Boolean);
const SABINE = GLib.build_filenamev([GLib.get_user_data_dir(), 'sabine']);

let home = null;
let service = null;

function environment(manifest = null) {
  home ??= prepareHome();
  const ibus = IBus.get_address();
  return {
    LD_LIBRARY_PATH: null,
    GI_TYPELIB_PATH: null,
    HOME: home,
    SABINE_TRACE: '1',
    DBUS_SYSTEM_BUS_ADDRESS: GLib.getenv('KESTREL_SYSTEM_BUS'),
    XDG_RUNTIME_DIR: GLib.getenv('KESTREL_APP_RUNTIME_DIR'),
    WAYLAND_DISPLAY: GLib.build_filenamev([GLib.get_user_runtime_dir(), GLib.getenv('WAYLAND_DISPLAY')]),
    ...manifest && {SABINE_MANIFEST_PATH: manifest},
    ...ibus && {IBUS_ADDRESS: ibus},
  };
}

function command(name) {
  if (DEV_APPS.includes(name)) {
    const app = repository('apps', name);
    return {path: GLib.build_filenamev([app, 'desktop/target/release', name]), manifest: GLib.build_filenamev([app, 'Sabine.toml'])};
  }
  return {path: GLib.build_filenamev([GLib.get_home_dir(), '.local/share/sabine/apps', `com.lantharos.${name}`, 'install', name]), manifest: null};
}

function readLines(stream, onLine) {
  const lines = new Gio.DataInputStream({base_stream: stream});
  const next = () => lines.read_line_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
    const [line] = source.read_line_finish_utf8(result);
    if (line === null) return;
    onLine(line);
    next();
  });
  next();
}

const exited = process => new Promise(resolve => process.wait_async(null, () => resolve()));
const readJson = path => JSON.parse(new TextDecoder().decode(GLib.file_get_contents(path)[1]));

async function startSabineService() {
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE});
  for (const [name, value] of Object.entries(environment())) {
    if (value === null) launcher.unsetenv(name);
    else launcher.setenv(name, value, true);
  }
  launcher.set_cwd(home);
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

export function sabineService() {
  if (!service) {
    service = startSabineService();
    atSessionEnd(async () => (await service).stop());
  }
  return service;
}

export class LuftApp {
  constructor(name, args = []) {
    this.name = name;
    this.id = `com.lantharos.${name}`;
    this._log = [];
    const {path, manifest} = command(name);
    if (!GLib.file_test(path, GLib.FileTest.IS_EXECUTABLE))
      throw new Error(`${name} is not built at ${path}`);
    this._process = spawn([path, ...args], {env: environment(manifest), flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_PIPE, cwd: home});
    this._painted = false;
    this._exited = false;
    this.lifecycle = [];
    this._process.exited.then(() => (this._exited = true));
    readLines(this._process.get_stderr_pipe(), line => {
      this._log = [...this._log.slice(1 - LOG_LINES), line];
      this._painted ||= line.includes(`[${this.id}]`) && line.endsWith(FIRST_PAINT);
      const [, state] = line.match(LIFECYCLE) ?? [];
      if (state) this.lifecycle.push({state, at: GLib.get_monotonic_time()});
    });
  }

  async waitUntil(condition, label, timeout) {
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

  async open() {
    const started = GLib.get_monotonic_time();
    await this.waitUntil(() => this._painted || this._exited, `${this.name} paints`, LAUNCH_TIMEOUT);
    if (!this._painted) throw new Error(`${this.name} exited before it painted:\n${this.log}`);
    this.window = global.get_window_actors().map(actor => actor.meta_window).find(window => window.get_wm_class() === this.id);
    if (!this.window) throw new Error(`${this.name} painted without a window`);
    this.window.activate(global.get_current_time());
    return (GLib.get_monotonic_time() - started) / 1000;
  }

  at([x, y]) {
    const frame = this.window.get_frame_rect();
    return [frame.x + x, frame.y + y];
  }

  area({x, y, width, height}) {
    const frame = this.window.get_frame_rect();
    return {x: frame.x + x, y: frame.y + y, width, height: height ?? frame.height - y};
  }

  click(point, button = Clutter.BUTTON_PRIMARY) {
    click(this.at(point), button);
  }

  frame(area = this.window.get_frame_rect()) {
    return captureFrame(area);
  }

  async settle(condition, area) {
    const deadline = GLib.get_monotonic_time() + SETTLE_TIMEOUT * 1000;
    let previous = null;
    for (;;) {
      const current = await this.frame(area);
      if ((current.same(previous) && condition(current)) || GLib.get_monotonic_time() > deadline) return current;
      previous = current;
      await pause(SETTLE_INTERVAL);
    }
  }

  async changes(before, label, area) {
    await this.waitUntil(async () => !(await this.frame(area)).looksLike(before), label, CHANGE_TIMEOUT);
    await settled();
    return this.frame(area);
  }

  async reaches(state, since, milliseconds) {
    const reached = () => this.lifecycle.find(change => change.state === state && change.at >= since);
    await this.waitUntil(reached, `${this.name} becomes ${state}`, milliseconds);
    return (reached().at - since) / 1000;
  }

  async finished(milliseconds) {
    await this.waitUntil(() => this._exited, `${this.name} exits`, milliseconds);
  }

  async close() {
    if (this._exited) return;
    this._process.send_signal(15);
    await this._process.exited;
  }
}
