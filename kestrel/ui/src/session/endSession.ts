import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Clients } from './clients.js';
import { FAREWELL_DURATION } from './interfaces.js';
import { perform, stopSession } from './system.js';

export type EndAction = 'logout' | 'shutdown' | 'reboot';

const SHELL = 'org.gnome.Shell';
const DIALOG_PATH = '/org/gnome/SessionManager/EndSessionDialog';
const DIALOG_INTERFACE = 'org.gnome.SessionManager.EndSessionDialog';
const DIALOG_TYPES: Record<EndAction, number> = { logout: 0, shutdown: 1, reboot: 2 };
const CONFIRMATIONS: Record<string, EndAction> = { ConfirmedLogout: 'logout', ConfirmedShutdown: 'shutdown', ConfirmedReboot: 'reboot' };
const CONFIRM_SECONDS = 60;

export class EndSession {
  private subscription = 0;

  constructor(private readonly clients: Clients, private readonly over: () => void, private readonly resumed: () => void) {}

  request(action: EndAction, inhibitors: string[]): void {
    this.dismiss();
    const bus = Gio.DBus.session;
    this.subscription = bus.signal_subscribe(SHELL, DIALOG_INTERFACE, null, DIALOG_PATH, null,
      Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, signal) => {
        if (signal === 'Closed') return;
        this.dismiss();
        const confirmed = CONFIRMATIONS[signal];
        if (confirmed) void this.finish(confirmed, true);
      });
    bus.call(SHELL, DIALOG_PATH, DIALOG_INTERFACE, 'Open',
      new GLib.Variant('(uuuao)', [DIALOG_TYPES[action], 0, CONFIRM_SECONDS, inhibitors]), null, Gio.DBusCallFlags.NONE, -1, null)
      .catch(error => {
        this.dismiss();
        console.error(`Could not ask to end the session: ${error}`);
      });
  }

  async finish(action: EndAction, askClients: boolean): Promise<void> {
    if (askClients) {
      await this.clients.queryEndSession();
      await this.clients.endSession();
    }
    this.over();
    await new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, FAREWELL_DURATION, () => {
      resolve(null);
      return GLib.SOURCE_REMOVE;
    }));
    try {
      if (action === 'logout') await stopSession();
      else await perform(action === 'shutdown' ? 'PowerOff' : 'Reboot');
    } catch (error) {
      console.error(`Could not end the session: ${error}`);
      this.resumed();
    }
  }

  destroy(): void {
    this.dismiss();
  }

  private dismiss(): void {
    if (this.subscription) Gio.DBus.session.signal_unsubscribe(this.subscription);
    this.subscription = 0;
  }
}
