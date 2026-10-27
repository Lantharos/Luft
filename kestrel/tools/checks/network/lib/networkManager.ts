import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

import {call} from '../../lib/dbus.js';

const CONTROL = ['org.freedesktop.NetworkManager', '/com/lantharos/KestrelChecks/NetworkManager', 'com.lantharos.KestrelChecks.NetworkManager'] as const;

export function control<S extends string>(method: string, parameters: GLib.Variant | null = null, replyType: S | null = null) {
  return call(...CONTROL, method, parameters, replyType, {connection: Gio.DBus.system});
}
