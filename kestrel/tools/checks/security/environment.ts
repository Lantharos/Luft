import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {waitUntil} from '../lib/wait.js';

const {require} = checks('launch environment');
const SLIPPED_IN = {LD_PRELOAD: 'libm.so.6', GTK_MODULES: 'payload', GJS_PATH: '/nowhere', PYTHONPATH: '/nowhere'};
const NEEDED = ['HOME', 'XDG_RUNTIME_DIR', 'WAYLAND_DISPLAY', 'DBUS_SESSION_BUS_ADDRESS'];
const LUFT_APP = 'com.lantharos.settings.desktop';
const OTHER_APP = '[Desktop Entry]\nType=Application\nName=Stand-in\nExec=sleep 30\n';

function environmentOf(pid: number): Map<string, string> {
  const [, contents] = GLib.file_get_contents(`/proc/${pid}/environ`);
  return new Map(new TextDecoder().decode(contents).split('\0').filter(Boolean)
    .map(entry => [entry.slice(0, entry.indexOf('=')), entry.slice(entry.indexOf('=') + 1)]));
}

const LAUNCHER = '/usr/libexec/gio-launch-desktop';

const program = (pid: number | 'self') => GLib.file_read_link(`/proc/${pid}/exe`);

function startedWith(pid: number): Map<string, string> | null {
  try {
    const environment = environmentOf(pid);
    return ![program('self'), LAUNCHER].includes(program(pid)) && environment.size > 0 ? environment : null;
  } catch {
    return null;
  }
}

async function startedEnvironment(app: GioUnix.DesktopAppInfo): Promise<Map<string, string>> {
  let pid = 0;
  app.launch_uris_as_manager([], global.create_launch_context_for_app(app, 0, -1),
    GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD, null, (_app, started) => (pid = started));
  require(pid > 0, `${app.get_name()} starts`);
  const environment = await waitUntil(() => startedWith(pid), `${app.get_name()} runs its own program`);
  Gio.Subprocess.new(['kill', `${pid}`], Gio.SubprocessFlags.NONE);
  GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => GLib.spawn_close_pid(pid));
  return environment;
}

export async function run() {
  for (const [name, value] of Object.entries(SLIPPED_IN)) GLib.setenv(name, value, true);
  try {
    const luft = await startedEnvironment(GioUnix.DesktopAppInfo.new(LUFT_APP)!);
    for (const name of Object.keys(SLIPPED_IN))
      require(!luft.has(name), `${name} in the session doesn't reach Settings`);
    for (const name of NEEDED)
      require(luft.get(name) === GLib.getenv(name), `Settings gets ${name}`);
    const other = await startedEnvironment(GioUnix.DesktopAppInfo.new_from_keyfile(keyFile(OTHER_APP))!);
    for (const [name, value] of Object.entries(SLIPPED_IN))
      require(other.get(name) === value, `an app that isn't Luft's still gets ${name} from the session`);
    require(other.get('HOME') === GLib.getenv('HOME'), 'an app that isn\'t Luft\'s gets the rest of the session too');
  } finally {
    for (const name of Object.keys(SLIPPED_IN)) GLib.unsetenv(name);
  }
}

function keyFile(contents: string): GLib.KeyFile {
  const file = new GLib.KeyFile();
  file.load_from_data(contents, contents.length, GLib.KeyFileFlags.NONE);
  return file;
}
