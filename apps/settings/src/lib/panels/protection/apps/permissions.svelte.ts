import { invoke, listen } from '#lib/bridge/index.js';

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

const KINDS: PermissionKind[] = ['location', 'camera'];

const permissions = (kind: PermissionKind) => invoke<AppPermission[]>('privacy_permissions', { kind });
const setPermission = (kind: PermissionKind, app: string, allowed: boolean) => invoke<void>('privacy_set_permission', { kind, app, allowed });
const onPermissionsChanged = (callback: (update: PermissionUpdate) => void) => listen<PermissionUpdate>('privacy.permissions', callback);

export class Permissions {
	apps = $state<Record<PermissionKind, AppPermission[]>>({ location: [], camera: [] });

	start() {
		for (const kind of KINDS) void permissions(kind).then((list) => (this.apps[kind] = list));
		return onPermissionsChanged((update) => (this.apps[update.kind] = update.apps));
	}

	async toggle(kind: PermissionKind, app: AppPermission, allowed: boolean) {
		app.allowed = allowed;
		try {
			await setPermission(kind, app.id, allowed);
		} catch {
			app.allowed = !allowed;
		}
	}
}
