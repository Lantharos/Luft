import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { setSolidSurfaces } from 'resource:///org/gnome/shell/ui/kestrelGlass.js';

import { accentColor, namedAccent, seedFromSamples, toHex, type Rgb, type Seed } from './color.js';
import { appearanceCss, appearanceJson, type Appearance } from './exports.js';
import { userFile, writeText } from './files.js';
import { buildPalette, type Palette } from './palette.js';
import { DarkSchedule } from './schedule/darkSchedule.js';
import { appIcons } from './icons/appIcons.js';
import { GlyphFiles } from './icons/glyphFiles.js';
import { AccentStylesheet, accentStylesheet } from './stylesheet.js';
import { AppThemes } from './themes/appThemes.js';

const APPEARANCE_INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Appearance">
    <property name="AccentColor" type="s" access="read"/>
    <property name="Dark" type="b" access="read"/>
    <property name="PureBlack" type="b" access="read"/>
    <property name="Colors" type="a{ss}" access="read"/>
    <property name="TerminalColors" type="a{ss}" access="read"/>
    <property name="LightColors" type="a{ss}" access="read"/>
    <property name="DarkColors" type="a{ss}" access="read"/>
    <property name="LightTerminalColors" type="a{ss}" access="read"/>
    <property name="DarkTerminalColors" type="a{ss}" access="read"/>
    <property name="AppIcons" type="a{ss}" access="read"/>
  </interface>
</node>`;

const PROPERTIES: [string, string][] = [
  ['AccentColor', 's'], ['Dark', 'b'], ['PureBlack', 'b'], ['Colors', 'a{ss}'], ['TerminalColors', 'a{ss}'],
  ['LightColors', 'a{ss}'], ['DarkColors', 'a{ss}'], ['LightTerminalColors', 'a{ss}'], ['DarkTerminalColors', 'a{ss}'],
  ['AppIcons', 'a{ss}'],
];
const PERSIST_DELAY = 400;

export class AppearanceService {
  private readonly stylesheet = new AccentStylesheet('accent.css');
  private readonly configDirectory = GLib.build_filenamev([GLib.get_user_config_dir(), 'kestrel']);
  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(APPEARANCE_INTERFACE, this);
  private readonly nameId: number;
  private readonly signalIds: [Gio.Settings, number][];
  private readonly themes = new AppThemes();
  private readonly schedule: DarkSchedule;
  private readonly glyphFiles = new GlyphFiles();
  private readonly unwatchIcons = appIcons.watch(() => this.emitChanged('AppIcons'));
  private seed: Seed | null = null;
  private appearance: Appearance | null = null;
  private published = '';
  private persistId = 0;
  private writing = Promise.resolve();

  constructor(private readonly changed: (color: Rgb) => void) {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Appearance');
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, 'com.lantharos.Kestrel', Gio.BusNameOwnerFlags.NONE, null, null);
    setSolidSurfaces(this.settings.get_boolean('pure-black'));
    this.signalIds = [
      [this.interfaceSettings, this.interfaceSettings.connect('changed::color-scheme', () => this.update())],
      [this.settings, this.settings.connect('changed::pure-black', () => {
        setSolidSurfaces(this.settings.get_boolean('pure-black'));
        this.update();
      })],
      [this.settings, this.settings.connect('changed::theme-apps', () => this.schedulePersist())],
    ];
    this.schedule = new DarkSchedule(this.settings, this.interfaceSettings);
  }

  private get palette(): Palette | null {
    return this.appearance?.palette ?? null;
  }

  private get current() {
    return this.appearance && (this.appearance.dark ? this.appearance.palette.dark : this.appearance.palette.light);
  }

  get AccentColor(): string { return this.appearance?.accentColor ?? ''; }
  get Dark(): boolean { return this.interfaceSettings.get_string('color-scheme') === 'prefer-dark'; }
  get PureBlack(): boolean { return this.settings.get_boolean('pure-black'); }
  get Colors(): Record<string, string> { return this.current?.colors ?? {}; }
  get TerminalColors(): Record<string, string> { return this.current?.terminal ?? {}; }
  get LightColors(): Record<string, string> { return this.palette?.light.colors ?? {}; }
  get DarkColors(): Record<string, string> { return this.palette?.dark.colors ?? {}; }
  get LightTerminalColors(): Record<string, string> { return this.palette?.light.terminal ?? {}; }
  get DarkTerminalColors(): Record<string, string> { return this.palette?.dark.terminal ?? {}; }
  get AppIcons(): Record<string, string> {
    const icons: Record<string, string> = { style: appIcons.style, glyphs: this.glyphFiles.directory };
    for (const [style, paint] of Object.entries(appIcons.paints ?? {}))
      for (const [part, value] of Object.entries(paint)) icons[`${style}-${part}`] = String(value);
    return icons;
  }

  apply(samples: Rgb[]): void {
    this.seed = seedFromSamples(samples);
    this.update();
  }

  private emitChanged(name: string): void {
    const [, signature] = PROPERTIES.find(([property]) => property === name)!;
    this.dbus.emit_property_changed(name, new GLib.Variant(signature, this[name as keyof this]));
  }

  private update(): void {
    if (!this.seed) return;
    appIcons.setWallpaper(this.seed, this.Dark);
    const accent = accentColor(this.seed);
    const previousAccent = this.AccentColor;
    this.appearance = {
      accentColor: toHex(accent),
      accentName: namedAccent(this.seed),
      dark: this.Dark,
      pureBlack: this.PureBlack,
      palette: buildPalette(this.seed, this.PureBlack),
    };
    const published = JSON.stringify(this.appearance);
    if (published === this.published) return;
    this.published = published;
    this.stylesheet.load(accentStylesheet(this.appearance.accentColor, this.appearance.palette));
    if (this.appearance.accentColor !== previousAccent) {
      if (this.interfaceSettings.settings_schema.has_key('accent-color'))
        this.interfaceSettings.set_string('accent-color', this.appearance.accentName);
      this.changed(accent);
    }
    for (const [name] of PROPERTIES) this.emitChanged(name);
    this.schedulePersist();
  }

  private schedulePersist(): void {
    if (this.persistId) GLib.source_remove(this.persistId);
    this.persistId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, PERSIST_DELAY, () => {
      this.persistId = 0;
      const appearance = this.appearance;
      this.writing = this.writing.then(() => this.persist(appearance)).catch(error => console.error('Kestrel could not save appearance colors', error));
      return GLib.SOURCE_REMOVE;
    });
  }

  private async persist(appearance: Appearance | null): Promise<void> {
    if (!appearance) return;
    await Promise.all([
      writeText(userFile(this.configDirectory, 'appearance.json'), appearanceJson(appearance)),
      writeText(userFile(this.configDirectory, 'appearance.css'), appearanceCss(appearance)),
      this.settings.get_boolean('theme-apps') ? this.themes.apply(appearance.palette, appearance.dark) : this.themes.remove(),
    ]);
  }

  destroy(): void {
    if (this.persistId) GLib.source_remove(this.persistId);
    for (const [settings, id] of this.signalIds) settings.disconnect(id);
    this.schedule.destroy();
    this.glyphFiles.destroy();
    this.unwatchIcons();
    Gio.bus_unown_name(this.nameId);
    this.dbus.unexport();
    this.stylesheet.unload();
  }
}
