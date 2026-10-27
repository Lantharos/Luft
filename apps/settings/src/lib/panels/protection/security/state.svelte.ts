import { commands, events } from '#lib/bindings.js';
import type { HostSecurity, Trust, UsbProtection } from '#lib/bindings.js';
import { firmware } from '#lib/panels/system/updates/api.js';
import { hostSecurity } from './api';

export class SecurityState {
	trust = $state<Trust | null>(null);
	host = $state<HostSecurity | null>(null);
	usb = $state<UsbProtection | null>(null);
	firmwareUpdates = $state(0);
	fingerprintReader = $state(false);
	loaded = $state(false);

	private stops: (() => void)[] = [];

	async start() {
		this.stops = [events.securityTrust((next) => (this.trust = next)), events.securityUsb((next) => (this.usb = next))];
		const [trustState, usbState, reader] = await Promise.all([
			commands.securityTrust().catch(() => null),
			commands.securityUsb().catch(() => null),
			commands.fingerprintReader().catch(() => false)
		]);
		this.trust = trustState;
		this.usb = usbState;
		this.fingerprintReader = reader;
		this.loaded = true;
		void firmware()
			.then((devices) => (this.firmwareUpdates = devices.length))
			.catch(() => {});
		this.host = await hostSecurity().catch(() => null);
	}

	stop() {
		for (const stop of this.stops) stop();
	}
}
