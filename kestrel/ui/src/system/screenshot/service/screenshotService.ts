import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../../core/main.js';
import { loadInterfaceXML } from '../../../core/runtime/fileUtils.js';
import { DBusSenderChecker } from '../../../core/runtime/util.js';
import { UIMode } from '../ui/screenshotUI.js';
import { Flashspot } from './flashspot.js';
import { PickPixel } from './pickPixel.js';
import { SelectArea } from './selectArea.js';

Gio._promisify(Shell.Screenshot.prototype, 'screenshot');
Gio._promisify(Shell.Screenshot.prototype, 'screenshot_window');
Gio._promisify(Shell.Screenshot.prototype, 'screenshot_area');

const ScreenshotIface = loadInterfaceXML('org.gnome.Shell.Screenshot')!;

type Area = [x: number, y: number, width: number, height: number];

type Target =
  | { stream: Gio.MemoryOutputStream; file: null }
  | { stream: Gio.FileOutputStream; file: Gio.File };

type Take = (screenshot: Shell.Screenshot, stream: Gio.OutputStream) => Promise<unknown>;

const cancelled = (invocation: Gio.DBusMethodInvocation) =>
  invocation.return_error_literal(Gio.io_error_quark(), Gio.IOErrorEnum.CANCELLED, 'Operation was cancelled');

function scaleArea([x, y, width, height]: Area, scale: (value: number, factor: number) => number): Area {
  const factor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
  return [scale(x, factor), scale(y, factor), scale(width, factor), scale(height, factor)];
}

function checkArea([x, y, width, height]: Area): boolean {
  return x >= 0 && y >= 0 &&
    width > 0 && height > 0 &&
    x + width <= global.screen_width &&
    y + height <= global.screen_height;
}

function* relativeFiles(filename: string): Generator<Gio.File, never> {
  const name = filename.replace(/\.png$/, '');
  const path = [
    GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES),
    GLib.get_home_dir(),
  ].find(p => p && GLib.file_test(p, GLib.FileTest.EXISTS))!;

  yield Gio.File.new_for_path(GLib.build_filenamev([path, `${name}.png`]));
  for (let idx = 1; ; idx++) yield Gio.File.new_for_path(GLib.build_filenamev([path, `${name}-${idx}.png`]));
}

function flashWhenTaken(screenshot: Shell.Screenshot): Promise<void> {
  return new Promise(resolve => {
    screenshot.connect('screenshot-taken', (_screenshot, area) => {
      new Flashspot(area).fire(resolve);
      KestrelUi.playSound('screenshot');
    });
  });
}

export class ScreenshotService {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(ScreenshotIface, this);
  private readonly shooters = new Map<string, number>();
  private readonly senderChecker = new DBusSenderChecker(['org.freedesktop.impl.portal.desktop.kestrel']);
  private readonly lockdownSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.lockdown' });

  constructor() {
    this.dbusImpl.export(Gio.DBus.session, '/org/gnome/Shell/Screenshot');
    Gio.DBus.session.own_name('org.gnome.Shell.Screenshot', Gio.BusNameOwnerFlags.REPLACE, null, null);
  }

