import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Clients } from './clients.js';
import { EndSession, type EndAction } from './endSession.js';
import { Inhibitors } from './inhibitors.js';
import { BUS_NAME, InhibitFlags, MANAGER_PATH, MANAGER_XML } from './interfaces.js';
import { Peers } from './peers.js';
import { Presence } from './presence.js';
import { availability, exportEnvironment, perform, watchSession, type SessionState } from './system.js';

const LOGOUT_NO_CONFIRMATION = 1;
const LOGOUT_FORCE = 2;

type Invocation = Gio.DBusMethodInvocation;

export class SessionManager {
  private readonly exported: Gio.DBusExportedObject;
  private readonly peers = new Peers(name => this.forget(name));
  private readonly inhibitors = new Inhibitors((added, path) => this.inhibitorsChanged(added, path));
  private readonly clients = new Clients((added, path) => this.exported.emit_signal(added ? 'ClientAdded' : 'ClientRemoved', new GLib.Variant('(o)', [path])));
  private readonly endSession = new EndSession(this.clients,
    () => this.exported.emit_signal('SessionOver', new GLib.Variant('()', [])),
    () => this.exported.emit_signal('SessionRunning', new GLib.Variant('()', [])));
  private readonly presence = new Presence();
  private readonly stopWatchingSession: () => void;
  private readonly nameId: number;
  private state: SessionState = { active: true, locked: false };

  constructor() {
    const manager = this;
    this.exported = Gio.DBusExportedObject.wrapJSObject(MANAGER_XML, {
      SetenvAsync: ([name, value]: [string, string], invocation: Invocation) => {
        exportEnvironment({ [name]: value });
        invocation.return_value(null);
      },
      GetLocale: () => GLib.getenv('LANG') ?? 'C',
      RegisterClientAsync: ([_appId]: [string, string], invocation: Invocation) => {
        const sender = invocation.get_sender()!;
        this.peers.watch(sender);
        invocation.return_value(new GLib.Variant('(o)', [this.clients.register(sender)]));
      },
      UnregisterClient: (path: string) => this.clients.unregister(path),
      InhibitAsync: ([appId, _window, reason, flags]: [string, number, string, number], invocation: Invocation) => {
        if (!flags) {
          invocation.return_dbus_error('org.gnome.SessionManager.GeneralError', 'Nothing to inhibit');
          return;
        }
        const sender = invocation.get_sender()!;
        this.peers.watch(sender);
        invocation.return_value(new GLib.Variant('(u)', [this.inhibitors.add(sender, appId, reason, flags, '/')]));
      },
      UninhibitAsync: ([cookie]: [number], invocation: Invocation) => {
        if (this.inhibitors.remove(cookie)) invocation.return_value(null);
        else invocation.return_dbus_error('org.gnome.SessionManager.GeneralError', 'Unknown inhibitor');
      },
      IsInhibited: (flags: number) => !!(this.inhibitors.flags & flags),
      GetInhibitors: () => this.inhibitors.paths(),
      IsSessionRunning: () => true,
      Logout: (mode: number) => this.end('logout', mode),
      Shutdown: () => this.end('shutdown', 0),
      Reboot: () => this.end('reboot', 0),
      SuspendAsync: (_parameters: [], invocation: Invocation) => this.reply(invocation, perform('Suspend').then(() => null)),
      CanShutdownAsync: (_parameters: [], invocation: Invocation) => this.reply(invocation, this.availability('PowerOff')),
      CanRebootAsync: (_parameters: [], invocation: Invocation) => this.reply(invocation, this.availability('Reboot')),
      CanSuspendAsync: (_parameters: [], invocation: Invocation) => this.reply(invocation, this.availability('Suspend')),
      SessionName: 'kestrel',
      SessionClass: 'user',
      RestoreSupported: false,
      get SessionIsActive() { return manager.state.active; },
      get SessionIsLocked() { return manager.state.locked; },
      get InhibitedActions() { return manager.inhibitors.flags; },
    });
    this.exported.export(Gio.DBus.session, MANAGER_PATH);
    this.stopWatchingSession = watchSession(state => {
      const previous = this.state;
      this.state = state;
      if (state.active !== previous.active) this.exported.emit_property_changed('SessionIsActive', new GLib.Variant('b', state.active));
      if (state.locked !== previous.locked) this.exported.emit_property_changed('SessionIsLocked', new GLib.Variant('b', state.locked));
    });
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.REPLACE, () =>
      this.exported.emit_signal('SessionRunning', new GLib.Variant('()', [])), null);
  }

  destroy(): void {
    Gio.bus_unown_name(this.nameId);
    this.stopWatchingSession();
    this.endSession.destroy();
    this.presence.destroy();
    this.inhibitors.destroy();
    this.clients.destroy();
    this.peers.destroy();
    this.exported.unexport();
  }

  private end(action: EndAction, mode: number): void {
    if (mode & (LOGOUT_NO_CONFIRMATION | LOGOUT_FORCE)) void this.endSession.finish(action, !(mode & LOGOUT_FORCE));
    else this.endSession.request(action, this.inhibitors.paths(InhibitFlags.LOGOUT));
  }

  private async availability(action: 'PowerOff' | 'Reboot' | 'Suspend'): Promise<GLib.Variant> {
    return new GLib.Variant('(u)', [await availability(action)]);
  }

  private reply(invocation: Invocation, result: Promise<GLib.Variant | null>): void {
    result.then(value => invocation.return_value(value))
      .catch(error => invocation.return_dbus_error('org.gnome.SessionManager.GeneralError', `${error}`));
  }

  private inhibitorsChanged(added: boolean, path: string): void {
    this.exported.emit_signal(added ? 'InhibitorAdded' : 'InhibitorRemoved', new GLib.Variant('(o)', [path]));
    this.exported.emit_property_changed('InhibitedActions', new GLib.Variant('u', this.inhibitors.flags));
  }

  private forget(name: string): void {
    this.inhibitors.removeOwner(name);
    this.clients.removeOwner(name);
  }
}
