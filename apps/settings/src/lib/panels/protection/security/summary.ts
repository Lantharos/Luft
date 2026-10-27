import { t } from '@luft/i18n';
import type { Trust } from '#lib/bindings.js';

export interface Summary {
	headline: string;
	sentence: string;
	safe: boolean;
}

export function summarize({ disk, secureBoot }: Trust, firmwareUpdates: number): Summary | null {
	if (!disk.device) return null;
	if (!disk.encrypted) return { headline: t('settings-security-could-be-safer'), sentence: t('settings-security-not-encrypted-description'), safe: false };
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
