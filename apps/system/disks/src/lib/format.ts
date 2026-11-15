import { i18n, t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import type { Drive, Filesystem, Health, Job, Segment, Volume } from './bindings';
import { isEfiSystem, partitionType, typeLabel } from './partitions/types';

const FILESYSTEM_NAMES: Record<string, string> = {
	ext4: 'ext4',
	ext3: 'ext3',
	ext2: 'ext2',
	btrfs: 'Btrfs',
	xfs: 'XFS',
	exfat: 'exFAT',
	ntfs: 'NTFS',
	vfat: 'FAT32',
	f2fs: 'F2FS',
	LVM2_member: 'LVM',
	iso9660: 'ISO 9660',
	udf: 'UDF',
	squashfs: 'SquashFS'
};

const LUFT_LABEL = 'luft';

export const LABEL_LIMITS: Record<Filesystem, number> = { ext4: 16, btrfs: 255, exfat: 15, ntfs: 32, vfat: 11 };

function formatter(options: Intl.NumberFormatOptions) {
	let locale = '';
	let format: Intl.NumberFormat;
	return () => {
		if (locale !== i18n.formats) {
			locale = i18n.formats;
			format = new Intl.NumberFormat(locale, options);
		}
		return format;
	};
}

const percents = formatter({ style: 'percent' });
const celsius = formatter({ style: 'unit', unit: 'celsius', maximumFractionDigits: 0 });
const UNITS = { hour: 0, day: 0, month: 0, year: 1 } as const;
const spans = Object.fromEntries(
	Object.entries(UNITS).map(([unit, digits]) => [unit, formatter({ style: 'unit', unit, unitDisplay: 'long', maximumFractionDigits: digits })])
) as Record<keyof typeof UNITS, () => Intl.NumberFormat>;

export function filesystemLabel(filesystem: string) {
	if (filesystem === 'swap') return t('disks-filesystem-swap');
	if (filesystem === 'crypto_LUKS') return t('disks-filesystem-encrypted');
	return FILESYSTEM_NAMES[filesystem] ?? filesystem;
}

export function filesystemName(volume: Volume) {
	if (!volume.fsType) return volume.usage ? t('disks-filesystem-unknown') : t('disks-filesystem-none');
	return filesystemLabel(volume.fsType);
}

export function folderName(path: string) {
	return path.replace(/^\/var\/(mnt|home|srv|opt)(?=\/|$)/, '/$1');
}

export function volumeName(volume: Volume) {
	const contents = inner(volume);
	const label = volume.label || contents.label;
	if (label === LUFT_LABEL) return 'Luft';
	if (label) return label;
	if (volume.partitionName) return volume.partitionName;
	if (isEfiSystem(volume)) return t('disks-partition-type-efi');
	if (contents.mountPoints[0]) return folderName(contents.mountPoints[0]);
	const type = partitionType(volume.partitionType);
	if (type && type.role !== 'data') return typeLabel(type);
	return volume.number ? t('disks-partition-numbered', { number: volume.number }) : volume.device.replace('/dev/', '');
}

export function inner(volume: Volume) {
	return volume.encryption?.cleartext ?? volume;
}

export function segmentName(segment: Segment) {
	return segment.kind === 'volume' ? volumeName(segment) : t('disks-free-space');
}

export function usedShare(item: Segment | Volume) {
	if ('kind' in item && item.kind === 'free') return null;
	const volume = item as Volume;
	const contents = inner(volume);
	if (contents.used === null || volume.size === 0) return null;
	return Math.min(1, contents.used / volume.size);
}

export function percent(share: number) {
	return percents().format(Math.floor(share * 100) / 100);
}

const JOBS: Record<string, string> = {
	'format-mkfs': 'formatting',
	'format-erase': 'erasing',
	'partition-create': 'creating',
	'partition-delete': 'deleting',
	'partition-modify': 'changing',
	'filesystem-resize': 'resizing',
	'partition-resize': 'resizing',
	'filesystem-mount': 'mounting',
	'filesystem-unmount': 'unmounting',
	'encrypted-unlock': 'unlocking',
	'encrypted-lock': 'locking',
	'filesystem-check': 'checking',
	'filesystem-repair': 'repairing',
	'ata-smart-selftest': 'testing',
	'drive-eject': 'ejecting',
	'drive-power-off': 'powering-off'
};

export function jobText(job: Job) {
	const operation = JOBS[job.operation] ?? 'other';
	return job.progress === null ? t('disks-job', { operation }) : t('disks-job-progress', { operation, progress: percent(job.progress) });
}

export function duration(hours: number) {
	if (hours < 48) return spans.hour().format(hours);
	const days = Math.round(hours / 24);
	if (days < 60) return spans.day().format(days);
	const months = Math.round(days / 30.4);
	if (months < 24) return spans.month().format(months);
	return spans.year().format(days / 365);
}

export function temperature(degrees: number) {
	return celsius().format(degrees);
}

export function healthTitle(health: Health) {
	return t('disks-health-title', { state: health.state });
}

export function healthSummary(health: Health) {
	if (health.state !== 'good') return t('disks-health-summary', { state: health.state });
	const facts = [];
	if (health.temperature !== null) facts.push(temperature(health.temperature));
	if (health.powerOnHours !== null) facts.push(t('disks-health-use', { duration: duration(health.powerOnHours) }));
	return facts.join(' · ');
}

export function healthAdvice(health: Health) {
	if (health.state === 'failing') return t('disks-health-advice-failing');
	if (health.state === 'warning') {
		if (health.badSectors > 0) return t('disks-health-advice-sectors', { count: health.badSectors });
		return t('disks-health-advice-warning');
	}
	return undefined;
}

export function selftestResult(status: string) {
	if (!status || status === 'inprogress') return null;
	if (status === 'success') return t('disks-selftest-passed');
	if (status === 'aborted' || status === 'interrupted' || status === 'ctrl_reset' || status === 'ns_removed') return t('disks-selftest-stopped');
	return t('disks-selftest-problems');
}

export function builtIn(drive: Drive) {
	return !drive.removable && drive.kind !== 'usb' && drive.kind !== 'card' && drive.kind !== 'image';
}

export function driveKindName(drive: Drive) {
	return t('disks-drive-kind', { kind: drive.kind });
}

export function driveSummary(drive: Drive) {
	return t('disks-drive-summary', { kind: drive.kind, size: bytes(drive.size) });
}
