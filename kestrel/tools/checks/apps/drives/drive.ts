import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';

import {answerable, labelled, styled} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {click} from '../../lib/input/input.js';
import {outcome, type Process, spawn, type SpawnOptions, stop, waitForWindow, windows} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

export const {require, eventually} = checks('Drive access');
const DIALOG = 'kestrel-drive-access-dialog';
const LOOKER = 'Kestrel drive looker';
const ANSWER = new RegExp(`^${LOOKER} (\\d+): (.*)$`);
const UDISKS = 'org.freedesktop.UDisks2';
const DRIVE_BLOCK = '/org/freedesktop/UDisks2/block_devices/sdc1';
const DRIVE_UUID = '0AB2C3D4E5F60718';
const DRIVE_ENTRY = `${DRIVE_UUID} Seagate_Barracuda`;
const STORE = 'org.freedesktop.impl.portal.PermissionStore';
const STORE_PATH = '/org/freedesktop/impl/portal/PermissionStore';
const LOOK = 10;
const WINDOW_TIMEOUT = 90000;
export const DRIVE_LABEL = 'Old Windows';
export const DRIVE_SIZE = GLib.format_size(400 * 1024 * 1024 * 1024);

export interface Looked {
  names?: string[];
  kind?: string;
  writable?: boolean;
  error?: string;
}

export const shownDialog = () => styled(DIALOG).find(actor => actor.mapped) ?? null;

/** What the app holds for the fixture's Old Windows drive in the permission store. */
export async function answers(app: string): Promise<string[]> {
  try {
    const reply = await call(STORE, STORE_PATH, STORE, 'Lookup', new GLib.Variant('(ss)', ['drives', DRIVE_ENTRY]), '(a{sas}v)');
    return reply.recursiveUnpack<[Record<string, string[]>, unknown]>()[0][app] ?? [];
  } catch {
    return [];
  }
}

/** Changes what the app holds for the drive, as Settings and Schelf do. */
export async function setAnswer(app: string, values: string[]) {
  if (values.length) await call(STORE, STORE_PATH, STORE, 'SetPermission', new GLib.Variant('(sbssas)', ['drives', true, DRIVE_ENTRY, app, values]));
  else await call(STORE, STORE_PATH, STORE, 'DeletePermission', new GLib.Variant('(sss)', ['drives', DRIVE_ENTRY, app])).catch(() => null);
}

/** Mounts the fixture's Old Windows drive, on a real folder when one is given. */
export async function mount(folder?: string) {
  const options: Record<string, GLib.Variant> = folder ? {'fixture-folder': new GLib.Variant('s', folder)} : {};
  const reply = await call(UDISKS, DRIVE_BLOCK, `${UDISKS}.Filesystem`, 'Mount', new GLib.Variant('(a{sv})', [options]), '(s)', {connection: Gio.DBus.system});
  return reply.deepUnpack<[string]>()[0];
}

export const unmount = () =>
  call(UDISKS, DRIVE_BLOCK, `${UDISKS}.Filesystem`, 'Unmount', new GLib.Variant('(a{sv})', [{}]), null, {connection: Gio.DBus.system});

/** A folder with a file in it, outside your home, standing in for what's on the drive. */
export function driveFolder(parent = GLib.get_tmp_dir()) {
  const folder = GLib.build_filenamev([parent, `kestrel-drive-${GLib.uuid_string_random().slice(0, 8)}`, DRIVE_LABEL]);
  GLib.mkdir_with_parents(folder, 0o755);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'saves.txt']), 'here');
  return folder;
}

export async function answer(label: string) {
  const dialog = await eventually(shownDialog, 'Kestrel asks whether the app may use the drive', 15000);
  await eventually(() => answerable(DIALOG), 'the question takes input after a moment');
  click(require(labelled(label, dialog), `the question offers ${label}`));
  await eventually(() => !shownDialog(), 'the question closes once answered');
}

/** Kestrel itself asks here, as any program of yours could: only Schelf's sandbox and watcher may. */
export async function checkOnlySchelfAsks() {
  const fds = new Gio.UnixFDList();
  const nothing = Gio.File.new_for_path('/dev/null').read(null);
  if (!(nothing instanceof GioUnix.FileDescriptorBased)) throw new Error('/dev/null opens as a local file');
  fds.append(nothing.get_fd());
  const refused = await new Promise<string>(resolve => Gio.DBus.session.call_with_unix_fd_list('com.lantharos.Kestrel',
    '/com/lantharos/Kestrel/DriveAccess', 'com.lantharos.Kestrel.DriveAccess', 'Ask', new GLib.Variant('(hs)', [0, DRIVE_UUID]),
    new GLib.VariantType('(b)'), Gio.DBusCallFlags.NONE, -1, fds, null, (connection, result) => {
      try {
        connection!.call_with_unix_fd_list_finish(result);
        resolve('');
      } catch (error) {
        resolve(String(error));
      }
    }));
  nothing.close(null);
  require(refused.includes('NotSchelf') && styled(DIALOG).filter(actor => actor.mapped).length <= 1,
    'nothing but Schelf can ask whether an app may use a drive');
}

/** The looker running in an app's sandbox, which looks inside the drive's folder when told. */
export class Looker {
  private answered = 0;

  private constructor(readonly window: Meta.Window, private readonly process: Process) {}

  static async open(argv: string[], id: string, options: SpawnOptions): Promise<Looker> {
    const earlier = new Set(windows());
    const process = spawn(argv, {...options, env: {...options.env, GSK_RENDERER: 'cairo'}});
    const window = await waitForWindow(candidate => !earlier.has(candidate) && candidate.get_title()?.startsWith(LOOKER) === true &&
      candidate.get_sandboxed_app_id() === id, `${id} opens a window in its sandbox`, WINDOW_TIMEOUT);
    window.activate(global.get_current_time());
    await waitUntil(() => global.display.focus_window === window, `${id} is in front`);
    return new Looker(window, process);
  }

  async look(): Promise<Looked> {
    await outcome(['kill', `-${LOOK}`, String(this.window.get_pid())]);
    const [, number, answer] = await waitUntil(() => {
      const match = ANSWER.exec(this.window.get_title() ?? '');
      return match && Number(match[1]) > this.answered && match;
    }, 'the app looks inside the drive');
    this.answered = Number(number);
    return JSON.parse(answer!) as Looked;
  }

  async close(): Promise<void> {
    this.window.delete(global.get_current_time());
    await stop(this.process);
    await waitUntil(() => !windows().includes(this.window), 'the app closes');
  }
}
