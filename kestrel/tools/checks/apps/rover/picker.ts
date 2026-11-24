import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {call, subscribe} from '../../lib/dbus.js';
import {press, type} from '../../lib/input/input.js';
import {windows} from '../../lib/processes.js';
import {pause} from '../../lib/wait.js';
import {changes} from '../lib/apps.js';
import {exists, read, write} from '../lib/files.js';

const {require, eventually} = checks('Luft app');
const DBUS = 'org.freedesktop.DBus';
const CHOOSER = 'org.freedesktop.impl.portal.desktop.rover';
const FRONTEND = 'org.freedesktop.portal.Desktop';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const ROVER = 'com.lantharos.rover';
const WRITABLE = 0o755;
const NOT_WRITABLE = 0o555;
const SILENCE = 1500;
const NAME = 'Trip notes.txt';
const NEW_FOLDER = 'Trips';
const ANSWER_TIMEOUT = 30000;

type Response = [number, {uris?: string[]}];

const dbus = <S extends string>(method: string, name: string, reply: S) =>
  call(DBUS, '/org/freedesktop/DBus', DBUS, method, new GLib.Variant('(s)', [name]), reply);

const owned = async () => (await dbus('NameHasOwner', CHOOSER, '(b)')).deepUnpack<[boolean]>()[0];
const owner = async () => await owned() ? (await dbus('GetConnectionUnixProcessID', CHOOSER, '(u)')).deepUnpack<[number]>()[0] : null;

async function serveChooser() {
  const standIn = await owner();
  if (standIn !== null) {
    GLib.spawn_command_line_sync(`kill ${standIn}`);
    await eventually(async () => !(await owned()), 'the stand-in file chooser leaves the bus');
  }
  const rover = new LuftApp('rover', ['--portal-backend']);
  await eventually(async () => await owner() === rover.pid, 'Rover answers file chooser requests');
  return rover;
}

let requests = 0;

class SaveRequest {
  answered: Response | null = null;

  constructor(folder: string) {
    const token = `roverPicker${++requests}`;
    const sender = Gio.DBus.session.get_unique_name()!.slice(1).replaceAll('.', '_');
    void new Promise<Response>((resolve, reject) => {
      const unsubscribe = subscribe<Response>({iface: 'org.freedesktop.portal.Request', member: 'Response', path: `${PORTAL_PATH}/request/${sender}/${token}`},
        (_signal, response) => {
          unsubscribe();
          resolve(response);
        });
      const options = {
        handle_token: new GLib.Variant('s', token),
        current_name: new GLib.Variant('s', NAME),
        current_folder: new GLib.Variant('ay', new TextEncoder().encode(`${folder}\0`)),
      };
      call(FRONTEND, PORTAL_PATH, 'org.freedesktop.portal.FileChooser', 'SaveFile', new GLib.Variant('(ssa{sv})', ['', '', options]), '(o)')
        .catch((error: unknown) => {
          unsubscribe();
          reject(error);
        });
    }).then(response => (this.answered = response));
  }

  async answer(label: string) {
    const answered = await eventually(() => this.answered, label, ANSWER_TIMEOUT);
    await eventually(() => !windows().some(window => window.get_wm_class() === ROVER), 'the save dialog closes');
    return answered;
  }
}

const savedTo = ([response, {uris = []}]: Response) => response === 0 && uris.length === 1 ? Gio.File.new_for_uri(uris[0]).get_path() : null;

async function checkNewFolder(rover: LuftApp, folder: string) {
  const request = new SaveRequest(folder);
  await rover.open();
  (await rover.settle(() => true)).save('rover-picker-save');
  await changes(rover, "Ctrl+Shift+N names a new folder in Rover's save dialog", () => press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_n));
  type(NEW_FOLDER);
  (await rover.settle(() => true)).save('rover-picker-new-folder');
  const made = GLib.build_filenamev([folder, NEW_FOLDER]);
  await changes(rover, 'the save dialog goes into the folder it made', () => press(Clutter.KEY_Return));
  require(GLib.file_test(made, GLib.FileTest.IS_DIR), "Rover's save dialog makes the folder");
  press(Clutter.KEY_Return);
  const saved = GLib.build_filenamev([made, NAME]);
  require(savedTo(await request.answer('the save dialog answers the app')) === saved, 'the file is saved into the new folder');
  write(saved, 'Pack the charger\n');
  require(read(saved) === 'Pack the charger\n', 'the app writes where the save dialog pointed');
  return saved;
}

async function checkReplace(rover: LuftApp, saved: string) {
  const request = new SaveRequest(GLib.path_get_dirname(saved));
  await rover.open();
  await changes(rover, 'saving over a file that is already there asks first', () => press(Clutter.KEY_Return));
  (await rover.settle(() => true)).save('rover-picker-replace');
  await changes(rover, 'Cancel goes back to the save dialog', () => press(Clutter.KEY_Escape));
  await pause(SILENCE);
  require(request.answered === null && read(saved) === 'Pack the charger\n', 'cancelling the question leaves the file alone');
  await changes(rover, 'the name field takes Enter again', () => press(Clutter.KEY_Return));
  press(Clutter.KEY_Shift_L, Clutter.KEY_Tab);
  press(Clutter.KEY_Return);
  require(savedTo(await request.answer('Replace answers the app')) === saved, 'Replace saves over the file');
}

async function checkReadOnly(rover: LuftApp, folder: string) {
  GLib.mkdir_with_parents(folder, WRITABLE);
  GLib.chmod(folder, NOT_WRITABLE);
  try {
    const request = new SaveRequest(folder);
    await rover.open();
    (await rover.settle(() => true)).save('rover-picker-read-only');
    press(Clutter.KEY_Return);
    await pause(SILENCE);
    require(request.answered === null, 'Enter does not save into a folder the account can’t change');
    press(Clutter.KEY_Escape);
    const [response] = await request.answer('Escape cancels the save dialog');
    require(response !== 0 && !exists(GLib.build_filenamev([folder, NAME])), 'nothing is saved into a read-only folder');
  } finally {
    GLib.chmod(folder, WRITABLE);
  }
}

export async function checkPicker(folder: string) {
  GLib.mkdir_with_parents(folder, WRITABLE);
  const rover = await serveChooser();
  try {
    await checkReplace(rover, await checkNewFolder(rover, folder));
    await checkReadOnly(rover, GLib.build_filenamev([folder, 'Locked']));
  } finally {
    await rover.close();
  }
}
