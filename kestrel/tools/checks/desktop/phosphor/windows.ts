import GLib from 'gi://GLib';

const STRIPED_APP = 'com.lantharos.Kestrel.StripedWindow';
export const STRIPED_DESKTOP_ID = `${STRIPED_APP}.desktop`;

export function installStripedApp() {
  const folder = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications']);
  GLib.mkdir_with_parents(folder, 0o755);
  GLib.file_set_contents(GLib.build_filenamev([folder, STRIPED_DESKTOP_ID]), `[Desktop Entry]\nType=Application\nName=Striped\nExec=true\nStartupWMClass=${STRIPED_APP}\n`);
}
