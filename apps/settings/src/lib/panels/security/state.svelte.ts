import { firmware } from '#lib/panels/updates/api.js';
import {
	fingerprintReader,
	hostSecurity,
	onTrust,
	onUsbProtection,
	trust,
	usbProtection,
	type HostSecurity,
	type Trust,
	type UsbProtection
} from './api';

export class SecurityState {
	trust = $state<Trust | null>(null);
	host = $state<HostSecurity | null>(null);
	usb = $state<UsbProtection | null>(null);
	firmwareUpdates = $state(0);
	fingerprintReader = $state(false);
	loaded = $state(false);

	private stops: (() => void)[] = [];

	async start() {
		this.stops = [onTrust((next) => (this.trust = next)), onUsbProtection((next) => (this.usb = next))];
		const [trustState, usbState, reader] = await Promise.all([
			trust().catch(() => null),
			usbProtection().catch(() => null),
			fingerprintReader().catch(() => false)
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
