import type { Enterprise, Kind, MacChoice, Profile } from '@luft/network';

export const newEnterprise = (): Enterprise => ({
	method: 'peap',
	inner: 'mschapv2',
	identity: '',
	anonymousIdentity: '',
	caCertificate: null,
	systemCertificates: true,
	domain: '',
	clientCertificate: null,
	privateKey: null
});

export type Target = { kind: 'wifi'; path: string; ssid: string } | { kind: 'wired'; path: string; device: string } | { kind: 'vpn'; path: string };

const BUILTIN_MACS = ['', 'preserve', 'permanent'];

export function macChoice(kind: Kind, mac: string): MacChoice {
	if (BUILTIN_MACS.includes(mac)) return 'builtin';
	if (mac === 'random' || mac === 'stable') return mac;
	return kind === 'wifi' ? 'builtin' : 'custom';
}

export const configurable = (method: string) => method === 'auto' || method === 'dhcp' || method === 'manual';

export function prepare(profile: Profile) {
	for (const ip of [profile.ipv4, profile.ipv6]) {
		if (!configurable(ip.method)) Object.assign(ip, { addresses: [], gateway: '', dns: [], search: [], routes: [] });
	}
	if (profile.wireless && profile.wireless.security !== 'enterprise') profile.wireless.enterprise = null;
	return profile;
}
