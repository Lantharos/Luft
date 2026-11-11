import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ModalDialog } from '../../../shared/dialogs/modalDialog.js';
import { openCrashDialog, type Answer, type Waiting } from './dialog.js';

const REPORTS = 'com.lantharos.CrashReports1';
const REPORTS_PATH = '/com/lantharos/CrashReports1';

/** Asks about each crash of one of Luft's programs the crash reports service is waiting on, one at a time. */
export class CrashReports {
  private readonly cancellable = new Gio.Cancellable();
  private proxy: Gio.DBusProxy | null = null;
  private asking: ModalDialog | null = null;
  private readonly answered = new Set<string>();

  constructor() {
    Gio.DBusProxy.new(Gio.DBus.session, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null, REPORTS, REPORTS_PATH, REPORTS,
      this.cancellable, (_source, result) => {
        try {
          this.proxy = Gio.DBusProxy.new_finish(result);
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
            console.warn(`Can't ask about crash reports: ${error}`);
          return;
        }
        this.proxy.connect('g-properties-changed', () => this.sync());
        this.proxy.connect('notify::g-name-owner', () => this.sync());
        this.sync();
      });
  }

  destroy(): void {
    this.cancellable.cancel();
    this.asking?.close();
  }

  private waiting(): Waiting | null {
    if (this.proxy?.get_cached_property('Available')?.deepUnpack() !== true) return null;
    const waiting = this.proxy.get_cached_property('Waiting')?.deepUnpack() as string | undefined;
    if (!waiting) return null;
    const parsed = JSON.parse(waiting) as Waiting;
    return this.answered.has(parsed.id) ? null : parsed;
  }

  private sync(): void {
    if (this.asking) return;
    const waiting = this.waiting();
    if (!waiting) return;
    const dialog = openCrashDialog(waiting, answer => this.answer(waiting.id, answer));
    if (!dialog) return;
    this.asking = dialog;
    dialog.connect('closed', () => {
      this.asking = null;
      this.sync();
    });
  }

  private answer(id: string, { send, remember }: Answer): void {
    this.answered.add(id);
    this.proxy?.call('Answer', new GLib.Variant('(sbb)', [id, send, remember]), Gio.DBusCallFlags.NONE, -1, null,
      (proxy, result) => {
        try {
          proxy!.call_finish(result);
        } catch (error) {
          console.warn(`Couldn't answer about a crash report: ${error}`);
        }
      });
  }
}
