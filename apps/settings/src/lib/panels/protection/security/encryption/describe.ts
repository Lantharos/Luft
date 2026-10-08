import type { Disk } from '../api';

export function unlockSummary({ unlock }: Disk) {
	if (unlock.includes('tpm') && unlock.includes('pin')) return 'Unlocks with the security chip and your PIN';
	if (unlock.includes('tpm')) return 'Unlocks by itself with the security chip';
	if (unlock.includes('passphrase')) return 'Asks for your passphrase at startup';
	if (unlock.includes('security-key')) return 'Unlocks with your security key at startup';
	return 'Asks for your recovery key at startup';
}

function remaining(seconds: number) {
	if (!seconds) return '';
	if (seconds < 60) return 'less than a minute left';
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
	const hours = Math.round(minutes / 60);
	return `about ${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
}

export function progressLine(disk: Disk) {
	return [`${Math.floor(disk.progress * 100)}% done`, remaining(disk.remaining)].filter(Boolean).join(', ');
}
