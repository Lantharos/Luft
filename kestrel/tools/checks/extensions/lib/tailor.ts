import GLib from 'gi://GLib';

const HOME = GLib.get_home_dir();
const VESKTOP = `${HOME}/.var/app/dev.vencord.Vesktop/config/vesktop`;

export const TAILOR = 'com.lantharos.Tailor';
export const STEAM = `${HOME}/.var/app/com.valvesoftware.Steam/.local/share/Steam/steamui`;
export const VESKTOP_SETTINGS = `${VESKTOP}/settings/settings.json`;
export const VESKTOP_THEME = `${VESKTOP}/themes/luft.theme.css`;
export const LIBRARY = `${STEAM}/css/library.css`;
export const ORIGINAL_SETTINGS = '{\n    "autoUpdate": true,\n    "enabledThemes": [],\n    "plugins": {}\n}';
export const STEAM_STYLES = 'button.DialogButton{color:#dfe3e6}\n'.repeat(40);

export const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
export const exists = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS);

export function write(path: string, text: string) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  GLib.file_set_contents(path, text);
}

export function placeApps() {
  write(VESKTOP_SETTINGS, ORIGINAL_SETTINGS);
  write(LIBRARY, STEAM_STYLES);
}
