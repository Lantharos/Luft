import { t } from '@luft/i18n';
import type { Protocol } from '@luft/network';

export const protocolLabel = (protocol: Protocol) => t(protocol === 'tcp' ? 'settings-network-firewall-tcp' : 'settings-network-firewall-udp');

export function portProblem(text: string) {
	if (!text.trim()) return '';
	const port = Number(text);
	return Number.isInteger(port) && port >= 1 && port <= 65535 ? '' : t('settings-network-firewall-error-port');
}
