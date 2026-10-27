import GLib from 'gi://GLib';

import {call} from '../dbus.js';
import {waitUntil} from '../wait.js';

const STORE = 'org.freedesktop.impl.portal.PermissionStore';
const STORE_PATH = '/org/freedesktop/impl/portal/PermissionStore';

export const FULL_ACCESS = 'full-access';
export const BACKGROUND_CLIPBOARD = 'background-clipboard';

const store = (method: string, parameters: GLib.Variant) => call(STORE, STORE_PATH, STORE, method, parameters);
const permitted = (permission: string, appId: string) => global.context.is_app_permitted(permission, appId);

export async function answer(permission: string, appId: string, allowed: boolean) {
  await store('SetPermission', new GLib.Variant('(sbssas)', [permission, true, permission, appId, [allowed ? 'yes' : 'no']]));
  await waitUntil(() => permitted(permission, appId) === allowed, `${appId} ${allowed ? 'gets' : 'loses'} ${permission}`);
}

export async function forget(permission: string, appId: string, permittedByDefault = false) {
  await store('DeletePermission', new GLib.Variant('(sss)', [permission, permission, appId]));
  await waitUntil(() => permitted(permission, appId) === permittedByDefault, `${appId} is back to its default ${permission}`);
}

export async function withFullAccess(appId: string, body: () => Promise<void>) {
  await answer(FULL_ACCESS, appId, true);
  try {
    await body();
  } finally {
    await forget(FULL_ACCESS, appId);
  }
}
