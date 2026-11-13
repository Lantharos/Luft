import { errorText } from '@luft/ui';
import { commands, events } from '#lib/bindings.js';
import type { AppAccess, GivenDrive, PluggedDrive, SandboxDevice, SandboxSwitch, Switchable } from '#lib/bindings.js';

export class Permissions {
	apps = $state<AppAccess[]>([]);
	busy = $state(false);
	error = $state('');

	start() {
		void commands.appsPermissions().then(
			(apps) => (this.apps = apps),
			(reason) => (this.error = errorText(reason))
		);
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

	giveDrive = (app: AppAccess, drive: PluggedDrive, readOnly: boolean) =>
		this.run(() => commands.appsDriveGive({ app: app.id, uuid: drive.uuid, drive: drive.drive, readOnly }));

	takeDrive = (app: AppAccess, drive: GivenDrive) => this.run(() => commands.appsDriveTake({ app: app.id, uuid: drive.uuid, drive: drive.drive }));

	setDevice = (app: AppAccess, device: SandboxDevice, on: boolean) => this.run(() => commands.appsDeviceSet({ app: app.id, device, on }));

	setSwitch = (app: AppAccess, sandboxSwitch: SandboxSwitch, on: boolean) => this.run(() => commands.appsSandboxSet({ app: app.id, switch: sandboxSwitch, on }));

	removeService = (app: AppAccess, service: string) => this.run(() => commands.appsServiceRemove({ app: app.id, service }));
}
