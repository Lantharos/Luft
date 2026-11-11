import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {labelled, shown} from '../../lib/actors.js';
import {call} from '../../lib/dbus.js';
import {click} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {settled, waitUntil} from '../../lib/wait.js';
import {callLog} from '../../system/lib/systemCalls.js';

const MANAGER = 'org.gnome.SessionManager';
const TOLERANCE = 2;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Recorded {
  app: string;
  monitor: number;
  frame: Box;
  workspace: number;
  maximized: boolean;
  edges: number;
  focused: boolean;
}

export interface SessionRecord {
  ending: 'running' | 'update' | 'ordinary';
  windows: Recorded[];
}

const recordFile = () => Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'session.json']));
const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);

export const boxOf = (window: Meta.Window): Box => {
  const {x, y, width, height} = window.get_frame_rect();
  return {x, y, width, height};
};

export const near = (a: Box, b: Box) => (['x', 'y', 'width', 'height'] as const).every(side => Math.abs(a[side] - b[side]) <= TOLERANCE);

export const maximized = (window: Meta.Window) => window.maximized_horizontally && window.maximized_vertically;

export function sessionRecord(): SessionRecord | null {
  const path = recordFile().get_path()!;
  return GLib.file_test(path, GLib.FileTest.EXISTS) ? JSON.parse(read(path)) as SessionRecord : null;
}

export function recordMode(): number {
  return recordFile().query_info('unix::mode', Gio.FileQueryInfoFlags.NONE, null).get_attribute_uint32('unix::mode') & 0o777;
}

export function phases<T>(group: string) {
  const file = scratch(`restore-${group.replace(':', '-')}.json`);
  return {
    current: (): {phase: string; data: T} | null => GLib.file_test(file, GLib.FileTest.EXISTS) ? JSON.parse(read(file)) : null,
    next(phase: string, data: T, displays = GLib.path_get_basename(GLib.getenv('KESTREL_CAPTURE_QUEUE')!)) {
      GLib.file_set_contents(file, JSON.stringify({phase, data}));
      const queue = GLib.build_filenamev([GLib.path_get_dirname(GLib.getenv('KESTREL_CAPTURE_QUEUE')!), displays]);
      GLib.mkdir_with_parents(queue, 0o755);
      GLib.file_set_contents(GLib.build_filenamev([queue, `0000~${GLib.getenv('KESTREL_CAPTURE_WORKER')}-${group}`]), '');
    },
    done: () => GLib.unlink(file),
  };
}

export function kestrelUptime(): number {
  const stat = read('/proc/self/stat');
  const started = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19]) / 100;
  return Number(read('/proc/uptime').split(' ')[0]) - started;
}

export function setStagedUpdate(staged: boolean) {
  return call('com.lantharos.KestrelChecks', '/com/lantharos/KestrelChecks/Updater', 'com.lantharos.KestrelChecks.Updater', 'Stage',
    new GLib.Variant('(b)', [staged]), null, {connection: Gio.DBus.system});
}

export async function restart(confirmLabel: string): Promise<void> {
  const calls = callLog();
  await call(MANAGER, '/org/gnome/SessionManager', MANAGER, 'Reboot');
  const confirm = await waitUntil(() => shown(Main.endSessionDialog) && labelled(confirmLabel, Main.endSessionDialog), `the dialog offers ${confirmLabel}`);
  await settled();
  click(confirm);
  await waitUntil(() => calls().includes('Reboot'), 'the computer restarts', 10000);
}

export async function signOutOfSession(): Promise<never> {
  Gio.Subprocess.new(['systemctl', '--user', '--no-block', 'stop', GLib.getenv('KESTREL_SESSION_SCOPE')!], Gio.SubprocessFlags.NONE);
  return new Promise(() => {});
}

export async function crashKestrel(): Promise<never> {
  const pid = Gio.Credentials.new().get_unix_pid();
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${pid}; sleep 1; kill -SEGV ${pid}`], Gio.SubprocessFlags.NONE);
  return new Promise(() => {});
}
