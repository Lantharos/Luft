import type { Trust } from './api';
import { progressLine } from './encryption/describe';

export interface Summary {
	headline: string;
	sentence: string;
	safe: boolean;
}

const SAFER = 'Your device could be safer';

export function summarize({ disk, secureBoot }: Trust, firmwareUpdates: number | null): Summary {
	const secureBootOn = secureBoot === 'on';
	switch (disk.state) {
		case 'encrypting':
			return { headline: 'Encrypting your device', sentence: `${progressLine(disk)}. You can keep working while it finishes.`, safe: true };
		case 'decrypting':
			return { headline: 'Turning off device encryption', sentence: `${progressLine(disk)}. You can keep working while it finishes.`, safe: false };
		case 'starting':
			return { headline: 'Restart to start encrypting', sentence: 'Everything is ready. Encryption starts the next time your computer restarts.', safe: false };
		case 'off':
			return { headline: SAFER, sentence: 'Turn on device encryption to keep your files private if this computer is lost or stolen.', safe: false };
	}
	if (disk.tpmRefused) return { headline: 'Your disk needed its recovery key', sentence: 'Link the TPM again below so the disk unlocks by itself next time.', safe: false };
	if (secureBoot === 'off' || secureBoot === 'setup')
		return { headline: SAFER, sentence: 'Turn on Secure Boot in your computer’s firmware settings so only trusted software can start it.', safe: false };
	if (firmwareUpdates) return { headline: 'Your device is protected', sentence: 'Firmware updates for your hardware are ready in Updates.', safe: true };
	return {
		headline: 'Your device is protected',
		sentence: secureBootOn ? 'Your disk is encrypted, and Secure Boot checks everything that starts your computer.' : 'Your disk is encrypted.',
		safe: true
	};
}
