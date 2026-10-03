import { bytes } from '@luft/ui';
import type { Drive, Filesystem, Health, Job, Segment, Volume } from './api';

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

export function segmentName(segment: Segment) {
	return segment.kind === 'volume' ? volumeName(segment) : 'Free space';
}

export function usedShare(item: Segment | Volume) {
	if ('kind' in item && item.kind === 'free') return null;
	const volume = item as Volume;
	const contents = inner(volume);
	if (contents.used === null || volume.size === 0) return null;
	return Math.min(1, contents.used / volume.size);
}

export function percent(share: number) {
	return `${Math.floor(share * 100)}%`;
}

const PARTITION_TYPES: Record<string, string> = {
	[EFI_PARTITION]: 'EFI system',
	'0fc63daf-8483-4772-8e79-3d69d8477de4': 'Linux data',
	'4f68bce3-e8cd-4db1-96e7-fbcaf984b709': 'Linux root',
	'bc13c2ff-59e6-4262-a352-b275fd6f7172': 'Linux boot',
	'0657fd6d-a4ab-43c4-84e5-0933c84b4f4f': 'Linux swap',
	'ca7d7ccb-63ed-4c53-861c-1742536059cc': 'Linux encrypted',
	'e6d6d379-f507-44c2-a23c-238f2a3df928': 'Linux LVM',
	'ebd0a0a2-b9e5-4433-87c0-68b6b72699c7': 'Microsoft basic data',
	'e3c9e316-0b5c-4db8-817d-f92df00215ae': 'Microsoft reserved',
	'de94bba4-06d1-4d40-a16a-bfd50179d6ac': 'Windows recovery',
	'48465300-0000-11aa-aa11-00306543ecac': 'Apple HFS+',
	'7c3457ef-0000-11aa-aa11-00306543ecac': 'Apple APFS',
	'0xef': 'EFI system',
	'0x83': 'Linux',
	'0x82': 'Linux swap',
	'0x8e': 'Linux LVM',
	'0x07': 'NTFS or exFAT',
	'0x0b': 'FAT32',
	'0x0c': 'FAT32',
	'0x05': 'Extended',
	'0x0f': 'Extended'
};

export function partitionTypeName(volume: Volume) {
	if (!volume.partitionType) return null;
	return PARTITION_TYPES[volume.partitionType.toLowerCase()] ?? volume.partitionType;
}

const JOBS: Record<string, string> = {
	'format-mkfs': 'Formatting',
	'format-erase': 'Erasing',
	'partition-create': 'Creating',
	'partition-delete': 'Deleting',
	'partition-modify': 'Changing',
	'filesystem-resize': 'Resizing',
	'partition-resize': 'Resizing',
	'filesystem-mount': 'Mounting',
	'filesystem-unmount': 'Unmounting',
	'encrypted-unlock': 'Unlocking',
	'encrypted-lock': 'Locking',
	'filesystem-check': 'Checking',
	'filesystem-repair': 'Repairing',
	'ata-smart-selftest': 'Testing',
	'drive-eject': 'Ejecting',
	'drive-power-off': 'Powering off'
};

export function jobText(job: Job) {
	const name = JOBS[job.operation] ?? 'Working';
	return job.progress === null ? `${name}…` : `${name}… ${percent(job.progress)}`;
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
	if (health.state === 'failing') return 'Failing';
	if (health.state === 'warning') return 'Wearing out';
	return 'Healthy';
}

export function healthSummary(health: Health) {
	if (health.state === 'failing') return 'Back up your files now';
	if (health.state === 'warning') return 'Back up anything important';
	const facts = [];
	if (health.temperature !== null) facts.push(`${Math.round(health.temperature)} °C`);
	if (health.powerOnHours !== null) facts.push(`${duration(health.powerOnHours)} of use`);
	return facts.join(' · ');
}

export function healthAdvice(health: Health) {
	if (health.state === 'failing') return 'This drive reports that it is failing. Back up your files now and replace the drive soon.';
	if (health.state === 'warning') {
		if (health.badSectors > 0) return `${health.badSectors} ${health.badSectors === 1 ? 'sector' : 'sectors'} can no longer be read reliably. Back up anything important.`;
		return 'Back up anything important and keep an eye on it.';
	}
	return 'The drive reports no problems.';
}

export function selftestResult(status: string) {
	if (!status || status === 'inprogress') return null;
	if (status === 'success') return 'Passed last time';
	if (status === 'aborted' || status === 'interrupted' || status === 'ctrl_reset' || status === 'ns_removed') return 'Stopped last time';
	return 'Found problems last time';
}

const KINDS: Record<Drive['kind'], string> = {
	nvme: 'NVMe drive',
	ssd: 'solid-state drive',
	hdd: 'hard drive',
	usb: 'USB drive',
	card: 'memory card',
	optical: 'disc drive',
	image: 'disk image'
};

export function driveKindName(drive: Drive) {
	const name = KINDS[drive.kind];
	return name[0].toUpperCase() + name.slice(1);
}

export function driveSummary(drive: Drive) {
	return `${bytes(drive.size)} ${KINDS[drive.kind]}`;
}

export function errorText(caught: unknown) {
	return caught instanceof Error ? caught.message : String(caught);
}
