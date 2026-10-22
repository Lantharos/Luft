import { errorText } from '@luft/ui';
import { invoke, listen } from '#lib/bridge/index.js';
import type { App } from './api';

export type Switchable = 'location' | 'camera' | 'clipboard';

export interface Grant extends App {
	allowed: boolean;
}

export interface Remembered extends App {
	allowed: number;
	total: number;
}

type Update =
	| { kind: Switchable; apps: Grant[] }
	| { kind: 'fullAccess'; apps: App[] }
	| { kind: 'passwords'; apps: Remembered[] };

interface Granted {
	location: Grant[];
	camera: Grant[];
	clipboard: Grant[];
	fullAccess: App[];
	passwords: Remembered[];
}

const permissions = () => invoke<Update[]>('apps_permissions');
const setPermission = (kind: Switchable, app: string, allowed: boolean) => invoke<void>('apps_permission_set', { kind, app, allowed });
const revokeFullAccess = (app: string) => invoke<void>('apps_full_access_revoke', { app });
const forgetPasswords = (app: string) => invoke<void>('apps_passwords_forget', { app });
const onPermissionsChanged = (callback: (update: Update) => void) => listen<Update>('apps.permissions', callback);

export class Permissions {
	apps = $state<Granted>({ location: [], camera: [], clipboard: [], fullAccess: [], passwords: [] });
	busy = $state(false);
	error = $state('');

	any = $derived(Object.values(this.apps).some((apps) => apps.length));

	start() {
		void permissions().then((updates) => updates.forEach(this.apply));
		return onPermissionsChanged(this.apply);
	}

	private apply = (update: Update) => {
		Object.assign(this.apps, { [update.kind]: update.apps });
	};

	async toggle(kind: Switchable, app: Grant, allowed: boolean) {
		app.allowed = allowed;
		try {
			await setPermission(kind, app.id, allowed);
		} catch {
			app.allowed = !allowed;
		}
	}

	revokeFullAccess = (app: App) => this.revoke(app, revokeFullAccess);

	forgetPasswords = (app: App) => this.revoke(app, forgetPasswords);

	private async revoke(app: App, revoke: (id: string) => Promise<void>) {
		this.busy = true;
		this.error = '';
		try {
			await revoke(app.id);
		} catch (reason) {
			this.error = errorText(reason);
		}
		this.busy = false;
	}
}
