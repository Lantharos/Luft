import Gio from 'gi://Gio';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';

const BUS_NAME = 'org.gnome.SessionManager';

export const PresenceStatus = {
  AVAILABLE: 0,
  INVISIBLE: 1,
  BUSY: 2,
  IDLE: 3,
} as const;

export const InhibitFlags = {
  LOGOUT: 1 << 0,
  SWITCH: 1 << 1,
  SUSPEND: 1 << 2,
  IDLE: 1 << 3,
  AUTOMOUNT: 1 << 4,
} as const;

export const ActionAvailability = {
  UNAVAILABLE: 0,
  BLOCKED: 1,
  CHALLENGE: 2,
  AVAILABLE: 3,
} as const;

type ProxyReady<T> = (proxy: T, error: Error | null) => void;

interface PresenceRemote {
  readonly status: number;
  connectSignal(name: 'StatusChanged', callback: (proxy: Gio.DBusProxy, sender: string, args: [number]) => void): number;
}

interface InhibitorRemote {
  GetAppIdSync(): [string];
  GetFlagsSync(): [number];
  GetReasonSync(): [string];
}

interface SessionManagerRemote {
  readonly SessionIsActive: boolean;
  CanShutdownAsync(): Promise<[number]>;
  CanRebootAsync(): Promise<[number]>;
  CanSuspendAsync(): Promise<[number]>;
  LogoutAsync(mode: number): Promise<[]>;
  ShutdownAsync(mode: number): Promise<[]>;
  RebootAsync(): Promise<[]>;
  SuspendAsync(): Promise<[]>;
  IsInhibitedAsync(flags: number): Promise<[boolean]>;
  connectSignal(name: 'InhibitorAdded' | 'InhibitorRemoved', callback: (proxy: Gio.DBusProxy, sender: string, args: [string]) => void): number;
}

export type PresenceProxy = Gio.DBusProxy & PresenceRemote;
export type InhibitorProxy = Gio.DBusProxy & InhibitorRemote;
export type SessionManagerProxy = Gio.DBusProxy & SessionManagerRemote;

type ProxyWrapper<T> = (bus: Gio.DBusConnection, name: string, path: string, ready?: ProxyReady<T>, cancellable?: Gio.Cancellable | null) => T;

function proxyWrapper<T>(iface: string): ProxyWrapper<T> {
  return Gio.DBusProxy.makeProxyWrapper(loadInterfaceXML(iface)) as unknown as ProxyWrapper<T>;
}

const PresenceWrapper = proxyWrapper<PresenceProxy>('org.gnome.SessionManager.Presence');
const InhibitorWrapper = proxyWrapper<InhibitorProxy>('org.gnome.SessionManager.Inhibitor');
const SessionManagerWrapper = proxyWrapper<SessionManagerProxy>('org.gnome.SessionManager');

export function Presence(ready?: ProxyReady<PresenceProxy>, cancellable?: Gio.Cancellable | null): PresenceProxy {
  return PresenceWrapper(Gio.DBus.session, BUS_NAME, '/org/gnome/SessionManager/Presence', ready, cancellable);
}

export function Inhibitor(objectPath: string, ready?: ProxyReady<InhibitorProxy>, cancellable?: Gio.Cancellable | null): InhibitorProxy {
  return InhibitorWrapper(Gio.DBus.session, BUS_NAME, objectPath, ready, cancellable);
}

export function SessionManager(ready?: ProxyReady<SessionManagerProxy>, cancellable?: Gio.Cancellable | null): SessionManagerProxy {
  return SessionManagerWrapper(Gio.DBus.session, BUS_NAME, '/org/gnome/SessionManager', ready, cancellable);
}
