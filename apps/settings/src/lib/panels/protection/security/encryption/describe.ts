import { i18n, t } from '@luft/i18n';
import type { Disk } from '#lib/bindings.js';

export function unlockSummary({ unlock }: Disk) {
	if (unlock.includes('tpm') && unlock.includes('pin')) return t('settings-encryption-unlocks-chip-pin');
	if (unlock.includes('tpm')) return t('settings-encryption-unlocks-chip');
	if (unlock.includes('passphrase')) return t('settings-encryption-unlocks-passphrase');
	if (unlock.includes('security-key')) return t('settings-encryption-unlocks-security-key');
	return t('settings-encryption-unlocks-recovery-key');
}

export const percent = (fraction: number) => new Intl.NumberFormat(i18n.formats, { style: 'percent' }).format(Math.floor(fraction * 100) / 100);
