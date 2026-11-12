import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call} from '../../lib/dbus.js';
import {fixture} from '../../lib/processes.js';
import {removeTree} from '../../apps/lib/files.js';

const HOME = GLib.get_home_dir();
const VESKTOP = `${HOME}/.var/app/dev.vencord.Vesktop/config/vesktop`;
const SPOTIFY_FLATPAK = `${GLib.get_user_data_dir()}/flatpak/app/com.spotify.Client`;
const SPOTIFY = `${SPOTIFY_FLATPAK}/current/active/files/extra/share/spotify`;
const SPICETIFY = `${HOME}/.spicetify`;
const SPICETIFY_CONFIG = `${GLib.get_user_config_dir()}/spicetify`;

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

export function placeSpotify() {
  write(`${SPOTIFY}/Apps/xpui.spa`, '');
  GLib.mkdir_with_parents(SPICETIFY, 0o755);
  Gio.File.new_for_path(fixture('extensions', 'tailor', 'spicetify')).copy(Gio.File.new_for_path(`${SPICETIFY}/spicetify`), Gio.FileCopyFlags.OVERWRITE, null, null);
}

export function removeSpotify() {
  for (const folder of [SPOTIFY_FLATPAK, SPICETIFY, SPICETIFY_CONFIG]) removeTree(folder);
}

export async function page(): Promise<string> {
  const [json] = (await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Extensions', 'com.lantharos.Kestrel.Extensions', 'Page',
    new GLib.Variant('(s)', [TAILOR]), '(s)')).deepUnpack<[string]>();
  return json;
}
