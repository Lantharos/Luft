import { invoke } from '@lantharos/sabine';
import type { Security } from './index';

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

export const loadProfile = (path: string) => invoke<Profile>('network_profile', { path });
export const loadSecret = (path: string) => invoke<string | null>('network_profile_secret', { path }, { timeoutMs: WAIT_FOR_PERMISSION });
export const saveProfile = (path: string, profile: Profile, secret: string | null) =>
	invoke<void>('network_profile_save', { path, profile, secret }, { timeoutMs: WAIT_FOR_PERMISSION });
export const chooseCertificate = (purpose: Purpose) =>
	invoke<string | null>('network_choose_certificate', { purpose }, { timeoutMs: WAIT_FOR_PERMISSION });
