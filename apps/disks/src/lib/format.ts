import type { Drive, Filesystem, Health, Volume } from './api';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function bytes(value: number) {
	let size = value;
	let unit = 0;
	while (size >= 1000 && unit < UNITS.length - 1) {
		size /= 1000;
		unit += 1;
	}
	return `${size >= 100 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${UNITS[unit]}`;
}

export const FILESYSTEM_NAMES: Record<string, string> = {
	ext4: 'ext4',
	ext3: 'ext3',
	ext2: 'ext2',
	btrfs: 'Btrfs',
	xfs: 'XFS',
	exfat: 'exFAT',
	ntfs: 'NTFS',
	vfat: 'FAT32',
	f2fs: 'F2FS',
	swap: 'Swap',
	crypto_LUKS: 'Encrypted',
	LVM2_member: 'LVM',
	iso9660: 'ISO 9660',
	udf: 'UDF',
	squashfs: 'SquashFS'
};

export const LABEL_LIMITS: Record<Filesystem, number> = { ext4: 16, btrfs: 255, exfat: 15, ntfs: 32, vfat: 11 };

export function filesystemName(volume: Volume) {
	if (!volume.fsType) return volume.usage ? 'Unknown' : 'No filesystem';
	return FILESYSTEM_NAMES[volume.fsType] ?? volume.fsType;
}

const EFI_PARTITION = 'c12a7328-f81f-11d2-ba4b-00a0c93ec93b';

export function volumeName(volume: Volume) {
	const contents = inner(volume);
	if (volume.label || contents.label) return volume.label || contents.label;
	if (volume.partitionType === EFI_PARTITION || volume.partitionType === '0xef') return 'EFI system';
	if (contents.mountPoints[0]) return contents.mountPoints[0];
	return volume.number ? `Partition ${volume.number}` : volume.device.replace('/dev/', '');
}

export function inner(volume: Volume) {
	return volume.encryption?.cleartext ?? volume;
}

export function isMounted(volume: Volume) {
	return inner(volume).mountPoints.length > 0;
}

export function duration(hours: number) {
	if (hours < 48) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
	const days = Math.round(hours / 24);
	if (days < 60) return `${days} days`;
	const months = Math.round(days / 30.4);
	if (months < 24) return `${months} months`;
	const years = Math.round((days / 365) * 10) / 10;
	return `${years} years`;
}

export function healthTitle(health: Health) {
	if (health.state === 'failing') return 'This drive reports that it is failing';
	if (health.state === 'warning') return 'This drive is wearing out';
	return 'Healthy';
}

export function healthAdvice(health: Health) {
	if (health.state === 'failing') return 'Back up your files now and replace the drive soon.';
	if (health.state === 'warning') {
		if (health.badSectors > 0) return `${health.badSectors} ${health.badSectors === 1 ? 'sector' : 'sectors'} can no longer be read reliably. Back up anything important.`;
		return 'Back up anything important and keep an eye on it.';
	}
	return 'The drive reports no problems.';
}

export function selftestResult(status: string) {
	if (!status || status === 'inprogress') return null;
	if (status === 'success') return 'The last self-test passed';
	if (status === 'aborted' || status === 'interrupted' || status === 'ctrl_reset' || status === 'ns_removed') return 'The last self-test was stopped';
	return 'The last self-test found problems';
}

export function driveKindName(drive: Drive) {
	const names: Record<Drive['kind'], string> = {
		nvme: 'NVMe drive',
		ssd: 'Solid-state drive',
		hdd: 'Hard drive',
		usb: 'USB drive',
		card: 'Memory card',
		optical: 'Disc drive',
		image: 'Disk image'
	};
	return names[drive.kind];
}

export function errorText(caught: unknown) {
	return caught instanceof Error ? caught.message : String(caught);
}
