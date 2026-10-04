import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

export function applyDesktopDefaults(): void {
  const defaults = new GLib.KeyFile();
  defaults.load_from_file(`${(global as unknown as Shell.Global).datadir}/dconf/defaults.ini`, GLib.KeyFileFlags.NONE);
  const [groups] = defaults.get_groups();
  for (const path of groups) {
    const settings = new Gio.Settings({ schema_id: path.replaceAll('/', '.') });
    const [keys] = defaults.get_keys(path);
    for (const key of keys) {
      const type = settings.settings_schema.get_key(key).get_value_type();
      settings.set_value(key, GLib.Variant.parse(type, defaults.get_value(path, key), null, null));
    }
  }
}
