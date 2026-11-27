import Wifi from '@luft/symbols/icons/wifi';
import WifiLow from '@luft/symbols/icons/wifi-low';
import WifiZero from '@luft/symbols/icons/wifi-zero';
import { i18n, t } from '@luft/i18n';
import { signalLevel, type Details, type Link, type Security, type SignalLevel } from '@luft/network';

export type DetailRow = [label: string, value: string];

const SECURITY_LABELS: Record<Security, string> = {
	open: 'settings-network-security-open',
	owe: 'settings-network-security-owe',
	wep: 'settings-network-security-wep',
	psk: 'settings-network-security-psk',
	sae: 'settings-network-security-sae',
	enterprise: 'settings-network-security-enterprise'
};

const LINK_LABELS: Record<Link, string> = {
	connected: 'settings-network-link-connected',
	connecting: 'settings-network-link-connecting',
	disconnected: 'settings-network-link-disconnected',
	unplugged: 'settings-network-link-unplugged'
};

export const securityLabel = (security: Security) => t(SECURITY_LABELS[security]);
export const linkLabel = (link: Link) => t(LINK_LABELS[link]);
export const isSecured = (security: Security) => security !== 'open' && security !== 'owe';

const SIGNAL_ICONS: Record<SignalLevel, typeof Wifi> = { excellent: Wifi, good: Wifi, ok: WifiLow, weak: WifiZero, none: WifiZero };

const SIGNAL_LABELS: Record<SignalLevel, string> = {
	excellent: 'settings-network-signal-excellent',
	good: 'settings-network-signal-good',
	ok: 'settings-network-signal-fair',
	weak: 'settings-network-signal-weak',
	none: 'settings-network-signal-weak'
};

export const signalIcon = (strength: number) => SIGNAL_ICONS[signalLevel(strength)];
export const signalLabel = (strength: number) => t(SIGNAL_LABELS[signalLevel(strength)]);

export function speedLabel(megabits: number) {
	const gigabits = megabits >= 1000;
	const unit = gigabits ? 'gigabit-per-second' : 'megabit-per-second';
	return new Intl.NumberFormat(i18n.formats, { style: 'unit', unit }).format(gigabits ? megabits / 1000 : megabits);
}

function channelOf(frequency: number) {
	if (frequency >= 5925) return { band: 6, channel: (frequency - 5950) / 5 };
	if (frequency >= 4900) return { band: 5, channel: (frequency - 5000) / 5 };
	return { band: 2.4, channel: frequency === 2484 ? 14 : (frequency - 2407) / 5 };
}

export const bandLabel = (frequency: number) => t('settings-network-band', channelOf(frequency));

export function detailRows(details: Details): DetailRow[] {
	const rows: DetailRow[] = [];
	if (details.ipv4.length) rows.push([t('settings-network-detail-ipv4'), details.ipv4.join('\n')]);
	if (details.ipv6.length) rows.push([t('settings-network-detail-ipv6'), details.ipv6.join('\n')]);
	if (details.gateway) rows.push([t('settings-network-detail-router'), details.gateway]);
	if (details.dns.length) rows.push([t('settings-network-detail-dns'), details.dns.join('\n')]);
	if (details.mac) rows.push([t('settings-network-detail-mac'), details.mac]);
	return rows;
}
