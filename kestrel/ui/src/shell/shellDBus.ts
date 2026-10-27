import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Config from './config.js';
import * as KestrelUi from '../kestrelUi.js';
import { ScreenshotService } from './screenshot/service/screenshotService.js';
import type { ScreenShield } from './lockScreen/screenShield.js';
import type { BrightnessManager } from './system/brightnessManager.js';

import { loadInterfaceXML } from './runtime/fileUtils.js';

const GnomeShellIface = loadInterfaceXML('org.gnome.Shell')!;
const ScreenSaverIface = loadInterfaceXML('org.gnome.ScreenSaver')!;
const BrightnessIface = loadInterfaceXML('com.lantharos.Kestrel.Brightness')!;

export class GnomeShell {
  private readonly dbusImpl: Gio.DBusExportedObject;
  readonly screenshotService: ScreenshotService;

  constructor() {
    this.dbusImpl = Gio.DBusExportedObject.wrapJSObject(GnomeShellIface, this);
    this.dbusImpl.export(Gio.DBus.session, '/org/gnome/Shell');

    this.screenshotService = new ScreenshotService();
  }

  get Mode(): string {
    return global.session_mode;
  }

  get ShellVersion(): string {
    return Config.PACKAGE_VERSION;
  }
}

export class ScreenSaverDBus {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(ScreenSaverIface, this);

  constructor(private readonly screenShield: ScreenShield) {
    screenShield.connect('active-changed', () => {
      this.dbusImpl.emit_signal('ActiveChanged', GLib.Variant.new('(b)', [screenShield.active]));
    });
    screenShield.connect('wake-up-screen', () => {
      this.dbusImpl.emit_signal('WakeUpScreen', null as unknown as GLib.Variant);
    });

    KestrelUi.ownOnItsOwnConnection('org.gnome.ScreenSaver', [[this.dbusImpl, '/org/gnome/ScreenSaver']], () => {});
  }

  LockAsync(_parameters: [], invocation: Gio.DBusMethodInvocation): void {
    const id = this.screenShield.connect('lock-screen-shown', () => {
      this.screenShield.disconnect(id);
      invocation.return_value(null);
    });

    this.screenShield.lock(true);
  }

  SetActiveAsync([active]: [boolean], invocation: Gio.DBusMethodInvocation): void {
    if (active) {
      this.screenShield.activate(true);
    } else if (this.screenShield.locked) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'The screen is locked and only unlocks after signing in');
      return;
    } else {
      this.screenShield.deactivate(false);
    }
    invocation.return_value(null);
  }

  GetActive(): boolean {
    return this.screenShield.active;
  }

  GetActiveTime(): number {
    const started = this.screenShield.activationTime;
    if (started <= 0) return 0;
    return Math.floor((GLib.get_monotonic_time() - started) / 1000000);
  }
}

export class BrightnessDBus {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(BrightnessIface, this);
  private hasBrightnessControl?: boolean;

  constructor(private readonly manager: BrightnessManager) {
    this.dbusImpl.export(Gio.DBus.session, '/com/lantharos/Kestrel/Brightness');

    Gio.DBus.session.own_name('com.lantharos.Kestrel.Brightness', Gio.BusNameOwnerFlags.NONE, null, null);

    manager.connectObject(
      'changed', () => this.sync(),
      'user-update', () => this.dbusImpl.emit_signal('BrightnessChanged', null as unknown as GLib.Variant),
      this);
    this.sync();
  }

  private sync(): void {
    const hasBrightnessControl = !!this.manager.globalScale;
    if (hasBrightnessControl === this.hasBrightnessControl) return;

    this.hasBrightnessControl = hasBrightnessControl;
    this.dbusImpl.emit_property_changed('HasBrightnessControl', new GLib.Variant('b', hasBrightnessControl));
  }

  async SetDimmingAsync([enable]: [boolean], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'dim the screen')) return;
    this.manager.dimming = enable;
    invocation.return_value(null);
  }

  async SetAutoBrightnessTargetAsync([target]: [number], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'change the screen brightness')) return;
    this.manager.autoBrightnessTarget = target;
    invocation.return_value(null);
  }

  get HasBrightnessControl(): boolean | undefined {
    return this.hasBrightnessControl;
  }
}
