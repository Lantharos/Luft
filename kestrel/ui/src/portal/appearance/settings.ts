import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import type { Rgb } from '../../appearance/color.js';
import { FontconfigSerial } from '../../shared/fontconfig.js';

const SETTINGS_XML = `<node><interface name="org.freedesktop.impl.portal.Settings">
  <method name="ReadAll"><arg type="as" direction="in"/><arg type="a{sa{sv}}" direction="out"/></method>
  <method name="Read"><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="v" direction="out"/></method>
  <signal name="SettingChanged"><arg type="s"/><arg type="s"/><arg type="v"/></signal>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const APPEARANCE = 'org.freedesktop.appearance';
const FONTCONFIG = 'org.gnome.fontconfig';
const INTERFACE = 'org.gnome.desktop.interface';
const A11Y_INTERFACE = 'org.gnome.desktop.a11y.interface';
const SHARED_SCHEMAS = [
  'org.gnome.desktop.a11y',
  A11Y_INTERFACE,
  'org.gnome.desktop.calendar',
  'org.gnome.desktop.input-sources',
  INTERFACE,
  'org.gnome.desktop.peripherals.mouse',
  'org.gnome.desktop.privacy',
  'org.gnome.desktop.sound',
  'org.gnome.desktop.wm.preferences',
  'org.gnome.settings-daemon.plugins.xsettings',
];
const COLOR_SCHEMES: Record<string, number> = { 'prefer-dark': 1, 'prefer-light': 2 };

type Namespace = Record<string, GLib.Variant>;

function matches(namespace: string, patterns: string[]): boolean {
  return !patterns.length || patterns.some(pattern => pattern === '' || pattern === namespace
    || (pattern.endsWith('*') && namespace.startsWith(pattern.slice(0, -1))));
}

export class SettingsPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(SETTINGS_XML, this);
  readonly version = 2;
  private readonly schemas = new Map<string, Gio.Settings>();
  private readonly shell = St.Settings.get();
  private readonly fontconfig = new FontconfigSerial(serial => this.emit(FONTCONFIG, 'serial', new GLib.Variant('i', serial)));
  private accent: Rgb | null = null;

  constructor() {
    const source = Gio.SettingsSchemaSource.get_default()!;
    for (const id of SHARED_SCHEMAS) {
      if (!source.lookup(id, true)) continue;
      const settings = new Gio.Settings({ schema_id: id });
      settings.connect('changed', (_settings, key) => this.changed(id, key));
      this.schemas.set(id, settings);
    }
    this.shell.connect('notify::enable-animations', () => this.emitValue(INTERFACE, 'enable-animations'));
  }

  setAccent(accent: Rgb): void {
    this.accent = accent;
    this.emitValue(APPEARANCE, 'accent-color');
  }

  ReadAll(patterns: string[]): Record<string, Namespace> {
    const namespaces = [...this.schemas.keys(), FONTCONFIG, APPEARANCE].filter(namespace => matches(namespace, patterns));
    return Object.fromEntries(namespaces.map(namespace => [namespace, this.namespace(namespace)]));
  }

  ReadAsync([namespace, key]: [string, string], invocation: Gio.DBusMethodInvocation): void {
    const value = this.value(namespace, key);
    if (value) invocation.return_value(new GLib.Variant('(v)', [value]));
    else invocation.return_dbus_error('org.freedesktop.portal.Error.NotFound', `${namespace} ${key} is not provided here`);
  }

  destroy(): void {
    this.fontconfig.destroy();
  }

  private namespace(namespace: string): Namespace {
    if (namespace === APPEARANCE) return this.appearance();
    if (namespace === FONTCONFIG) return { serial: new GLib.Variant('i', this.fontconfig.serial) };
    const keys = this.schemas.get(namespace)!.settings_schema.list_keys();
    return Object.fromEntries(keys.map(key => [key, this.value(namespace, key)!]));
  }

  private value(namespace: string, key: string): GLib.Variant | null {
    if (namespace === APPEARANCE || namespace === FONTCONFIG) return this.namespace(namespace)[key] ?? null;
    const settings = this.schemas.get(namespace);
    if (!settings?.settings_schema.has_key(key)) return null;
    if (namespace === INTERFACE && key === 'enable-animations') return new GLib.Variant('b', this.shell.enable_animations);
    if (namespace === INTERFACE && key === 'gtk-theme' && this.highContrast()) return new GLib.Variant('s', 'HighContrast');
    return settings.get_value(key);
  }

  private appearance(): Namespace {
    const interfaceSettings = this.schemas.get(INTERFACE)!;
    const values: Namespace = {
      'color-scheme': new GLib.Variant('u', COLOR_SCHEMES[interfaceSettings.get_string('color-scheme')] ?? 0),
      'contrast': new GLib.Variant('u', this.highContrast() ? 1 : 0),
      'reduced-motion': new GLib.Variant('u', interfaceSettings.get_boolean('enable-animations') ? 0 : 1),
    };
    if (this.accent) {
      const [red, green, blue] = this.accent;
      values['accent-color'] = new GLib.Variant('(ddd)', [red / 255, green / 255, blue / 255]);
    }
    return values;
  }

  private highContrast(): boolean {
    return this.schemas.get(A11Y_INTERFACE)?.get_boolean('high-contrast') ?? false;
  }

  private changed(namespace: string, key: string): void {
    if (namespace !== INTERFACE || key !== 'enable-animations') this.emitValue(namespace, key);
    if (namespace === INTERFACE && key === 'color-scheme') this.emitValue(APPEARANCE, 'color-scheme');
    if (namespace === INTERFACE && key === 'enable-animations') this.emitValue(APPEARANCE, 'reduced-motion');
    if (namespace === A11Y_INTERFACE && key === 'high-contrast') {
      this.emitValue(APPEARANCE, 'contrast');
      this.emitValue(INTERFACE, 'gtk-theme');
    }
  }

  private emitValue(namespace: string, key: string): void {
    const value = this.value(namespace, key);
    if (value) this.emit(namespace, key, value);
  }

  private emit(namespace: string, key: string, value: GLib.Variant): void {
    this.dbus.emit_signal('SettingChanged', new GLib.Variant('(ssv)', [namespace, key, value]));
  }
}
