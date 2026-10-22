import GLib from 'gi://GLib';

import {call} from '../dbus.js';
import {waitUntil} from '../wait.js';

const STORE = 'org.freedesktop.impl.portal.PermissionStore';
const STORE_PATH = '/org/freedesktop/impl/portal/PermissionStore';

export const FULL_ACCESS = 'full-access';
export const BACKGROUND_CLIPBOARD = 'background-clipboard';

const store = (method, parameters) => call(STORE, STORE_PATH, STORE, method, parameters);
const permitted = (permission, appId) => global.context.is_app_permitted(permission, appId);

export async function answer(permission, appId, allowed) {
  await store('SetPermission', new GLib.Variant('(sbssas)', [permission, true, permission, appId, [allowed ? 'yes' : 'no']]));
  await waitUntil(() => permitted(permission, appId) === allowed, `${appId} ${allowed ? 'gets' : 'loses'} ${permission}`);
}

export async function forget(permission, appId, permittedByDefault = false) {
  await store('DeletePermission', new GLib.Variant('(sss)', [permission, permission, appId]));
  await waitUntil(() => permitted(permission, appId) === permittedByDefault, `${appId} is back to its default ${permission}`);
}

export async function withFullAccess(appId, body) {
  await answer(FULL_ACCESS, appId, true);
  try {
    await body();
  } finally {
    await forget(FULL_ACCESS, appId);
  }
}
