import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const fileId = (path: string) => Gio.File.new_for_path(path)
  .query_info(Gio.FILE_ATTRIBUTE_ID_FILE, Gio.FileQueryInfoFlags.NONE, null).get_attribute_string(Gio.FILE_ATTRIBUTE_ID_FILE);

function startedFromBuild(): boolean {
  const build = GLib.getenv('KESTREL_BUILDDIR');
  if (!build) return false;
  try {
    return fileId(GLib.build_filenamev([build, 'kestrel'])) === fileId('/proc/self/exe');
  } catch {
    return false;
  }
}

const STARTED_FROM_BUILD = startedFromBuild();

export const developmentPath = (variable: string) => STARTED_FROM_BUILD ? GLib.getenv(variable) : null;
