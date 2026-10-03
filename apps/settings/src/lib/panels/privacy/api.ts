import { invoke, listen } from '#lib/bridge.js';

export type PermissionKind = 'location' | 'camera';

export interface AppPermission {
	id: string;
	name: string;
	allowed: boolean;
}

interface PermissionUpdate {
	kind: PermissionKind;
	apps: AppPermission[];
}

export const permissions = (kind: PermissionKind) => invoke<AppPermission[]>('privacy_permissions', { kind });
export const setPermission = (kind: PermissionKind, app: string, allowed: boolean) => invoke<void>('privacy_set_permission', { kind, app, allowed });
export const clearHistory = () => invoke<void>('privacy_clear_history');
export const onPermissionsChanged = (callback: (update: PermissionUpdate) => void) => listen<PermissionUpdate>('privacy.permissions', callback);
