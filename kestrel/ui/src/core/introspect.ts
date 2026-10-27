import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { loadInterfaceXML } from './runtime/fileUtils.js';

const INTROSPECT_DBUS_API_VERSION = 3;

const IntrospectDBusIface = loadInterfaceXML('com.lantharos.Kestrel.Introspect')!;

export class IntrospectService {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(IntrospectDBusIface, this);
  private readonly settings = St.Settings.get();
  private animationsEnabled = true;
  private screenWidth?: number;
  private screenHeight?: number;

  constructor() {
    this.dbusImpl.export(Gio.DBus.session, '/com/lantharos/Kestrel/Introspect');
    Gio.DBus.session.own_name('com.lantharos.Kestrel.Introspect', Gio.BusNameOwnerFlags.REPLACE, null, null);

    this.settings.connect('notify::enable-animations', () => this.syncAnimationsEnabled());
    this.syncAnimationsEnabled();

    global.backend.get_monitor_manager().connect('monitors-changed', () => this.syncScreenSize());
    this.syncScreenSize();
  }

  private syncAnimationsEnabled(): void {
    const wasEnabled = this.animationsEnabled;
    this.animationsEnabled = this.settings.enable_animations;
    if (wasEnabled === this.animationsEnabled) return;

    this.dbusImpl.emit_property_changed('AnimationsEnabled', new GLib.Variant('b', this.animationsEnabled));
  }

  private syncScreenSize(): void {
    const { screen_width: width, screen_height: height } = global;
    if (width === this.screenWidth && height === this.screenHeight) return;

    this.screenWidth = width;
    this.screenHeight = height;
    this.dbusImpl.emit_property_changed('ScreenSize', new GLib.Variant('(ii)', [width, height]));
  }

  get AnimationsEnabled(): boolean {
    return this.animationsEnabled;
  }

  get ScreenSize(): [number | undefined, number | undefined] {
    return [this.screenWidth, this.screenHeight];
  }

  get version(): number {
    return INTROSPECT_DBUS_API_VERSION;
  }
}
