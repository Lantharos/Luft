import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {shownStyled} from './actors.js';

export const BACKEND = 'org.freedesktop.impl.portal.desktop.kestrel';
export const PORTAL_PATH = '/org/freedesktop/portal/desktop';

let requests = 0;

export function call(iface, method, parameters, replyType, path = PORTAL_PATH) {
  return Gio.DBus.session.call(BACKEND, path, `org.freedesktop.impl.portal.${iface}`, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

export function requestHandle() {
  return `/org/freedesktop/portal/desktop/request/kestrel/check${++requests}`;
}

export function sessionHandle() {
  return `/org/freedesktop/portal/desktop/session/kestrel/check${++requests}`;
}

export function portalDialog() {
  return shownStyled('kestrel-portal-dialog');
}
