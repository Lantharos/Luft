import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {runtime} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {fixture, outcome, repository, scratch} from '../../lib/processes.js';
import {withApp} from './apps.js';

const {require} = checks('AppImage sandbox');
const SCHELF = repository('target', 'release', 'schelf');
const COMMAND = repository('target', 'release', 'schelf-cli');
const SANDBOX = '--sandbox';

export const SABINE_BUILDER = fixture('sandbox', 'sabine.py');
/** Sandboxes start in the session's runtime folder for apps, where its portals look for them. */
export const IN_SESSION = {env: runtime()};

const applications = () => GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
export const desktopFile = (id: string) => GLib.build_filenamev([applications(), `${id}.desktop`]);

function entries(): Set<string> {
  const folder = Gio.File.new_for_path(applications());
  if (!folder.query_exists(null)) return new Set();
  return new Set([...folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(info => info.get_name()).filter(name => name.endsWith('.desktop')).map(name => name.slice(0, -'.desktop'.length)));
}

const fileId = (path: string) => Gio.File.new_for_path(path).query_info('id::file', Gio.FileQueryInfoFlags.NONE, null).get_attribute_string('id::file');

const sameFile = (path: string, other: string) => GLib.file_test(path, GLib.FileTest.EXISTS) && fileId(path) === fileId(other);

export function launchLine(id: string) {
  const entry = new GLib.KeyFile();
  entry.load_from_file(desktopFile(id), GLib.KeyFileFlags.NONE);
  const [program, ...rest] = GLib.shell_parse_argv(entry.get_string('Desktop Entry', 'Exec'))[1]!;
  return {program, rest: rest.filter(argument => !argument.startsWith('%') && !argument.startsWith('@@')), entry};
}

export async function install(path: string) {
  const copy = scratch(`appimage-${GLib.path_get_basename(path)}`);
  Gio.File.new_for_path(path).copy(Gio.File.new_for_path(copy), Gio.FileCopyFlags.OVERWRITE, null, null);
  const {installed, added} = await withApp('schelf', [], async () => {
    const before = entries();
    const installed = await outcome([COMMAND, 'install', '--yes', copy]);
    return {installed, added: [...entries()].filter(name => !before.has(name))};
  });
  require(installed.ok, `Schelf installs ${GLib.path_get_basename(path)} from the terminal (${installed.stderr})`);
  const [id] = added;
  require(id, `${GLib.path_get_basename(path)} gets a menu entry`);
  const {program, rest} = launchLine(id);
  require(sameFile(program, SCHELF) && rest[0] === SANDBOX && rest[1] === id, `the menu entry of ${id} starts it in its sandbox (${[program, ...rest].join(' ')})`);
  return id;
}
