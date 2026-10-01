import Gio from 'gi://Gio';

import type { Rgb } from '../appearance/color.js';
import { SettingsPortal } from './appearance/settings.js';
import { ScreenshotPortal } from './capture/screenshot.js';

const BUS_NAME = 'org.freedesktop.impl.portal.desktop.kestrel';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';

interface Portal {
  readonly dbus: Gio.DBusExportedObject;
  destroy?(): void;
}

export class PortalBackend {
  private readonly settings = new SettingsPortal();
  private readonly portals: Portal[] = [
    this.settings,
    new ScreenshotPortal(),
  ];
  private readonly nameId: number;

  constructor() {
    for (const portal of this.portals) portal.dbus.export(Gio.DBus.session, PORTAL_PATH);
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, null, null);
  }

  setAccent(accent: Rgb): void {
    this.settings.setAccent(accent);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    for (const portal of this.portals) {
      portal.dbus.unexport();
      portal.destroy?.();
    }
  }
}
