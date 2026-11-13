import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

const KEPT = /^(com\.lantharos\.|org\.gnome\.desktop\.|org\.gnome\.mutter)/;
const KEPT_BY_THE_DESKTOP = new Set(['org.gnome.desktop.notifications application-children']);
const STATE = GLib.get_user_state_dir();
const SETTINGS_AT_START = GLib.build_filenamev([STATE, 'capture-settings.json']);
const DISPLAYS_AT_START = GLib.build_filenamev([STATE, `capture-displays-${GLib.path_get_basename(GLib.getenv('KESTREL_CAPTURE_QUEUE')!)}.json`]);

function settings() {
  Gio.Settings.sync();
  const source = Gio.SettingsSchemaSource.get_default()!;
  const values: Record<string, string> = {};
  for (const id of source.list_schemas(true)[0].filter(id => KEPT.test(id))) {
    const schema = new Gio.Settings({schema_id: id});
    for (const key of source.lookup(id, true)!.list_keys()) values[`${id} ${key}`] = schema.get_value(key).print(false);
  }
  return values;
}

const displays = () => Main.layoutManager.monitors
  .map(({x, y, width, height, geometry_scale}) => `${width}×${height} at ${x},${y} scaled ${geometry_scale}`).join(', ');

const read = <T>(path: string): T => JSON.parse(new TextDecoder().decode(GLib.file_get_contents(path)[1]));

function remember(path: string, value: unknown) {
  if (!GLib.file_test(path, GLib.FileTest.EXISTS)) GLib.file_set_contents(path, JSON.stringify(value));
}

export function rememberSessionStart() {
  remember(SETTINGS_AT_START, settings());
  remember(DISPLAYS_AT_START, displays());
}

export function requireSessionAsAtStart() {
  const start = read<Record<string, string>>(SETTINGS_AT_START);
  const now = settings();
  const changed = Object.keys(now).filter(key => !KEPT_BY_THE_DESKTOP.has(key) && start[key] !== now[key]);
  if (changed.length) throw new Error(`The group left settings changed: ${changed.map(key => `${key} ${now[key]}`).join('; ')}`);
  const arranged = read<string>(DISPLAYS_AT_START);
  if (displays() !== arranged) throw new Error(`The group left the displays at ${displays()}, not ${arranged}`);
}
