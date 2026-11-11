import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

import {scratch} from '../../lib/processes.js';
import {write} from './files.js';

const BROWSER = 'com.lantharos.KestrelChecks.LinkBrowser';
const WEB_LINKS = ['x-scheme-handler/http', 'x-scheme-handler/https'];

export function installBrowser(record: string) {
  const path = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', `${BROWSER}.desktop`]);
  const script = scratch('link-browser.sh');
  write(script, `printf '%s' "$1" > ${GLib.shell_quote(record)}\n`);
  write(path, `[Desktop Entry]\nType=Application\nName=Link browser\nExec=sh ${script} %u\nMimeType=${WEB_LINKS.join(';')};\n`);
  const browser = GioUnix.DesktopAppInfo.new_from_filename(path)!;
  WEB_LINKS.forEach(scheme => browser.set_as_default_for_type(scheme));
  return () => {
    WEB_LINKS.forEach(scheme => Gio.AppInfo.reset_type_associations(scheme));
    GLib.unlink(path);
  };
}
