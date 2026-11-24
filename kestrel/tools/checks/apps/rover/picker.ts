import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {call, subscribe} from '../../lib/dbus.js';
import {press, type} from '../../lib/input/input.js';
import {changes} from '../lib/apps.js';
import {exists, read, write} from '../lib/files.js';

const {require, eventually} = checks('Luft app');
const DBUS = 'org.freedesktop.DBus';
const CHOOSER = 'org.freedesktop.impl.portal.desktop.rover';
const FRONTEND = 'org.freedesktop.portal.Desktop';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const TOKEN = 'roverPicker';
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

function saveFile(folder: string): Promise<Response> {
  const sender = Gio.DBus.session.get_unique_name()!.slice(1).replaceAll('.', '_');
  return new Promise((resolve, reject) => {
    const unsubscribe = subscribe<Response>({iface: 'org.freedesktop.portal.Request', member: 'Response', path: `${PORTAL_PATH}/request/${sender}/${TOKEN}`},
      (_signal, response) => {
        unsubscribe();
        resolve(response);
      });
    const options = {
      handle_token: new GLib.Variant('s', TOKEN),
      current_name: new GLib.Variant('s', NAME),
      current_folder: new GLib.Variant('ay', new TextEncoder().encode(`${folder}\0`)),
    };
    call(FRONTEND, PORTAL_PATH, 'org.freedesktop.portal.FileChooser', 'SaveFile', new GLib.Variant('(ssa{sv})', ['', '', options]), '(o)')
      .catch((error: unknown) => {
        unsubscribe();
        reject(error);
      });
  });
}

export async function checkPicker(folder: string) {
  GLib.mkdir_with_parents(folder, 0o755);
  const rover = await serveChooser();
  try {
    let answered: Response | null = null;
    const answer = saveFile(folder).then(response => (answered = response));
    await rover.open();
    (await rover.settle(() => true)).save('rover-picker-save');
    await changes(rover, "Ctrl+Shift+N names a new folder in Rover's save dialog", () => press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_n));
    type(NEW_FOLDER);
    (await rover.settle(() => true)).save('rover-picker-new-folder');
    const made = GLib.build_filenamev([folder, NEW_FOLDER]);
    await changes(rover, 'the save dialog goes into the folder it made', () => press(Clutter.KEY_Return));
    require(GLib.file_test(made, GLib.FileTest.IS_DIR), "Rover's save dialog makes the folder");
    press(Clutter.KEY_Return);
    const [response, {uris = []}] = await eventually(() => answered, 'the save dialog answers the app', ANSWER_TIMEOUT);
    await answer;
    const saved = GLib.build_filenamev([made, NAME]);
    require(response === 0 && uris.length === 1 && Gio.File.new_for_uri(uris[0]).get_path() === saved, 'the file is saved into the new folder');
    write(saved, 'Pack the charger\n');
    require(exists(saved) && read(saved) === 'Pack the charger\n', 'the app writes where the save dialog pointed');
  } finally {
    await rover.close();
  }
}
