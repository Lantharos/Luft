import { invoke } from '$lib/bridge';
import type { Security } from '../api';

const WAIT_FOR_PERMISSION = 300_000;

export type Kind = 'wired' | 'wifi' | 'vpn' | 'other';
export type Metered = 'automatic' | 'yes' | 'no';
export type Family = 'ipv4' | 'ipv6';
export type EapMethod = 'peap' | 'ttls' | 'tls';
export type Purpose = 'authority' | 'client' | 'key';
export type MacChoice = 'builtin' | 'random' | 'stable' | 'custom';

export interface Route {
	destination: string;
	gateway: string;
	metric: number | null;
}

export interface Ip {
	method: string;
	addresses: string[];
	gateway: string;
	dns: string[];
	search: string[];
	automaticDns: boolean;
	automaticRoutes: boolean;
	routes: Route[];
}

export interface Enterprise {
	method: EapMethod;
	inner: string;
	identity: string;
	anonymousIdentity: string;
	caCertificate: string | null;
	systemCertificates: boolean;
	domain: string;
	clientCertificate: string | null;
	privateKey: string | null;
}

export interface Wireless {
	security: Security;
	enterprise: Enterprise | null;
}

export interface Profile {
	kind: Kind;
	name: string;
	autoconnect: boolean;
	allUsers: boolean;
	metered: Metered;
	ipv4: Ip;
	ipv6: Ip;
	mtu: number;
	mac: string;
	wireless: Wireless | null;
}

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

export const loadProfile = (path: string) => invoke<Profile>('network_profile', { path });
export const loadSecret = (path: string) => invoke<string | null>('network_profile_secret', { path }, { timeoutMs: WAIT_FOR_PERMISSION });
export const saveProfile = (path: string, profile: Profile, secret: string | null) =>
	invoke<void>('network_profile_save', { path, profile, secret }, { timeoutMs: WAIT_FOR_PERMISSION });
export const chooseCertificate = (purpose: Purpose) =>
	invoke<string | null>('network_choose_certificate', { purpose }, { timeoutMs: WAIT_FOR_PERMISSION });

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