  async ScreenshotAreaAsync(params: [...Area, boolean, string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const [x, y, width, height, flash, filename] = params;
    const area = scaleArea([x, y, width, height], (value, factor) => value * factor);
    if (!checkArea(area)) {
      invocation.return_error_literal(Gio.io_error_quark(), Gio.IOErrorEnum.INVALID_ARGUMENT,
        'The area is empty or reaches past the screen');
      return;
    }
    await this.shoot(invocation, filename, flash,
      (screenshot, stream) => screenshot.screenshot_area(...area, stream));
  }

  async ScreenshotWindowAsync(params: [boolean, boolean, boolean, string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const [includeFrame, includeCursor, flash, filename] = params;
    await this.shoot(invocation, filename, flash,
      (screenshot, stream) => screenshot.screenshot_window(includeFrame, includeCursor, stream));
  }

  async ScreenshotAsync(params: [boolean, boolean, string], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const [includeCursor, flash, filename] = params;
    await this.shoot(invocation, filename, flash,
      (screenshot, stream) => screenshot.screenshot(includeCursor, stream));
  }

  async InteractiveScreenshotAsync(_params: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (!await this.allowCaller(invocation)) return;

    Main.screenshotUI.connectObject(
      'screenshot-taken', (_ui: unknown, file: Gio.File) => {
        Main.screenshotUI.disconnectObject(invocation);
        invocation.return_value(new GLib.Variant('(bs)', [true, file.get_uri()]));
      },
      'closed', () => {
        Main.screenshotUI.disconnectObject(invocation);
        invocation.return_value(new GLib.Variant('(bs)', [false, '']));
      },
      invocation);

    Main.screenshotUI.open(UIMode.SCREENSHOT_ONLY).catch(logError);
  }

  async SelectAreaAsync(_params: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (!await this.allowCaller(invocation)) return;

    const area = await new SelectArea().selectAsync().catch(() => null);
    if (!area) {
      cancelled(invocation);
      return;
    }

    const selected = scaleArea([area.x, area.y, area.width, area.height], (value, factor) => value / factor);
    invocation.return_value(GLib.Variant.new('(iiii)', selected));
  }

  async PickColorAsync(_params: [], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const screenshot = await this.createScreenshot(invocation, false, false);
    if (!screenshot) return;

    try {
      const color = await new PickPixel(screenshot).pickAsync().catch(() => null);
      if (!color) {
        cancelled(invocation);
        return;
      }

      invocation.return_value(GLib.Variant.new('(a{sv})', [{
        color: GLib.Variant.new('(ddd)', [color.red / 255.0, color.green / 255.0, color.blue / 255.0]),
      }]));
    } finally {
      this.removeShooterForSender(invocation.get_sender()!);
    }
  }

  private async createScreenshot(invocation: Gio.DBusMethodInvocation, needsDisk = true, restrictCallers = true): Promise<Shell.Screenshot | null> {
    const lockedDown = needsDisk && this.lockdownSettings.get_boolean('disable-save-to-disk');

    const sender = invocation.get_sender()!;
    if (this.shooters.has(sender)) {
      invocation.return_error_literal(Gio.io_error_quark(), Gio.IOErrorEnum.BUSY,
        'There is an ongoing operation for this sender');
      return null;
    }
    if (lockedDown) {
      invocation.return_error_literal(Gio.io_error_quark(), Gio.IOErrorEnum.PERMISSION_DENIED,
        'Saving to disk is disabled');
      return null;
    }
    if (restrictCallers && !await this.allowCaller(invocation)) return null;

    this.shooters.set(sender, Gio.bus_watch_name(Gio.BusType.SESSION, sender, Gio.BusNameWatcherFlags.NONE, null,
      (_connection, name) => this.removeShooterForSender(name)));
    return new Shell.Screenshot();
  }

  private async allowCaller(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
    try {
      await this.senderChecker.checkInvocation(invocation);
      return true;
    } catch {
      invocation.return_error_literal(Gio.dbus_error_quark(), Gio.DBusError.ACCESS_DENIED,
        'Screenshots are limited to the system. To see or use windows, run peek --help');
      return false;
    }
  }

  private removeShooterForSender(sender: string): void {
    const watchId = this.shooters.get(sender);
    if (watchId === undefined) return;

    Gio.bus_unwatch_name(watchId);
    this.shooters.delete(sender);
  }

  private createTarget(filename: string, invocation: Gio.DBusMethodInvocation): Target | null {
    if (filename === '') return { stream: Gio.MemoryOutputStream.new_resizable(), file: null };

    if (GLib.path_is_absolute(filename)) {
      try {
        const file = Gio.File.new_for_path(filename);
        return { stream: file.replace(null, false, Gio.FileCreateFlags.NONE, null), file };
      } catch (e) {
        invocation.return_gerror(e as GLib.Error);
        this.removeShooterForSender(invocation.get_sender()!);
        return null;
      }
    }

    let error!: GLib.Error;
    for (const file of relativeFiles(filename)) {
      try {
        return { stream: file.create(Gio.FileCreateFlags.NONE, null), file };
      } catch (e) {
        error = e as GLib.Error;
        if (!error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) break;
      }
    }

    invocation.return_gerror(error);
    this.removeShooterForSender(invocation.get_sender()!);
    return null;
  }

  private async shoot(invocation: Gio.DBusMethodInvocation, filename: string, flash: boolean, take: Take): Promise<void> {
    const screenshot = await this.createScreenshot(invocation);
    if (!screenshot) return;

    const target = this.createTarget(filename, invocation);
    if (!target) return;

    try {
      await Promise.all([
        flash ? flashWhenTaken(screenshot) : null,
        take(screenshot, target.stream),
      ]);
      this.complete(target, invocation);
    } catch (e) {
      target.stream.close(null);
      invocation.return_gerror(e as GLib.Error);
    } finally {
      this.removeShooterForSender(invocation.get_sender()!);
    }
  }

  private complete(target: Target, invocation: Gio.DBusMethodInvocation): void {
    target.stream.close(null);

    if (target.file === null)
      St.Clipboard.get_default().set_content(St.ClipboardType.CLIPBOARD, 'image/png', target.stream.steal_as_bytes());

    invocation.return_value(GLib.Variant.new('(bs)', [true, target.file?.get_path() ?? '']));
  }
}
