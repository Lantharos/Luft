import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Rgb } from '../appearance/color.js';

export const SETTINGS_XML = `<node><interface name="org.freedesktop.impl.portal.Settings">
  <method name="ReadAll"><arg type="as" direction="in"/><arg type="a{sa{sv}}" direction="out"/></method>
  <method name="Read"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="v" direction="out"/></method>
  <signal name="SettingChanged"><arg type="s"/><arg type="s"/><arg type="v"/></signal>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const APPEARANCE = 'org.freedesktop.appearance';
const COLOR_SCHEMES: Record<string, number> = { 'prefer-dark': 1, 'prefer-light': 2 };

export class SettingsPortal {
  readonly version = 2;
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly a11ySettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.interface' });
  private accent: Rgb | null = null;

  constructor(private readonly changed: (key: string, value: GLib.Variant) => void) {
    this.interfaceSettings.connect('changed::color-scheme', () => this.notify('color-scheme'));
    this.interfaceSettings.connect('changed::enable-animations', () => this.notify('reduced-motion'));
    this.a11ySettings.connect('changed::high-contrast', () => this.notify('contrast'));
  }

  setAccent(accent: Rgb): void {
    this.accent = accent;
    this.notify('accent-color');
  }

  ReadAll(namespaces: string[]): Record<string, Record<string, GLib.Variant>> {
    const wanted = !namespaces.length || namespaces.some(pattern =>
      pattern === APPEARANCE || (pattern.endsWith('*') && APPEARANCE.startsWith(pattern.slice(0, -1))));
    return wanted ? { [APPEARANCE]: this.appearance() } : {};
  }

  ReadAsync([namespace, key]: [string, string], invocation: Gio.DBusMethodInvocation): void {
    const value = namespace === APPEARANCE ? this.appearance()[key] : undefined;
    if (value) invocation.return_value(new GLib.Variant('(v)', [value]));
    else invocation.return_dbus_error('org.freedesktop.portal.Error.NotFound', `${namespace} ${key} is not provided here`);
  }

  private appearance(): Record<string, GLib.Variant> {
    const values: Record<string, GLib.Variant> = {
      'color-scheme': new GLib.Variant('u', COLOR_SCHEMES[this.interfaceSettings.get_string('color-scheme')] ?? 0),
      'contrast': new GLib.Variant('u', this.a11ySettings.get_boolean('high-contrast') ? 1 : 0),
      'reduced-motion': new GLib.Variant('u', this.interfaceSettings.get_boolean('enable-animations') ? 0 : 1),
    };
    if (this.accent) {
      const [red, green, blue] = this.accent;
      values['accent-color'] = new GLib.Variant('(ddd)', [red / 255, green / 255, blue / 255]);
    }
    return values;
  }

  private notify(key: string): void {
    const value = this.appearance()[key];
    if (value) this.changed(key, value);
  }
}
