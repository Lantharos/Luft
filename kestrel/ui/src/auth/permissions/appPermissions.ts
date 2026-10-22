import { appsAnswering, answerOf, BACKGROUND_CLIPBOARD, FULL_ACCESS, lookupSync, setAnswer, watchStore, type Apps, type Permission } from '../../shared/dbus/permissionStore.js';

const PASSWORD_MANAGERS = ['com.onepassword.OnePassword', 'org.keepassxc.KeePassXC', 'com.bitwarden.desktop'];
const ANSWERED_BY_DEFAULT = new Map<Permission, string[]>([[BACKGROUND_CLIPBOARD, PASSWORD_MANAGERS]]);
const PERMISSIONS = [FULL_ACCESS, BACKGROUND_CLIPBOARD];

function answerDefaults(permission: Permission, apps: Apps): void {
  for (const app of ANSWERED_BY_DEFAULT.get(permission) ?? [])
    if (answerOf(apps, app) === null) void setAnswer(permission, app, 'yes').catch(error => console.error(`Kestrel couldn't give ${app} ${permission.table}`, error));
}

function apply(permission: Permission, apps: Apps): void {
  answerDefaults(permission, apps);
  global.context.set_permitted_apps(permission.table, appsAnswering(apps, 'yes'));
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
  watchStore(PERMISSIONS, apply);
  for (const permission of PERMISSIONS) apply(permission, stored(permission));
}
