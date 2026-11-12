import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Config from '../../core/config.js';

function fileId(path: string): string | null {
  try {
    return Gio.File.new_for_path(path)
      .query_info(Gio.FILE_ATTRIBUTE_ID_FILE, Gio.FileQueryInfoFlags.NONE, null).get_attribute_string(Gio.FILE_ATTRIBUTE_ID_FILE);
  } catch {
    return null;
  }
}

function startedFromBuild(): boolean {
  const build = GLib.getenv('KESTREL_BUILDDIR');
  if (!build) return false;
  const script = Gio.File.new_for_uri(import.meta.url).get_path();
  if (script) return !script.startsWith(`${Config.PKGDATADIR}/`);
  const running = fileId('/proc/self/exe');
  return running !== null && running !== fileId(`${Config.BINDIR}/kestrel`) && running === fileId(GLib.build_filenamev([build, 'kestrel']));
}

export const STARTED_FROM_BUILD = startedFromBuild();

export const developmentPath = (variable: string) => STARTED_FROM_BUILD ? GLib.getenv(variable) : null;
