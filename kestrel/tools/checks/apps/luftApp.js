import Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import IBus from 'gi://IBus';
import Shell from 'gi://Shell';

import {prepareHome} from './home.js';

const FIRST_PAINT = 'browser.first_paint';
const LAUNCH_TIMEOUT = 30000;
const LOG_LINES = 40;
const SETTLE_TIMEOUT = 5000;
const TYPED = 300;
const REPOSITORY = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', '..', '..']);
const DEV_APPS = (GLib.getenv('KESTREL_DEV_APPS') ?? '').split(',').filter(Boolean);
const SABINE = GLib.build_filenamev([GLib.get_user_data_dir(), 'sabine']);

let home = null;

function launcher(flags, manifest = null) {
  home ??= prepareHome();
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.STDOUT_SILENCE | flags});
  launcher.unsetenv('LD_LIBRARY_PATH');
  launcher.unsetenv('GI_TYPELIB_PATH');
  launcher.setenv('HOME', home, true);
  launcher.setenv('SABINE_TRACE', '1', true);
  launcher.setenv('DBUS_SYSTEM_BUS_ADDRESS', GLib.getenv('KESTREL_SYSTEM_BUS'), true);
  launcher.setenv('XDG_RUNTIME_DIR', GLib.getenv('KESTREL_APP_RUNTIME_DIR'), true);
  launcher.setenv('WAYLAND_DISPLAY', GLib.build_filenamev([GLib.get_user_runtime_dir(), GLib.getenv('WAYLAND_DISPLAY')]), true);
  if (manifest) launcher.setenv('SABINE_MANIFEST_PATH', manifest, true);
  const ibus = IBus.get_address();
  if (ibus) launcher.setenv('IBUS_ADDRESS', ibus, true);
  launcher.set_cwd(home);
  return launcher;
}

function command(name) {
  if (DEV_APPS.includes(name)) {
    const app = GLib.build_filenamev([REPOSITORY, 'apps', name]);
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

export const sleep = milliseconds => new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
  resolve();
  return GLib.SOURCE_REMOVE;
}));

export async function waitFor(condition, milliseconds, describe) {
  const deadline = GLib.get_monotonic_time() + milliseconds * 1000;
  while (!(await condition())) {
    if (GLib.get_monotonic_time() > deadline) throw new Error(describe());
    await sleep(50);
  }
}

export class Keys {
  constructor() {
    this.device = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  }

  press(keyval, modifiers = []) {
    for (const modifier of modifiers) this.device.notify_keyval(GLib.get_monotonic_time(), modifier, Clutter.KeyState.PRESSED);
    this.device.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.PRESSED);
    this.device.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.RELEASED);
    for (const modifier of modifiers.toReversed()) this.device.notify_keyval(GLib.get_monotonic_time(), modifier, Clutter.KeyState.RELEASED);
  }

  async type(text) {
    for (const character of text) this.press(character.codePointAt(0));
    await sleep(TYPED);
  }
}

const exited = process => new Promise(resolve => process.wait_async(null, () => resolve()));
const readJson = path => JSON.parse(new TextDecoder().decode(GLib.file_get_contents(path)[1]));

export async function startSabineService() {
  const quiet = launcher(Gio.SubprocessFlags.STDERR_SILENCE);
  const {active} = readJson(GLib.build_filenamev([SABINE, 'bin/current.json']));
  const service = quiet.spawnv([GLib.build_filenamev([SABINE, 'bin/versions', active, 'sabine-service-daemon'])]);
  const state = GLib.build_filenamev([SABINE, 'daemon-state.json']);
  await waitFor(() => GLib.file_test(state, GLib.FileTest.EXISTS) && readJson(state).pid === Number(service.get_identifier()),
    5000, () => 'The Sabine service did not start');
  return {stop: async () => {
    service.send_signal(15);
    await exited(service);
  }};
}

const SAMPLE_STEP = 3;
const channels = hex => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));

class Frame {
  constructor(bytes) {
    this.bytes = bytes;
    this._pixbuf = GdkPixbuf.Pixbuf.new_from_stream(Gio.MemoryInputStream.new_from_bytes(bytes), null);
    this._pixels = this._pixbuf.get_pixels();
  }

