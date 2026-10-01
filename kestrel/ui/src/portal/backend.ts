import Gio from 'gi://Gio';

import type { Rgb } from '../appearance/color.js';
import type { Context } from '../context.js';
import { SettingsPortal } from './appearance/settings.js';
import { AppChooserPortal } from './apps/appChooser.js';
import { BackgroundPortal } from './apps/background.js';
import { DynamicLauncherPortal } from './apps/dynamicLauncher.js';
import { EmailPortal } from './apps/email.js';
import { NotificationPortal } from './apps/notification.js';
import { ScreenshotPortal } from './capture/screenshot.js';
import { GlobalShortcutsPortal } from './shortcuts/globalShortcuts.js';
import { AccountPortal } from './system/account.js';
import { InhibitPortal } from './system/inhibit.js';
import { LockdownPortal } from './system/lockdown.js';
import { UsbPortal } from './system/usb.js';
import { WallpaperPortal } from './system/wallpaper.js';

const BUS_NAME = 'org.freedesktop.impl.portal.desktop.kestrel';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';

interface Portal {
  readonly dbus: Gio.DBusExportedObject;
  destroy?(): void;
}

export class PortalBackend {
  private readonly settings = new SettingsPortal();
  private readonly portals: Portal[];
  private readonly nameId: number;

  constructor(context: Pick<Context, 'keybindings' | 'screenShield'>) {
    this.portals = [
      this.settings,
      new AccountPortal(),
      new AppChooserPortal(),
      new BackgroundPortal(),
      new DynamicLauncherPortal(),
      new EmailPortal(),
      new GlobalShortcutsPortal(context.keybindings),
      new InhibitPortal(context.screenShield),
      new LockdownPortal(),
      new NotificationPortal(),
      new ScreenshotPortal(),
      new UsbPortal(),
      new WallpaperPortal(),
    ];
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
