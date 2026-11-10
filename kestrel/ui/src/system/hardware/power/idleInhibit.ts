import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BUS_NAME = 'org.gnome.SessionManager';
const OBJECT_PATH = '/org/gnome/SessionManager';
const INHIBIT_IDLE = 8;

function callSessionManager(method: string, parameters: GLib.Variant, replyType: string | null): Promise<GLib.Variant> {
  return Gio.DBus.session.call(BUS_NAME, OBJECT_PATH, BUS_NAME, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

export async function inhibitIdle(reason: string): Promise<number> {
  const reply = await callSessionManager('Inhibit', new GLib.Variant('(susu)', ['org.gnome.Shell', 0, reason, INHIBIT_IDLE]), '(u)');
  const [cookie] = reply.deepUnpack<[number]>();
  return cookie;
}

export function uninhibitIdle(cookie: number): void {
  callSessionManager('Uninhibit', new GLib.Variant('(u)', [cookie]), null)
    .catch((error: Error) => logError(error, 'Could not release the keep awake request'));
}
