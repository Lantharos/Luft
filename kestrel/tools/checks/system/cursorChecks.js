import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.DataInputStream.prototype, 'read_line_async');
Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

const THEME = 'KestrelCheck';
const XCURSOR_MAGIC = 0x72756358;
const XCURSOR_IMAGE = 0xfffd0002;
const STATE_TIMEOUT_MS = 4000;

function xcursor(sizes) {
  const headerLength = 16;
  const tocLength = 12 * sizes.length;
  const chunkLength = 36;
  const view = new DataView(new ArrayBuffer(headerLength + tocLength + sizes.reduce((total, size) => total + chunkLength + size * size * 4, 0)));
  let offset = 0;
  const write = word => {
    view.setUint32(offset, word, true);
    offset += 4;
  };
  [XCURSOR_MAGIC, headerLength, 0x10000, sizes.length].forEach(write);
  let position = headerLength + tocLength;
  for (const size of sizes) {
    [XCURSOR_IMAGE, size, position].forEach(write);
    position += chunkLength + size * size * 4;
  }
  for (const size of sizes) {
    [chunkLength, XCURSOR_IMAGE, size, 1, size, size, 0, 0, 0].forEach(write);
    for (let pixel = 0; pixel < size * size; pixel++) write(0xff000000);
  }
  return new Uint8Array(view.buffer);
}

function installTheme() {
  const root = GLib.build_filenamev([GLib.get_user_data_dir(), 'icons', THEME]);
  GLib.mkdir_with_parents(`${root}/cursors`, 0o755);
  GLib.file_set_contents(`${root}/index.theme`, `[Icon Theme]\nName=${THEME}\n`);
  for (const name of ['default', 'left_ptr']) GLib.file_set_contents(`${root}/cursors/${name}`, xcursor([24, 48]));
  return () => {
    for (const name of ['cursors/default', 'cursors/left_ptr', 'index.theme', 'cursors', '']) Gio.File.new_for_path(`${root}/${name}`).delete(null);
  };
}

async function xResources() {
  const [output] = await Gio.Subprocess.new(['xrdb', '-query'], Gio.SubprocessFlags.STDOUT_PIPE).communicate_utf8_async(null, null);
  return Object.fromEntries(output.split('\n').filter(Boolean).map(line => line.split(':\t')));
}

async function waitForState(lines, wanted) {
  const cancellable = new Gio.Cancellable();
  const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, STATE_TIMEOUT_MS, () => {
    cancellable.cancel();
    return GLib.SOURCE_REMOVE;
  });
  try {
    for (;;) {
      const [line] = await lines.read_line_async(GLib.PRIORITY_DEFAULT, cancellable);
      const state = JSON.parse(new TextDecoder().decode(line));
      if (state.theme === wanted.theme && state.size === wanted.size) return state;
    }
  } catch (error) {
    if (error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) return null;
    throw error;
  } finally {
    if (!cancellable.is_cancelled()) GLib.source_remove(timer);
  }
}

export async function checkCursor({pause, pointer}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel cursor check failed: ${label}`);
    console.log(`Kestrel cursor check: ${label}`);
  };
  const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const saved = {theme: settings.get_string('cursor-theme'), size: settings.get_int('cursor-size')};
  const choose = ({theme, size}) => {
    settings.set_string('cursor-theme', theme);
    settings.set_int('cursor-size', size);
  };
  const tracker = global.backend.get_cursor_tracker();
  const spriteSize = () => tracker.get_sprite()?.get_width();
  const removeTheme = installTheme();
  let client = null;
  try {
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
    choose({theme: THEME, size: 24});
    await pause(300);
    require(spriteSize() === 24, 'the pointer takes the chosen theme');
    choose({theme: THEME, size: 48});
    await pause(300);
    require(spriteSize() === 48, 'the pointer takes the chosen size');

    client = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_X11_CURSOR_SCRIPT')], Gio.SubprocessFlags.STDOUT_PIPE);
    const lines = new Gio.DataInputStream({base_stream: client.get_stdout_pipe()});
    const started = await waitForState(lines, {theme: THEME, size: 48});
    require(started, 'X11 apps start with the same theme and size');
    require(started.imModule === 'ibus', 'X11 apps type through IBus');
    let resources = await xResources();
    require(resources['Xcursor.theme'] === THEME && resources['Xcursor.size'] === '48', 'X resources carry the theme and size for apps without X settings');

    choose({theme: 'Adwaita', size: 32});
    require(await waitForState(lines, {theme: 'Adwaita', size: 32}), 'running X11 apps follow a new theme and size');
    await pause(200);
    resources = await xResources();
    require(resources['Xcursor.theme'] === 'Adwaita' && resources['Xcursor.size'] === '32', 'X resources follow a new theme and size');
  } finally {
    client?.force_exit();
    choose(saved);
    removeTheme();
    await pause(300);
  }
}
