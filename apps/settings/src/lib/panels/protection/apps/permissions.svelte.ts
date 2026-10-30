import { errorText } from '@luft/ui';
import { commands, events } from '#lib/bindings.js';
import type { AppAccess, SandboxDevice, SandboxSwitch, Switchable } from '#lib/bindings.js';

export class Permissions {
	apps = $state<AppAccess[]>([]);
	busy = $state(false);
	error = $state('');

	start() {
		void commands.appsPermissions().then((apps) => (this.apps = apps));
		return events.appsPermissions((apps) => (this.apps = apps));
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
		return this.run(() => commands.appsPermissionSet({ kind, app: app.id, allowed }));
	}

	revokeFullAccess = (app: AppAccess) => this.run(() => commands.appsFullAccessRevoke({ app: app.id, appImage: app.appImage }));

	askForFullAccess = (app: AppAccess) => this.run(() => commands.appsFullAccessAsk({ app: app.id }));

	forgetPasswords = (app: AppAccess) => this.run(() => commands.appsPasswordsForget({ app: app.id }));

	addFolder = (app: AppAccess) => this.run(() => commands.appsFolderAdd({ app: app.id }));

	removeFolder = (app: AppAccess, folder: string) => this.run(() => commands.appsFolderRemove({ app: app.id, folder }));

	setDevice = (app: AppAccess, device: SandboxDevice, on: boolean) => this.run(() => commands.appsDeviceSet({ app: app.id, device, on }));

	setSwitch = (app: AppAccess, sandboxSwitch: SandboxSwitch, on: boolean) => this.run(() => commands.appsSandboxSet({ app: app.id, switch: sandboxSwitch, on }));

	removeService = (app: AppAccess, service: string) => this.run(() => commands.appsServiceRemove({ app: app.id, service }));
}
