import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { accentFromSamples, namedAccent, toHex, withLightness, type Rgb } from './color.js';
import { accentStylesheet } from './stylesheet.js';

const APPEARANCE_INTERFACE = `<node>
  <interface name="dev.lantharos.Kestrel.Appearance">
    <property name="AccentColor" type="s" access="read"/>
  </interface>
</node>`;

export class AccentService {
  private readonly stylesheet = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', 'accent.css']));
  private readonly configDirectory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_config_dir(), 'kestrel']));
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(APPEARANCE_INTERFACE, this);
  private readonly nameId: number;
  private stylesheetLoaded = false;
  private accent = '';

  constructor() {
    this.dbus.export(Gio.DBus.session, '/dev/lantharos/Kestrel/Appearance');
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, 'dev.lantharos.Kestrel', Gio.BusNameOwnerFlags.NONE, null, null);
  }

  private get theme(): St.Theme {
    return St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage).get_theme();
  }

  get AccentColor(): string {
    return this.accent;
  }

  apply(samples: Rgb[]): void {
    const color = accentFromSamples(samples);
    const hex = toHex(color);
    if (hex === this.accent) return;
    this.accent = hex;
    this.loadStylesheet(accentStylesheet(color));
    if (this.interfaceSettings.settings_schema.has_key('accent-color'))
      this.interfaceSettings.set_string('accent-color', namedAccent(color));
    this.dbus.emit_property_changed('AccentColor', new GLib.Variant('s', hex));
    this.writeConfig(color);
  }

  private loadStylesheet(css: string): void {
    GLib.mkdir_with_parents(this.stylesheet.get_parent()!.get_path()!, 0o700);
    this.stylesheet.replace_contents(new TextEncoder().encode(css), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
    if (this.stylesheetLoaded) this.theme.unload_stylesheet(this.stylesheet);
    this.theme.load_stylesheet(this.stylesheet);
    this.stylesheetLoaded = true;
  }

  private writeConfig(color: Rgb): void {
    GLib.mkdir_with_parents(this.configDirectory.get_path()!, 0o755);
    const hex = toHex(color);
    const strong = toHex(withLightness(color, 0.42));
    const json = JSON.stringify({ accentColor: hex, accentStrongColor: strong, accentName: namedAccent(color) }, null, 2);
    const css = `:root {\n  --kestrel-accent: ${hex};\n  --kestrel-accent-strong: ${strong};\n}\n`;
    for (const [name, contents] of [['appearance.json', `${json}\n`], ['appearance.css', css]])
      this.configDirectory.get_child(name).replace_contents(new TextEncoder().encode(contents), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    this.dbus.unexport();
    if (this.stylesheetLoaded) this.theme.unload_stylesheet(this.stylesheet);
  }
}
