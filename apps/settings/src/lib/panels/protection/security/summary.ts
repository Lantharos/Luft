import type { Trust } from './api';
import { progressLine } from './encryption/describe';

export interface Summary {
	headline: string;
	sentence: string;
	safe: boolean;
}

const PROTECTED = 'Your device is protected';

export function summarize({ disk, secureBoot }: Trust, firmwareUpdates: number): Summary | null {
	switch (disk.state) {
		case 'encrypting':
			return { headline: 'Encrypting your device', sentence: `${progressLine(disk)}. Keep working while it finishes.`, safe: true };
		case 'decrypting':
			return { headline: 'Turning off device encryption', sentence: `${progressLine(disk)}. Keep working while it finishes.`, safe: false };
		case 'starting':
			return { headline: 'Restart to start encrypting', sentence: 'Encryption starts the next time this computer restarts.', safe: false };
		case 'failed':
			return { headline: 'Encryption didn’t start', sentence: 'Luft started without it and your files weren’t changed. Turn it on again to try once more.', safe: false };
		case 'off':
			return disk.device ? { headline: 'Your device could be safer', sentence: 'Turn on device encryption to keep your files private.', safe: false } : null;
	}
	if (disk.secureBootChanged)
		return { headline: 'This computer starts differently now', sentence: 'If you changed its Secure Boot settings, confirm it so the disk unlocks by itself again.', safe: false };
	if (disk.tpmRefused) return { headline: 'Your disk needed its recovery key', sentence: 'Link the security chip again so it unlocks by itself.', safe: false };
	if (firmwareUpdates) return { headline: PROTECTED, sentence: 'Firmware updates for your hardware are ready in Updates.', safe: true };
	return {
		headline: PROTECTED,
		sentence: secureBoot === 'on' ? 'Your disk is encrypted and Secure Boot checks how it starts.' : 'Your disk is encrypted.',
		safe: true
	};
}
