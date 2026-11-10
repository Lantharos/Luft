import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { ModalDialog } from '../../../shared/dialogs/modalDialog.js';
import { listenerKey, openAppDialog, type Kind, type Listener } from './appDialog.js';

const FIREWALL = 'com.lantharos.Firewall1';
const FIREWALL_PATH = '/com/lantharos/Firewall1';

export class AppQuestions {
  private readonly cancellable = new Gio.Cancellable();
  private readonly uid = new Gio.Credentials().get_unix_user();
  private proxy: Gio.DBusProxy | null = null;
  private waiting: Listener[] = [];
  private readonly answering = new Set<string>();
  private asking: ModalDialog | null = null;

  constructor() {
    Gio.DBusProxy.new(Gio.DBus.system, Gio.DBusProxyFlags.DO_NOT_AUTO_START, null, FIREWALL, FIREWALL_PATH, FIREWALL,
      this.cancellable, (_source, result) => {
        try {
          this.proxy = Gio.DBusProxy.new_finish(result);
        } catch (error) {
          if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
            console.warn(`Can't ask about apps listening on the network: ${error}`);
          return;
        }
        this.proxy.connect('g-properties-changed', () => this.read());
        this.read();
      });
  }

  destroy(): void {
    this.cancellable.cancel();
    this.waiting = [];
    this.asking?.close();
  }

  private read(): void {
    const waiting = (this.proxy?.get_cached_property('Waiting')?.deepUnpack() ?? []) as [Kind, string, number][];
    this.waiting = waiting.filter(([kind, id, uid]) => uid === this.uid && !this.answering.has(listenerKey({ kind, id })))
      .map(([kind, id]) => ({ kind, id }));
    this.sync();
  }

  private sync(): void {
    if (this.asking) return;
    const next = this.waiting[0];
    if (!next) return;
    const dialog = openAppDialog(next, allowed => this.answer(next, allowed));
    if (!dialog) return;
    this.asking = dialog;
    dialog.connect('closed', () => {
      this.asking = null;
      this.sync();
    });
  }

  private answer(listener: Listener, allowed: boolean): void {
    const key = listenerKey(listener);
    this.answering.add(key);
    this.waiting = this.waiting.filter(other => listenerKey(other) !== key);
    this.proxy?.call('SetAppAccess', new GLib.Variant('(sss)', [listener.kind, listener.id, allowed ? 'home' : 'blocked']),
      Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION, -1, null, (proxy, result) => {
        this.answering.delete(key);
        try {
          proxy!.call_finish(result);
        } catch (error) {
          console.warn(`Couldn't keep what ${listener.id} may do: ${error}`);
        }
      });
  }
}
