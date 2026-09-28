import Wifi from '@lucide/svelte/icons/wifi';
import WifiHigh from '@lucide/svelte/icons/wifi-high';
import WifiLow from '@lucide/svelte/icons/wifi-low';
import WifiZero from '@lucide/svelte/icons/wifi-zero';
import type { Details, Link, Security } from './api';

export type DetailRow = [label: string, value: string];

const SECURITY_LABELS: Record<Security, string> = {
	open: 'None',
	owe: 'Enhanced open',
	wep: 'WEP',
	psk: 'WPA2 Personal',
	sae: 'WPA3 Personal',
	enterprise: 'Enterprise'
};

const LINK_LABELS: Record<Link, string> = {
	connected: 'Connected',
	connecting: 'Connecting…',
	disconnected: 'Not connected',
	unplugged: 'Cable unplugged'
};

export const securityLabel = (security: Security) => SECURITY_LABELS[security];
export const linkLabel = (link: Link) => LINK_LABELS[link];
export const isSecured = (security: Security) => security !== 'open' && security !== 'owe';

export function signalIcon(strength: number) {
	if (strength >= 70) return Wifi;
	if (strength >= 45) return WifiHigh;
	if (strength >= 20) return WifiLow;
	return WifiZero;
}

export function signalLabel(strength: number) {
	if (strength >= 70) return 'Excellent';
	if (strength >= 45) return 'Good';
	if (strength >= 20) return 'Fair';
	return 'Weak';
}

export const speedLabel = (megabits: number) => (megabits >= 1000 ? `${megabits / 1000} Gb/s` : `${megabits} Mb/s`);

export function detailRows(details: Details): DetailRow[] {
	const rows: DetailRow[] = [];
	if (details.ipv4.length) rows.push(['IP address', details.ipv4.join('\n')]);
	if (details.ipv6.length) rows.push(['IPv6 address', details.ipv6.join('\n')]);
	if (details.gateway) rows.push(['Router', details.gateway]);
	if (details.dns.length) rows.push(['DNS', details.dns.join('\n')]);
	if (details.mac) rows.push(['Hardware address', details.mac]);
	return rows;
}
