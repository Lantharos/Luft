import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../main.js';
import * as MessageTray from '../../notifications/messageTray.js';
import { ScreencastError, ScreencastErrors } from '../../runtime/dbusErrors.js';
import { loadInterfaceXML } from '../../runtime/fileUtils.js';
import { addShowInFilesAction, openFile, screenshotNotificationSource } from '../notifications.js';

type ScreencastOptions = Record<string, GLib.Variant>;

interface ScreencastRemote {
  readonly ScreencastSupported: boolean;
  ScreencastAreaAsync(x: number, y: number, width: number, height: number, fileTemplate: string, options: ScreencastOptions): Promise<[boolean, string]>;
  StopScreencastAsync(): Promise<[boolean]>;
  connectSignal(name: 'Error', callback: (proxy: Gio.DBusProxy, sender: string, args: [string, string]) => void): number;
}

const ScreencastProxy = Gio.DBusProxy.makeProxyWrapper<ScreencastRemote>(loadInterfaceXML('com.lantharos.Kestrel.Screencast'));

type Phase = 'STARTUP' | 'RECORDING';

export interface ScreencastArea {
  x: number;
  y: number;
  width: number;
  height: number;
  drawCursor: boolean;
}

interface ScreencasterHost {
  supportChanged(): void;
  progressChanged(): void;
}

export class Screencaster {
  supported = false;
  inProgress = false;
  private starting = false;
  private path: string | null = null;

  private readonly proxy = ScreencastProxy(Gio.DBus.session, 'com.lantharos.Kestrel.Screencast', '/com/lantharos/Kestrel/Screencast',
    (_proxy, error) => {
      if (error !== null) {
        log('Error connecting to the screencast service');
        return;
      }

      this.supported = this.proxy.ScreencastSupported;
      this.host.supportChanged();
    });

  constructor(private readonly host: ScreencasterHost) {
    this.proxy.connectSignal('Error', (_proxy, _sender, [errorName, message]) =>
      this.failed('RECORDING', Gio.DBusError.new_for_dbus_error(errorName, message)));

    this.proxy.connect('notify::g-name-owner', () => {
      if (this.proxy.g_name_owner || !this.inProgress || this.starting) return;

      this.failed('RECORDING', GLib.Error.new_literal(ScreencastErrors, ScreencastError.SERVICE_CRASH, 'Service crashed'));
    });
  }

  async start(area: ScreencastArea, retries = 0): Promise<void> {
    this.setInProgress(true);
    let retry = false;

    try {
      this.starting = true;

      const [, path] = await this.proxy.ScreencastAreaAsync(
        area.x, area.y, area.width, area.height,
        GLib.build_filenamev([
          KestrelUi.t('screenshot-screencasts-folder'),
          KestrelUi.t('screenshot-screencast-file', { date: '%d', time: '%t' }),
        ]),
        { 'draw-cursor': new GLib.Variant('b', area.drawCursor) });

      this.path = path;
    } catch (error) {
      if ((error as GLib.Error).matches(Gio.DBusError, Gio.DBusError.NO_REPLY) && retries < 2)
        retry = true;
      else
        this.failed('STARTUP', error as GLib.Error);
    }

    this.starting = false;

    if (retry) {
      console.log('Screencast service crashed during startup, trying again');
      this.setInProgress(false);
      void this.start(area, retries + 1);
    }
  }

  async stop(): Promise<void> {
    if (!this.inProgress) return;

    this.setInProgress(false);

    try {
      const [success] = await this.proxy.StopScreencastAsync();
      if (!success) throw new Error();
    } catch (error) {
      const { message } = error as Error;
      log(message ? `Error stopping screencast: ${message}` : 'Error stopping screencast');
      return;
    }

    this.showNotification(KestrelUi.t('screenshot-screencast-recorded'));
  }

  private failed(phase: Phase, error: GLib.Error): void {
    console.error(`Screencast failed during phase ${phase}: ${error}`);

    this.setInProgress(false);

    if (phase === 'STARTUP') {
      this.path = null;
      this.showNotification(KestrelUi.t('screenshot-screencast-start-failed'));
    } else if (error.matches(ScreencastErrors, ScreencastError.OUT_OF_DISK_SPACE)) {
      this.showNotification(KestrelUi.t('screenshot-screencast-out-of-space'));
    } else if (error.matches(ScreencastErrors, ScreencastError.SERVICE_CRASH)) {
      this.showNotification(KestrelUi.t('screenshot-screencast-try-again'));
    } else {
      this.showNotification(KestrelUi.t('screenshot-screencast-failed'));
    }
  }

  private showNotification(title: string): void {
    const source = screenshotNotificationSource();
    const notification = new MessageTray.Notification({
      source,
      title,
      body: this.path ? KestrelUi.t('screenshot-screencast-view') : '',
      isTransient: true,
    });

    if (this.path) {
      const file = Gio.file_new_for_path(this.path);
      addShowInFilesAction(notification, file);
      notification.connect('activated', () => openFile(file));
      Main.closeShellPopups();
    }

    source.addNotification(notification);
  }

  private setInProgress(inProgress: boolean): void {
    if (this.inProgress === inProgress) return;

    this.inProgress = inProgress;
    this.host.progressChanged();
  }
}
