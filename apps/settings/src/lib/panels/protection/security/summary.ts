import { t } from '@luft/i18n';
import type { Trust } from './api';
import { progressLine } from './encryption/describe';

export interface Summary {
	headline: string;
	sentence: string;
	safe: boolean;
}

export function summarize({ disk, secureBoot }: Trust, firmwareUpdates: number): Summary | null {
	switch (disk.state) {
		case 'encrypting':
			return { headline: t('settings-security-encrypting'), sentence: t('settings-security-encrypting-progress', { progress: progressLine(disk) }), safe: true };
		case 'decrypting':
			return { headline: t('settings-security-decrypting'), sentence: t('settings-security-encrypting-progress', { progress: progressLine(disk) }), safe: false };
		case 'starting':
			return { headline: t('settings-security-restart-to-encrypt'), sentence: t('settings-security-restart-to-encrypt-description'), safe: false };
		case 'failed':
			return { headline: t('settings-security-encryption-failed'), sentence: t('settings-security-encryption-failed-description'), safe: false };
		case 'off':
			return disk.device ? { headline: t('settings-security-could-be-safer'), sentence: t('settings-security-could-be-safer-description'), safe: false } : null;
	}
	if (disk.secureBootChanged)
		return { headline: t('settings-encryption-starts-differently'), sentence: t('settings-security-starts-differently-description'), safe: false };
	if (disk.tpmRefused) return { headline: t('settings-security-needed-recovery-key'), sentence: t('settings-security-needed-recovery-key-description'), safe: false };
	if (firmwareUpdates) return { headline: t('settings-security-protected'), sentence: t('settings-security-firmware-ready-description'), safe: true };
	return {
		headline: t('settings-security-protected'),
		sentence: secureBoot === 'on' ? t('settings-security-encrypted-secure-boot') : t('settings-security-encrypted'),
		safe: true
	};
}
