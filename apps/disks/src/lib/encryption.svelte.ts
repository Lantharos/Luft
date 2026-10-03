import type { DriveEncryption, Outcome } from './api';
import { percent } from './format';

export const SHORTEST_PASSPHRASE = 8;

function remaining(seconds: number) {
	if (!seconds) return '';
	if (seconds < 60) return 'less than a minute left';
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
	const hours = Math.round(minutes / 60);
	return `about ${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
}

export function changing(encryption: DriveEncryption | null) {
	return Boolean(encryption && encryption.state !== 'on');
}

export function rowStatus(encryption: DriveEncryption) {
	const verb = encryption.change === 'decrypt' ? 'Decrypting' : 'Encrypting';
	if (encryption.state === 'encrypting' || encryption.state === 'decrypting') return `${verb}… ${percent(encryption.progress)}`;
	if (encryption.state === 'paused') return `${verb} paused`;
	return `${verb} waits`;
}

export function progressSentence(encryption: DriveEncryption) {
	const done = `${percent(encryption.progress)} done`;
	if (encryption.state === 'paused') return `Paused at ${done.replace(' done', '')}. It continues when you resume it.`;
	if (encryption.state === 'waiting') return `${done}. It continues once the drive is connected and unlocked.`;
	return [done, remaining(encryption.remaining)].filter(Boolean).join(', ');
}

export class KeyRequest {
	asking = $state(false);
	key = $state('');
	error = $state('');

	async run(action: (unlock: string) => Promise<Outcome<unknown>>) {
		const outcome = await action(this.asking ? this.key : '');
		if (!('wrongKey' in outcome)) return true;
		if (this.asking) this.error = 'That passphrase or recovery key doesn’t unlock it';
		this.asking = true;
		return false;
	}
}
