import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Context } from '../../context.js';
import type { ModalDialog } from '../../shared/dialogs/modalDialog.js';
import { listenerKey, openAppDialog, type Kind, type Listener } from './appDialog.js';

const FIREWALL = 'com.lantharos.Firewall1';
const FIREWALL_PATH = '/com/lantharos/Firewall1';

type Session = Pick<Context, 'sessionMode' | 'screenShield'>;

interface Asking {
  key: string;
  dialog: ModalDialog;
}

/** Asks the person once whether devices on the network may connect to an app that just started listening for them. */
export class AppQuestions {
  private readonly cancellable = new Gio.Cancellable();
  private readonly uid = new Gio.Credentials().get_unix_user();
  private readonly disconnectors: (() => void)[] = [];
  private proxy: Gio.DBusProxy | null = null;
  private waiting: Listener[] = [];
  private asking: Asking | null = null;

  constructor(private readonly session: Session) {
    const sessionId = session.sessionMode.connect('updated', () => this.sync());
    this.disconnectors.push(() => session.sessionMode.disconnect(sessionId));
    const shield = session.screenShield;
    if (shield) {
      const shieldId = shield.connect('active-changed', () => this.sync());
      this.disconnectors.push(() => shield.disconnect(shieldId));
    }
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
    for (const disconnect of this.disconnectors) disconnect();
    this.waiting = [];
    this.asking?.dialog.close();
  }

  private get locked(): boolean {
    return this.session.sessionMode.isLocked || !!this.session.screenShield?.active;
  }

  private read(): void {
    const waiting = (this.proxy?.get_cached_property('Waiting')?.deepUnpack() ?? []) as [Kind, string, number][];
    this.waiting = waiting.filter(([, , uid]) => uid === this.uid).map(([kind, id]) => ({ kind, id }));
    this.sync();
  }

  private sync(): void {
    const { asking } = this;
    if (asking) {
      if (this.locked || !this.waiting.some(listener => listenerKey(listener) === asking.key)) asking.dialog.close();
      return;
    }
    const next = this.waiting[0];
    if (!next || this.locked) return;
    const dialog = openAppDialog(next, allowed => this.answer(next, allowed));
    if (!dialog) return;
    this.asking = { key: listenerKey(next), dialog };
    dialog.connect('closed', () => {
      this.asking = null;
      this.sync();
    });
  }

  private answer(listener: Listener, allowed: boolean): void {
    this.waiting = this.waiting.filter(other => listenerKey(other) !== listenerKey(listener));
    this.proxy?.call('SetAppAccess', new GLib.Variant('(sss)', [listener.kind, listener.id, allowed ? 'home' : 'blocked']),
      Gio.DBusCallFlags.NONE, -1, null, (proxy, result) => {
        try {
          proxy!.call_finish(result);
        } catch (error) {
          console.warn(`Couldn't keep what ${listener.id} may do: ${error}`);
        }
      });
  }
}
