import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

import { stealFd } from '../../shared/dbus/processes.js';
import { t } from '../../shared/i18n/index.js';
import { appName } from '../core/apps.js';
import type { Dismissal, Options } from '../core/request.js';
import { shareAccount } from './account.js';
import { AppChoosers } from './appChooser.js';
import { addLauncher } from './launcher.js';
import type { PageChoice } from './print/choices.js';
import { chosen, preferences, type Wanted } from './print/exchange.js';
import { choosePrint } from './print/printDialog.js';
import { printer, type Reported } from './print/printers.js';
import { chooseDevices, type Device } from './usb.js';
import { confirmWallpaper } from './wallpaper.js';

Gio._promisify(Gio.OutputStream.prototype, 'splice_async');

const DIALOGS_XML = `<node><interface name="com.lantharos.Kestrel.PortalDialogs">
  <method name="ShareAccount">
    <arg type="s" name="handle" direction="in"/><arg type="s" name="app_id" direction="in"/><arg type="s" name="reason" direction="in"/>
    <arg type="u" name="response" direction="out"/><arg type="a{sv}" name="account" direction="out"/>
  </method>
  <method name="ChooseApplication">
    <arg type="s" name="handle" direction="in"/><arg type="as" name="choices" direction="in"/><arg type="a{sv}" name="options" direction="in"/>
    <arg type="u" name="response" direction="out"/><arg type="s" name="choice" direction="out"/>
  </method>
  <method name="UpdateChoices">
    <arg type="s" name="handle" direction="in"/><arg type="as" name="choices" direction="in"/>
  </method>
  <method name="AddLauncher">
    <arg type="s" name="handle" direction="in"/><arg type="s" name="app_id" direction="in"/><arg type="s" name="name" direction="in"/>
    <arg type="v" name="icon" direction="in"/><arg type="a{sv}" name="options" direction="in"/>
    <arg type="u" name="response" direction="out"/><arg type="s" name="name" direction="out"/>
  </method>
  <method name="ChooseDevices">
    <arg type="s" name="handle" direction="in"/><arg type="s" name="app_id" direction="in"/><arg type="a(sa{sv})" name="devices" direction="in"/>
    <arg type="u" name="response" direction="out"/><arg type="as" name="chosen" direction="out"/>
  </method>
  <method name="ConfirmWallpaper">
    <arg type="s" name="handle" direction="in"/><arg type="s" name="app_id" direction="in"/><arg type="h" name="image" direction="in"/>
    <arg type="u" name="response" direction="out"/>
  </method>
  <method name="ChoosePrint">
    <arg type="s" name="handle" direction="in"/><arg type="s" name="app_id" direction="in"/><arg type="aa{sv}" name="printers" direction="in"/>
    <arg type="a{sv}" name="preferences" direction="in"/><arg type="a{sv}" name="options" direction="in"/>
    <arg type="u" name="response" direction="out"/><arg type="a{sv}" name="choices" direction="out"/>
  </method>
  <method name="Launch">
    <arg type="s" name="desktop_id" direction="in"/><arg type="as" name="uris" direction="in"/>
  </method>
  <method name="Dismiss">
    <arg type="s" name="handle" direction="in"/>
  </method>
</interface></node>`;
const DIALOGS_PATH = '/com/lantharos/Kestrel/PortalDialogs';
const PORTAL_SERVICE = 'com.lantharos.Kestrel.Portal';

type Invocation = Gio.DBusMethodInvocation;

interface PrintOptions {
  pages: PageChoice[];
  ranges_need_support: boolean;
  orientation: boolean;
  accept_label: string;
}

async function readAll(fd: number): Promise<GLib.Bytes> {
  const picture = Gio.MemoryOutputStream.new_resizable();
  await picture.splice_async(new GioUnix.InputStream({ fd, close_fd: true }),
    Gio.OutputStreamSpliceFlags.CLOSE_SOURCE | Gio.OutputStreamSpliceFlags.CLOSE_TARGET, GLib.PRIORITY_DEFAULT, null);
  return picture.steal_as_bytes();
}

export class PortalDialogs {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(DIALOGS_XML, this);
  private readonly dismissals = new Map<string, () => void>();
  private readonly choosers = new AppChoosers();

