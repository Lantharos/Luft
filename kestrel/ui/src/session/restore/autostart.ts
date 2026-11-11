import GLib from 'gi://GLib';
import GioUnix from 'gi://GioUnix';

const ENABLED = 'X-GNOME-Autostart-enabled';

function entryOf(appId: string): GioUnix.DesktopAppInfo | null {
  for (const folder of [GLib.get_user_config_dir(), ...GLib.get_system_config_dirs()]) {
    const path = GLib.build_filenamev([folder, 'autostart', appId]);
    if (GLib.file_test(path, GLib.FileTest.EXISTS)) return GioUnix.DesktopAppInfo.new_from_filename(path);
  }
  return null;
}

export function autostarts(appId: string): boolean {
  const entry = entryOf(appId);
  return !!entry && !entry.get_is_hidden() && entry.get_show_in(null) && (!entry.has_key(ENABLED) || entry.get_boolean(ENABLED));
}
