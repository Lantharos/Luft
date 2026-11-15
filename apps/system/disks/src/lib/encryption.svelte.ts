import { t } from '@luft/i18n';
import type { DriveEncryption, Outcome } from './bindings';
import { percent } from './format';

export const SHORTEST_PASSPHRASE = 8;


export function changing(encryption: DriveEncryption | null) {
	return Boolean(encryption && encryption.state !== 'on');
}

export function rowStatus(encryption: DriveEncryption) {
	const change = encryption.change ?? 'encrypt';
	if (encryption.state === 'encrypting' || encryption.state === 'decrypting') return t('disks-encryption-row-running', { change, progress: percent(encryption.progress) });
	if (encryption.state === 'paused') return t('disks-encryption-row-paused', { change });
	return t('disks-encryption-row-waiting', { change });
}

export function progressSentence(encryption: DriveEncryption) {
	const progress = percent(encryption.progress);
	if (encryption.state === 'paused') return t('disks-encryption-paused', { progress });
	if (encryption.state === 'waiting') return t('disks-encryption-waiting', { progress });
	const seconds = encryption.remaining;
	if (!seconds) return t('disks-encryption-progress', { progress });
	if (seconds < 60) return t('disks-encryption-progress-seconds', { progress });
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return t('disks-encryption-progress-minutes', { progress, count: minutes });
	return t('disks-encryption-progress-hours', { progress, count: Math.round(minutes / 60) });
}

export class KeyRequest {
	asking = $state(false);
	key = $state('');
	error = $state('');

	async run(action: (unlock: string) => Promise<Outcome<unknown>>) {
		const outcome = await action(this.asking ? this.key : '');
		if (!('wrongKey' in outcome)) return true;
		if (this.asking) this.error = t('disks-encryption-wrong-key');
		this.asking = true;
		return false;
	}
}
