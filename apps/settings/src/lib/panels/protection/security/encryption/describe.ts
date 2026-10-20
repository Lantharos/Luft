import { i18n, t } from '@luft/i18n';
import type { Disk } from '../api';

export function unlockSummary({ unlock }: Disk) {
	if (unlock.includes('tpm') && unlock.includes('pin')) return t('settings-encryption-unlocks-chip-pin');
	if (unlock.includes('tpm')) return t('settings-encryption-unlocks-chip');
	if (unlock.includes('passphrase')) return t('settings-encryption-unlocks-passphrase');
	if (unlock.includes('security-key')) return t('settings-encryption-unlocks-security-key');
	return t('settings-encryption-unlocks-recovery-key');
}

export const percent = (fraction: number) => new Intl.NumberFormat(i18n.formats, { style: 'percent' }).format(Math.floor(fraction * 100) / 100);

export function progressLine({ progress, remaining }: Disk) {
	const done = percent(progress);
	if (!remaining) return t('settings-encryption-progress', { percent: done });
	if (remaining < 60) return t('settings-encryption-progress-seconds', { percent: done });
	const minutes = Math.round(remaining / 60);
	if (minutes < 60) return t('settings-encryption-progress-minutes', { percent: done, minutes });
	return t('settings-encryption-progress-hours', { percent: done, hours: Math.round(minutes / 60) });
}
