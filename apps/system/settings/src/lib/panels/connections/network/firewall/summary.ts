import { t } from '@luft/i18n';
import type { Firewall } from '@luft/network';

export function firewallSummary(firewall: Firewall) {
	const current = firewall.networks.find((network) => network.connected);
	if (!current) return undefined;
	return t(current.networkType === 'home' ? 'settings-network-firewall-summary-home' : 'settings-network-firewall-summary-public', { network: current.name });
}
