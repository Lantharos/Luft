import { t } from '@luft/i18n';
import type { Protocol } from '@luft/network';

export const HIGHEST_GUARDED = 1024;

export const protocolLabel = (protocol: Protocol) => t(protocol === 'tcp' ? 'settings-network-firewall-tcp' : 'settings-network-firewall-udp');

export function portProblem(text: string) {
	if (!text.trim()) return '';
	const port = Number(text);
	if (!Number.isInteger(port) || port < 1 || port > 65535) return t('settings-network-firewall-error-port');
	return port > HIGHEST_GUARDED ? t('settings-network-firewall-error-open-already') : '';
}
