import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

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

export function descendants(actor) {
  return [actor, ...actor.get_children().flatMap(descendants)];
}

export function portalDialog() {
  return descendants(global.stage).find(actor => actor.has_style_class_name?.('kestrel-portal-dialog') && actor.mapped);
}

export function labelled(root, text) {
  return descendants(root).find(actor => actor.label === text || actor.accessible_name === text || actor.text === text);
}

export function checker(area) {
  return (condition, label) => {
    if (!condition) throw new Error(`Kestrel ${area} check failed: ${label}`);
    console.log(`Kestrel ${area} check: ${label}`);
  };
}

export function clicker(pointer, pause) {
  return async actor => {
    const [x, y] = actor.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(250);
  };
}