  count(colors, tolerance) {
    const targets = colors.map(channels);
    const [stride, size] = [this._pixbuf.get_rowstride(), this._pixbuf.get_n_channels()];
    let matches = 0;
    for (let y = 0; y < this._pixbuf.get_height(); y += SAMPLE_STEP) {
      for (let x = 0; x < this._pixbuf.get_width(); x += SAMPLE_STEP) {
        const offset = y * stride + x * size;
        if (targets.some(target => target.every((value, channel) => Math.abs(this._pixels[offset + channel] - value) <= tolerance))) matches++;
      }
    }
    return matches;
  }

  share(colors, tolerance) {
    const samples = Math.ceil(this._pixbuf.get_width() / SAMPLE_STEP) * Math.ceil(this._pixbuf.get_height() / SAMPLE_STEP);
    return this.count(colors, tolerance) / samples;
  }

  near(x, y, color, tolerance) {
    const offset = y * this._pixbuf.get_rowstride() + x * this._pixbuf.get_n_channels();
    return channels(color).every((value, channel) => Math.abs(this._pixels[offset + channel] - value) <= tolerance);
  }

  same(other) {
    return other?.bytes.compare(this.bytes) === 0;
  }

  looksLike(other, tolerance = 0) {
    return this._pixels.length === other._pixels.length && this._pixels.every((value, index) => Math.abs(value - other._pixels[index]) <= tolerance);
  }

  save(path) {
    GLib.file_set_contents(path, this.bytes.toArray());
  }

  saveZoomed(path, factor) {
    this._pixbuf.scale_simple(this._pixbuf.get_width() * factor, this._pixbuf.get_height() * factor, GdkPixbuf.InterpType.NEAREST)
      .savev(path, 'png', [], []);
  }
}

export async function captureFrame({x, y, width, height}) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  const screenshot = new Shell.Screenshot();
  await new Promise((resolve, reject) => screenshot.screenshot_area(x, y, width, height, stream, (source, result) => {
    try {
      source.screenshot_area_finish(result);
      resolve();
    } catch (error) {
      reject(error);
    }
  }));
  stream.close(null);
  return new Frame(stream.steal_as_bytes());
}

export class LuftApp {
  constructor(name, args = []) {
    this.name = name;
    this.id = `com.lantharos.${name}`;
    this._log = [];
    const {path, manifest} = command(name);
    if (!GLib.file_test(path, GLib.FileTest.IS_EXECUTABLE))
      throw new Error(`${name} is not built at ${path}`);
    this._process = launcher(Gio.SubprocessFlags.STDERR_PIPE, manifest).spawnv([path, ...args]);
    this._painted = false;
    this._exited = false;
    exited(this._process).then(() => (this._exited = true));
    readLines(this._process.get_stderr_pipe(), line => {
      this._log = [...this._log.slice(1 - LOG_LINES), line];
      this._painted ||= line.includes(`[${this.id}]`) && line.endsWith(FIRST_PAINT);
    });
  }

  async open() {
    const started = GLib.get_monotonic_time();
    const log = () => this._log.join('\n');
    await waitFor(() => this._painted || this._exited, LAUNCH_TIMEOUT, () => `${this.name} did not paint within ${LAUNCH_TIMEOUT / 1000} s:\n${log()}`);
    if (!this._painted) throw new Error(`${this.name} exited before it painted:\n${log()}`);
    this.window = global.get_window_actors().map(actor => actor.meta_window).find(window => window.get_wm_class() === this.id);
    if (!this.window) throw new Error(`${this.name} painted without a window`);
    this.window.activate(global.get_current_time());
    return (GLib.get_monotonic_time() - started) / 1000;
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
      await sleep(50);
    }
  }

  async finished(milliseconds) {
    await waitFor(() => this._exited, milliseconds, () => `${this.name} kept running:\n${this._log.join('\n')}`);
  }

  async close() {
    this._process.send_signal(15);
    if (!this._exited) await exited(this._process);
  }
}
