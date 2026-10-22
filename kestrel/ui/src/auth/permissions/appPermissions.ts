import { appsAnswering, answerOf, BACKGROUND_CLIPBOARD, FULL_ACCESS, lookupSync, watchStore, type Apps, type Permission } from '../../shared/dbus/permissionStore.js';

const PASSWORD_MANAGERS = ['com.onepassword.OnePassword', 'org.keepassxc.KeePassXC', 'com.bitwarden.desktop'];

const PERMITTED = new Map<Permission, (apps: Apps) => string[]>([
  [FULL_ACCESS, apps => appsAnswering(apps, 'yes')],
  [BACKGROUND_CLIPBOARD, apps => [...new Set([...PASSWORD_MANAGERS, ...appsAnswering(apps, 'yes')])].filter(app => answerOf(apps, app) !== 'no')],
]);

function apply(permission: Permission, apps: Apps): void {
  global.context.set_permitted_apps(permission.table, PERMITTED.get(permission)!(apps));
}

function stored(permission: Permission): Apps {
  try {
    return lookupSync(permission);
  } catch (error) {
    console.error(`Kestrel couldn't read which apps have ${permission.table}`, error);
    return {};
  }
}

export function followAppPermissions(): void {
  watchStore([...PERMITTED.keys()], apply);
  for (const permission of PERMITTED.keys()) apply(permission, stored(permission));
}
