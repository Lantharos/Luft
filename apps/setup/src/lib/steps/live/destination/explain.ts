import { bytes } from '@luft/ui';
import type { Drive, WindowsVolume } from '#lib/api/installer.js';

const GIB = 1024 ** 3;
const MIB = 1024 ** 2;
const BIOS_BOOT = MIB;
const BOOT = 2 * GIB;
const ESP = GIB;
const SHARED_ESP = 512 * MIB;

export function overhead(drive: Drive) {
	return BIOS_BOOT + BOOT + (drive.esp && drive.esp.size >= SHARED_ESP ? 0 : ESP);
}

export function windowsName(windows: WindowsVolume) {
	return windows.version ?? 'Windows';
}

export function whyWindowsCantShrink(windows: WindowsVolume, needed: number): string {
	switch (windows.blocked) {
		case 'bitlocker':
			return 'Windows keeps this drive locked with BitLocker, so Luft can’t make room on it. In Windows, turn off device encryption, or shrink the drive in Disk Management and choose the free space under Custom.';
		case 'hibernated':
			return 'Windows is asleep or was shut down with Fast Startup, so its drive can’t be changed safely. Start Windows, hold Shift while you choose Shut down, then start Luft again.';
		case 'dirty':
			return 'Windows’ drive needs a quick check first. Start Windows, restart it once, then start Luft again.';
		case 'full':
			return `Windows needs almost all of its drive. Free up about ${bytes(Math.max(needed - windows.room, GIB))} in Windows, then start Luft again.`;
		default:
			return '';
	}
}

export const FAST_STARTUP =
	'Fast Startup is on in Windows. It can lock the drive while you’re using Luft, so turn it off in Windows under Power Options, Choose what the power buttons do.';

export function describeDrive(drive: Drive) {
	if (drive.windows) return `Has ${windowsName(drive.windows)}`;
	if (drive.partitions === 0) return 'Empty';
	return drive.partitions === 1 ? 'Has 1 partition' : `Has ${drive.partitions} partitions`;
}