  constructor() {
    this.dbus.export(Gio.DBus.session, DIALOGS_PATH);
  }

  ShareAccountAsync([handle, appId, reason]: [string, string, string], invocation: Invocation): void {
    this.answer(invocation, async () => new GLib.Variant('(ua{sv})', await shareAccount(this.dismissal(handle), appId, reason)));
  }

  ChooseApplicationAsync([handle, choices, options]: [string, string[], Options], invocation: Invocation): void {
    this.answer(invocation, async () => new GLib.Variant('(us)', await this.choosers.choose(handle, this.dismissal(handle), choices, options)));
  }

  UpdateChoicesAsync([handle, choices]: [string, string[]], invocation: Invocation): void {
    this.answer(invocation, async () => {
      this.choosers.update(handle, choices);
      return null;
    });
  }

  AddLauncherAsync([handle, appId, name, icon, options]: [string, string, string, GLib.Variant, Options], invocation: Invocation): void {
    this.answer(invocation, async () => new GLib.Variant('(us)', await addLauncher(this.dismissal(handle), appId, name, icon, options)));
  }

  ChooseDevicesAsync([handle, appId, devices]: [string, string, Device[]], invocation: Invocation): void {
    this.answer(invocation, async () => new GLib.Variant('(uas)', await chooseDevices(this.dismissal(handle), appId, devices)));
  }

  ConfirmWallpaperAsync([handle, appId, index]: [string, string, number], invocation: Invocation, fds: Gio.UnixFDList | null): void {
    const fd = stealFd(fds, index);
    this.answer(invocation, async () => {
      if (fd === null) throw new Error('The wallpaper preview needs the picture');
      return new GLib.Variant('(u)', [await confirmWallpaper(this.dismissal(handle), appId, await readAll(fd))]);
    });
  }

  ChoosePrintAsync(_parameters: unknown[], invocation: Invocation): void {
    const [handle, appId, reported, wanted, options] = invocation.get_parameters().recursiveUnpack() as [string, string, Reported[], Wanted, PrintOptions];
    this.answer(invocation, async () => {
      const name = appId ? appName(appId) : null;
      const [response, choices] = await choosePrint(this.dismissal(handle), {
        title: name ? t('print-title-from-app', { appName: name }) : t('print-title'),
        acceptLabel: options.accept_label || t('print-accept'),
        printers: reported.map(printer),
        preferences: preferences(wanted),
        pageChoices: available => options.pages.filter(pages => pages !== 'ranges' || !options.ranges_need_support || available.pageRanges),
        orientation: options.orientation,
      });
      return new GLib.Variant('(ua{sv})', [response, choices ? chosen(choices) : {}]);
    });
  }

  LaunchAsync([desktopId, uris]: [string, string[]], invocation: Invocation): void {
    this.answer(invocation, async () => {
      const app = GioUnix.DesktopAppInfo.new(desktopId);
      if (!app) throw new Error(`${desktopId} isn't installed`);
      app.launch_uris(uris, global.create_app_launch_context(0, -1));
      return null;
    });
  }

  DismissAsync([handle]: [string], invocation: Invocation): void {
    this.answer(invocation, async () => {
      this.dismissals.get(handle)?.();
      return null;
    });
  }

  destroy(): void {
    this.dbus.unexport();
  }

  private dismissal(handle: string): Dismissal {
    return end => {
      this.dismissals.set(handle, end);
      return () => this.dismissals.delete(handle);
    };
  }

  private answer(invocation: Invocation, reply: () => Promise<GLib.Variant | null>): void {
    this.authorized(invocation)
      .then(allowed => {
        if (!allowed) {
          invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'Only kestrel-portal can open these dialogs');
          return;
        }
        return reply().then(value => invocation.return_value(value));
      })
      .catch(error => invocation.return_dbus_error('org.freedesktop.DBus.Error.Failed', `${error}`));
  }

  private async authorized(invocation: Invocation): Promise<boolean> {
    try {
      const owner = await invocation.get_connection().call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus',
        'GetNameOwner', new GLib.Variant('(s)', [PORTAL_SERVICE]), new GLib.VariantType('(s)'), Gio.DBusCallFlags.NONE, -1, null);
      return owner.deepUnpack<[string]>()[0] === invocation.get_sender();
    } catch {
      return false;
    }
  }
}
