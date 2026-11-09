import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {fixture, outcome, repository, scratch} from '../../lib/processes.js';

const {require} = checks('AppImage sandbox');
const SCHELF = repository('target', 'release', 'schelf');
const SANDBOX = '--sandbox';

/** Builds a Sabine AppImage that declares what its `[sandbox]` table says. */
export const SABINE_BUILDER = fixture('sandbox', 'sabine.py');

const applications = () => GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
export const desktopFile = (id: string) => GLib.build_filenamev([applications(), `${id}.desktop`]);

function entries(): Set<string> {
  const folder = Gio.File.new_for_path(applications());
  if (!folder.query_exists(null)) return new Set();
  return new Set([...folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(info => info.get_name()).filter(name => name.endsWith('.desktop')).map(name => name.slice(0, -'.desktop'.length)));
}

/** The program and arguments a menu entry starts, without its file placeholders. */
export function launchLine(id: string) {
  const entry = new GLib.KeyFile();
  entry.load_from_file(desktopFile(id), GLib.KeyFileFlags.NONE);
  const [program, ...rest] = GLib.shell_parse_argv(entry.get_string('Desktop Entry', 'Exec'))[1]!;
  return {program, rest: rest.filter(argument => !argument.startsWith('%') && !argument.startsWith('@@')), entry};
}

/** Installs an AppImage with Schelf and checks that its menu entry starts it in its sandbox. */
export async function install(path: string) {
  const copy = scratch(`appimage-${GLib.path_get_basename(path)}`);
  Gio.File.new_for_path(path).copy(Gio.File.new_for_path(copy), Gio.FileCopyFlags.OVERWRITE, null, null);
  const before = entries();
  const installed = await outcome([SCHELF, 'install', '--yes', copy]);
  require(installed.ok, `Schelf installs ${GLib.path_get_basename(path)}`);
  const [id] = [...entries()].filter(name => !before.has(name));
  require(id, `${GLib.path_get_basename(path)} gets a menu entry`);
  const {program, rest} = launchLine(id);
  require(program === GLib.canonicalize_filename(SCHELF, null) && rest[0] === SANDBOX && rest[1] === id, `the menu entry of ${id} starts it in its sandbox`);
  return id;
}
