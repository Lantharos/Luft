import { t } from '@luft/i18n';
import { activate, close, deactivate, disconnect, onChanged, onFailed, open, type Network, type Vpn, type Wifi, type Wired } from './api';
import { linkLabel, speedLabel } from './describe';

export class NetworkState {
	network = $state<Network | null>(null);
	problems = $state<Record<string, string>>({});

	start() {
		const stopChanged = onChanged((next) => (this.network = next));
		const stopFailed = onFailed((failure) => {
			const vpn = this.network?.vpns.find((candidate) => candidate.active === failure.path || candidate.name === failure.name);
			const wired = this.network?.wired.find((candidate) => candidate.device === failure.path);
			const key = wired?.device ?? vpn?.connection;
			if (key) this.problems[key] = t('settings-network-connect-failed');
		});
		void open().then((initial) => (this.network = initial));
		return () => {
			stopChanged();
			stopFailed();
			void close();
		};
	}

	wifiSummary(wifi: Wifi) {
		if (!wifi.hardwareEnabled) return t('settings-network-wifi-hardware-off');
		const connected = wifi.enabled && wifi.networks.find((candidate) => candidate.state === 'connected');
		return connected ? t('settings-network-wifi-connected', { network: connected.ssid }) : undefined;
	}

	wiredTitle(wired: Wired) {
		return this.network!.wired.length > 1 ? t('settings-network-ethernet-named', { name: wired.name }) : t('settings-network-ethernet');
	}

	wiredSummary(wired: Wired) {
		if (this.problems[wired.device]) return this.problems[wired.device];
		if (wired.state === 'connected' && wired.speed) return t('settings-network-wired-connected', { speed: speedLabel(wired.speed) });
		return wired.state === 'disconnected' ? undefined : linkLabel(wired.state);
	}

	vpnSummary(vpn: Vpn) {
		return this.problems[vpn.connection] ?? (vpn.state === 'disconnected' ? undefined : linkLabel(vpn.state));
	}

	toggleWired(wired: Wired, on: boolean) {
		void this.attempt(wired.device, () => (on ? activate({ device: wired.device }) : disconnect(wired.device)));
	}

	toggleVpn(vpn: Vpn, on: boolean) {
		void this.attempt(vpn.connection, () => (on ? activate({ connection: vpn.connection }) : deactivate(vpn.active!)));
	}

	private async attempt(key: string, action: () => Promise<void>) {
		delete this.problems[key];
		try {
			await action();
		} catch {
			this.problems[key] = t('settings-network-connect-failed');
		}
	}
}
