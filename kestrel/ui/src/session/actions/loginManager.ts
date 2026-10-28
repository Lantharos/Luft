import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';
import { EventEmitter } from '../../core/runtime/signals.js';

const LOGIN = 'org.freedesktop.login1';
const BOOT_LOADER_MENU_TIMEOUT_USEC = 60000000;

type SessionEntry = [id: string, uid: number, userName: string, seat: string, sessionPath: string];

interface ManagerMethods {
  readonly LidClosed: boolean;
  GetSessionAsync(sessionId: string): Promise<[string]>;
  CanRebootToBootLoaderMenuAsync(): Promise<[string]>;
  SetRebootToBootLoaderMenuAsync(timeout: number): Promise<[]>;
  ListSessionsAsync(): Promise<[SessionEntry[]]>;
  connectSignal(name: 'PrepareForSleep', callback: (proxy: Gio.DBusProxy, sender: string, args: [boolean]) => void): number;
}

interface SessionMethods {
  readonly Id: string;
  readonly Active: boolean;
  readonly LockedHint: boolean;
  SetLockedHintAsync(locked: boolean): Promise<[]>;
  connectSignal(name: 'Lock' | 'Unlock', callback: () => void): number;
}

export type LoginSession = Gio.DBusProxy & SessionMethods;

interface ProxyClass<T> {
  new (bus: Gio.DBusConnection, name: string, path: string): Gio.DBusProxy & T;
  newAsync(bus: Gio.DBusConnection, name: string, path: string): Promise<Gio.DBusProxy & T>;
}

const SystemdLoginManager = Gio.DBusProxy.makeProxyWrapper(loadInterfaceXML('org.freedesktop.login1.Manager')) as unknown as ProxyClass<ManagerMethods>;
const SystemdLoginSession = Gio.DBusProxy.makeProxyWrapper(loadInterfaceXML('org.freedesktop.login1.Session')) as unknown as ProxyClass<SessionMethods>;

interface LoginManagerSignals {
  'prepare-for-sleep': (aboutToSuspend: boolean) => void;
  'lid-changed': (closed: boolean) => void;
}

let loginManager: LoginManager | null = null;

export function getLoginManager(): LoginManager {
  loginManager ??= new LoginManager();
  return loginManager;
}

class LoginManager extends EventEmitter {
  declare connect: GObject.SignalMethods<this, LoginManagerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, LoginManagerSignals>['emit'];

  private preparing = false;
  private currentSession: LoginSession | null = null;
  private readonly proxy = new SystemdLoginManager(Gio.DBus.system, LOGIN, '/org/freedesktop/login1');

  constructor() {
    super();
    this.proxy.connectSignal('PrepareForSleep', (_proxy, _sender, [aboutToSuspend]) => {
      this.preparing = aboutToSuspend;
      this.emit('prepare-for-sleep', aboutToSuspend);
    });
    this.proxy.connect('g-properties-changed', (_proxy, changed: GLib.Variant) => {
      if (changed.lookup_value('LidClosed', null)) this.emit('lid-changed', this.lidClosed);
    });
  }

  get lidClosed(): boolean {
    return this.proxy.LidClosed ?? false;
  }

  get preparingForSleep(): boolean {
    return this.preparing;
  }

  async getCurrentSessionProxy(): Promise<LoginSession | null> {
    if (this.currentSession) return this.currentSession;

    let sessionId = GLib.getenv('XDG_SESSION_ID');
    if (!sessionId) {
      log('Unset XDG_SESSION_ID, getCurrentSessionProxy() called outside a user session. Asking logind directly.');
      try {
        const autoSession = await SystemdLoginSession.newAsync(Gio.DBus.system, LOGIN, '/org/freedesktop/login1/session/auto');
        sessionId = autoSession.Id;
      } catch (error) {
        logError(error as Error, 'Failed to get session from logind');
        return null;
      }
    }

    log(`Will monitor session ${sessionId}`);
    try {
      const [objectPath] = await this.proxy.GetSessionAsync(sessionId);
      this.currentSession = await SystemdLoginSession.newAsync(Gio.DBus.system, LOGIN, objectPath);
      return this.currentSession;
    } catch (error) {
      logError(error as Error, `Could not get proxy for session ${sessionId}`);
      return null;
    }
  }

  async canRebootToBootLoaderMenu(): Promise<{ canRebootToBootLoaderMenu: boolean; needsAuth: boolean }> {
    try {
      const [result] = await this.proxy.CanRebootToBootLoaderMenuAsync();
      const needsAuth = result === 'challenge';
      return { canRebootToBootLoaderMenu: needsAuth || result === 'yes', needsAuth };
    } catch {
      return { canRebootToBootLoaderMenu: false, needsAuth: false };
    }
  }

  setRebootToBootLoaderMenu(): void {
    void this.proxy.SetRebootToBootLoaderMenuAsync(BOOT_LOADER_MENU_TIMEOUT_USEC);
  }

  async listSessions(): Promise<SessionEntry[]> {
    try {
      const [sessions] = await this.proxy.ListSessionsAsync();
      return sessions;
    } catch {
      return [];
    }
  }

  async inhibit(reason: string, cancellable: Gio.Cancellable): Promise<GioUnix.InputStream> {
    const inVariant = new GLib.Variant('(ssss)', ['sleep', 'Kestrel', reason, 'delay']);
    const [, fdList] = await this.proxy.call_with_unix_fd_list('Inhibit', inVariant, 0, -1, null, cancellable);
    const [fd] = fdList!.steal_fds();
    return new GioUnix.InputStream({ fd });
  }
}
