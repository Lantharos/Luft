import { errorText } from '@luft/ui';
import { invoke, listen } from '#lib/bridge/index.js';
import type { App } from './api';

export type Switchable = 'location' | 'camera' | 'clipboard';
export type Device = 'usb' | 'serial';

export interface AppAccess extends App {
	appImage: boolean;
	location: boolean | null;
	camera: boolean | null;
	clipboard: boolean | null;
	passwords: { allowed: number; total: number } | null;
	fullAccess: boolean;
	folders: string[];
	devices: string[];
}

const list = () => invoke<AppAccess[]>('apps_permissions');
const onChanged = (callback: (apps: AppAccess[]) => void) => listen<AppAccess[]>('apps.permissions', callback);

export class Permissions {
	apps = $state<AppAccess[]>([]);
	busy = $state(false);
	error = $state('');

	start() {
		void list().then((apps) => (this.apps = apps));
		return onChanged((apps) => (this.apps = apps));
	}

	private async run(work: () => Promise<unknown>) {
		this.busy = true;
		this.error = '';
		try {
			await work();
		} catch (reason) {
			this.error = errorText(reason);
		}
		this.busy = false;
	}

	toggle(kind: Switchable, app: AppAccess, allowed: boolean) {
		app[kind] = allowed;
		return this.run(() => invoke('apps_permission_set', { kind, app: app.id, allowed }));
	}

	revokeFullAccess = (app: AppAccess) => this.run(() => invoke('apps_full_access_revoke', { app: app.id, appImage: app.appImage }));

	askForFullAccess = (app: AppAccess) => this.run(() => invoke('apps_full_access_ask', { app: app.id }));

	forgetPasswords = (app: AppAccess) => this.run(() => invoke('apps_passwords_forget', { app: app.id }));

	addFolder = (app: AppAccess) => this.run(() => invoke('apps_folder_add', { app: app.id }));

	removeFolder = (app: AppAccess, folder: string) => this.run(() => invoke('apps_folder_remove', { app: app.id, folder }));

	setDevice = (app: AppAccess, device: Device, on: boolean) => this.run(() => invoke('apps_device_set', { app: app.id, device, on }));
}
