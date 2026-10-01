import { hostSecurity, onTrust, onUsbProtection, trust, usbProtection, type HostSecurity, type Trust, type UsbProtection } from './api';

export class SecurityState {
	trust = $state<Trust | null>(null);
	host = $state<HostSecurity | null>(null);
	usb = $state<UsbProtection | null>(null);
	loaded = $state(false);

	private stops: (() => void)[] = [];

	async start() {
		this.stops = [onTrust((next) => (this.trust = next)), onUsbProtection((next) => (this.usb = next))];
		const [trustState, usbState] = await Promise.all([trust().catch(() => null), usbProtection().catch(() => null)]);
		this.trust = trustState;
		this.usb = usbState;
		this.loaded = true;
		this.host = await hostSecurity().catch(() => null);
	}

	async refresh() {
		this.trust = await trust().catch(() => this.trust);
	}

	stop() {
		for (const stop of this.stops) stop();
	}
}
