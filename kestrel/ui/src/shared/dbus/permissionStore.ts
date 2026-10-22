import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const STORE = 'org.freedesktop.impl.portal.PermissionStore';
const STORE_PATH = '/org/freedesktop/impl/portal/PermissionStore';
const NOT_FOUND = 'org.freedesktop.portal.Error.NotFound';
const LOOKUP_REPLY = new GLib.VariantType('(a{sas}v)');

export type Apps = Record<string, string[]>;
export type Answer = 'yes' | 'no';

export interface Permission {
  readonly table: string;
  readonly id: string;
}

export const FULL_ACCESS: Permission = { table: 'full-access', id: 'full-access' };
export const BACKGROUND_CLIPBOARD: Permission = { table: 'background-clipboard', id: 'background-clipboard' };

export const answerOf = (apps: Apps, app: string): Answer | null => {
  const answer = apps[app]?.[0];
  return answer === 'yes' || answer === 'no' ? answer : null;
};

export const appsAnswering = (apps: Apps, answer: Answer): string[] => Object.keys(apps).filter(app => answerOf(apps, app) === answer);

const lookupParameters = ({ table, id }: Permission) => new GLib.Variant('(ss)', [table, id]);
const appsOf = (reply: GLib.Variant) => reply.get_child_value(0).deepUnpack<Apps>();
const missing = (error: unknown) => error instanceof GLib.Error && Gio.DBusError.get_remote_error(error) === NOT_FOUND;

export function lookupSync(permission: Permission): Apps {
  try {
    return appsOf(Gio.DBus.session.call_sync(STORE, STORE_PATH, STORE, 'Lookup', lookupParameters(permission), LOOKUP_REPLY,
      Gio.DBusCallFlags.NONE, -1, null));
  } catch (error) {
    if (missing(error)) return {};
    throw error;
  }
}

export async function lookup(connection: Gio.DBusConnection, permission: Permission): Promise<Apps> {
  try {
    return appsOf(await connection.call(STORE, STORE_PATH, STORE, 'Lookup', lookupParameters(permission), LOOKUP_REPLY,
      Gio.DBusCallFlags.NONE, -1, null));
  } catch (error) {
    if (missing(error)) return {};
    throw error;
  }
}

export function watchStore(permissions: Permission[], changed: (permission: Permission, apps: Apps) => void): void {
  Gio.DBus.session.signal_subscribe(STORE, STORE, 'Changed', STORE_PATH, null, Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => {
    const [table, id, deleted, , apps] = parameters.deepUnpack<[string, string, boolean, GLib.Variant, Apps]>();
    const permission = permissions.find(candidate => candidate.table === table && candidate.id === id);
    if (permission) changed(permission, deleted ? {} : apps);
  });
}
