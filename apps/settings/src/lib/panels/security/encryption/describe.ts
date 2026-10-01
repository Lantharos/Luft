import type { Disk } from '../api';

export function unlockSummary({ unlock }: Disk) {
	if (unlock.includes('tpm') && unlock.includes('pin')) return 'Unlocks with the TPM and your PIN when the computer starts';
	if (unlock.includes('tpm')) return 'Unlocks by itself with the TPM when the computer starts';
	if (unlock.includes('passphrase')) return 'Asks for your passphrase when the computer starts';
	if (unlock.includes('security-key')) return 'Unlocks with your security key when the computer starts';
	return 'Asks for your recovery key when the computer starts';
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

export function diskStatus(disk: Disk) {
	switch (disk.state) {
		case 'starting':
			return 'Restart to start encrypting';
		case 'encrypting':
			return `Encrypting · ${progressLine(disk)}`;
		case 'decrypting':
			return `Decrypting · ${progressLine(disk)}`;
		case 'on':
			return unlockSummary(disk);
		default:
			return 'Keeps your files private if this computer is lost or stolen';
	}
}
