import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Value } from '../../../../../packages/web/settings-catalogue/catalogue.js';

export class Key {
  private constructor(readonly name: string, private readonly settings: Gio.Settings, private readonly schemaKey: Gio.SettingsSchemaKey) {}

  /** A key as the catalogue names it, `schema key`, when it's installed. */
  static open(name: string): Key | null {
    const [schemaId, keyName] = name.split(' ');
    const schema = Gio.SettingsSchemaSource.get_default()?.lookup(schemaId, true);
    if (!schema?.has_key(keyName)) return null;
    return new Key(name, new Gio.Settings({ settings_schema: schema }), schema.get_key(keyName));
  }

  private get keyName(): string {
    return this.schemaKey.get_name();
  }

  get type(): string {
    return this.schemaKey.get_value_type().dup_string();
  }

  read(): Value {
    return this.settings.get_value(this.keyName).recursiveUnpack() as Value;
  }

  /** The value someone set, as GVariant text, or null when the key keeps its default. */
  ownValue(): string | null {
    return this.settings.get_user_value(this.keyName)?.print(true) ?? null;
  }

  variant(value: Value): GLib.Variant | null {
    const type = this.type;
    const fits = type === 'b' ? typeof value === 'boolean'
      : type === 's' ? typeof value === 'string'
        : typeof value === 'number' && (type === 'd' || Number.isInteger(value));
    if (!fits) return null;
    const variant = new GLib.Variant(type, value);
    return this.schemaKey.range_check(variant) ? variant : null;
  }

  write(value: Value | null): void {
    if (value === null) this.settings.reset(this.keyName);
    else this.settings.set_value(this.keyName, this.variant(value)!);
  }
}

export function sync(): void {
  Gio.Settings.sync();
}
