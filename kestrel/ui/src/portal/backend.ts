import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Rgb } from '../accent/color.js';
import { SCREENSHOT_XML, ScreenshotPortal } from './screenshot.js';
import { SETTINGS_XML, SettingsPortal } from './settings.js';

const BUS_NAME = 'org.freedesktop.impl.portal.desktop.kestrel';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';

export class PortalBackend {
  private readonly screenshot = Gio.DBusExportedObject.wrapJSObject(SCREENSHOT_XML, new ScreenshotPortal());
  private readonly settingsPortal = new SettingsPortal((key, value) =>
    this.settings.emit_signal('SettingChanged', new GLib.Variant('(ssv)', ['org.freedesktop.appearance', key, value])));
  private readonly settings = Gio.DBusExportedObject.wrapJSObject(SETTINGS_XML, this.settingsPortal);
  private readonly nameId: number;

  constructor() {
    this.screenshot.export(Gio.DBus.session, PORTAL_PATH);
    this.settings.export(Gio.DBus.session, PORTAL_PATH);
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, null, null);
  }

  setAccent(accent: Rgb): void {
    this.settingsPortal.setAccent(accent);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    this.screenshot.unexport();
    this.settings.unexport();
  }
}
