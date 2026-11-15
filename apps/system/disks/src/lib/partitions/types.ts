import { t } from '@luft/i18n';
import type { PartitionTable, Volume } from '#lib/bindings.js';

type Role = 'firmware' | 'boot' | 'reserved' | 'swap' | 'data';

type PartitionType = {
	value: string;
	role: Role;
	offered?: boolean;
} & ({ label: string } | { name: string });

const EFI_SYSTEM = 'c12a7328-f81f-11d2-ba4b-00a0c93ec93b';
const LINUX_DATA = '0fc63daf-8483-4772-8e79-3d69d8477de4';
const BASIC_DATA = 'ebd0a0a2-b9e5-4433-87c0-68b6b72699c7';

const GPT: PartitionType[] = [
	{ value: LINUX_DATA, label: 'disks-partition-type-linux-data', role: 'data', offered: true },
	{ value: '4f68bce3-e8cd-4db1-96e7-fbcaf984b709', label: 'disks-partition-type-linux-root', role: 'data', offered: true },
	{ value: '933ac7e1-2eb4-4f13-b844-0e14e2aef915', label: 'disks-partition-type-linux-home', role: 'data', offered: true },
	{ value: 'ca7d7ccb-63ed-4c53-861c-1742536059cc', label: 'disks-partition-type-linux-encrypted', role: 'data', offered: true },
	{ value: 'e6d6d379-f507-44c2-a23c-238f2a3df928', label: 'disks-partition-type-linux-lvm', role: 'data', offered: true },
	{ value: '0657fd6d-a4ab-43c4-84e5-0933c84b4f4f', label: 'disks-partition-type-linux-swap', role: 'swap', offered: true },
	{ value: 'bc13c2ff-59e6-4262-a352-b275fd6f7172', label: 'disks-partition-type-linux-boot', role: 'boot', offered: true },
	{ value: EFI_SYSTEM, label: 'disks-partition-type-efi', role: 'firmware', offered: true },
	{ value: '21686148-6449-6e6f-744e-656564454649', label: 'disks-partition-type-bios-boot', role: 'firmware', offered: true },
	{ value: BASIC_DATA, label: 'disks-partition-type-microsoft-data', role: 'data', offered: true },
	{ value: 'e3c9e316-0b5c-4db8-817d-f92df00215ae', label: 'disks-partition-type-microsoft-reserved', role: 'reserved', offered: true },
	{ value: 'de94bba4-06d1-4d40-a16a-bfd50179d6ac', label: 'disks-partition-type-windows-recovery', role: 'reserved', offered: true },
	{ value: '48465300-0000-11aa-aa11-00306543ecac', label: 'disks-partition-type-apple-hfs', role: 'data' },
	{ value: '7c3457ef-0000-11aa-aa11-00306543ecac', label: 'disks-partition-type-apple-apfs', role: 'data' }
];

const DOS: PartitionType[] = [
	{ value: '0x83', label: 'disks-partition-type-linux', role: 'data', offered: true },
	{ value: '0x82', label: 'disks-partition-type-linux-swap', role: 'swap', offered: true },
	{ value: '0x8e', label: 'disks-partition-type-linux-lvm', role: 'data', offered: true },
	{ value: '0x07', label: 'disks-partition-type-ntfs-exfat', role: 'data', offered: true },
	{ value: '0x0c', name: 'FAT32', role: 'data', offered: true },
	{ value: '0x0b', name: 'FAT32', role: 'data' },
	{ value: '0xef', label: 'disks-partition-type-efi', role: 'firmware', offered: true },
	{ value: '0x27', label: 'disks-partition-type-windows-recovery', role: 'reserved' },
	{ value: '0x05', label: 'disks-partition-type-extended', role: 'reserved' },
	{ value: '0x0f', label: 'disks-partition-type-extended', role: 'reserved' }
];

const BY_VALUE = new Map([...GPT, ...DOS].map((type) => [type.value, type]));

export function partitionType(value: string | null) {
	return value ? (BY_VALUE.get(value.toLowerCase()) ?? null) : null;
}

export function typeLabel(type: PartitionType) {
	return 'name' in type ? type.name : t(type.label);
}

export function typeName(value: string | null) {
	if (!value) return null;
	const type = partitionType(value);
	return type ? typeLabel(type) : value;
}

export function typeOptions(table: PartitionTable, current: string) {
	const offered = (table === 'gpt' ? GPT : DOS).filter((type) => type.offered);
	const known = offered.some((type) => type.value === current.toLowerCase());
	return [...(known || !current ? [] : [{ value: current, label: typeName(current) ?? current }]), ...offered.map((type) => ({ value: type.value, label: typeLabel(type) }))];
}

const FILESYSTEM_TYPES: Record<PartitionTable, Record<string, string>> = {
	gpt: { exfat: BASIC_DATA, ntfs: BASIC_DATA, vfat: BASIC_DATA },
	dos: { exfat: '0x07', ntfs: '0x07', vfat: '0x0c' }
};

export function typeFor(table: PartitionTable, filesystem: string) {
	return FILESYSTEM_TYPES[table][filesystem] ?? (table === 'gpt' ? LINUX_DATA : '0x83');
}

export function isEfiSystem(volume: Volume) {
	return partitionType(volume.partitionType)?.value === EFI_SYSTEM || volume.partitionType === '0xef';
}

const SMALL_BOOT = 4 * 1000 ** 3;
const UNMEASURED_FILESYSTEMS = new Set(['swap', 'crypto_LUKS', 'LVM2_member', 'linux_raid_member', 'squashfs', 'iso9660', 'udf']);
const BOOT_MOUNTS = new Set(['/boot', '/boot/efi', '/efi']);

export function explorable(volume: Volume) {
	const contents = volume.encryption?.cleartext ?? volume;
	if (contents.usage !== 'filesystem' || contents.mountPoints.length === 0) return false;
	if (UNMEASURED_FILESYSTEMS.has(contents.fsType)) return false;
	const role = partitionType(volume.partitionType)?.role ?? 'data';
	if (role !== 'data') return false;
	const bootOnly = contents.mountPoints.every((point) => BOOT_MOUNTS.has(point));
	return !(bootOnly && volume.size <= SMALL_BOOT);
}

export const FLAGS: Record<PartitionTable, { bit: number; message: string }[]> = {
	gpt: [
		{ bit: 0, message: 'disks-flag-firmware' },
		{ bit: 2, message: 'disks-flag-legacy-boot' },
		{ bit: 62, message: 'disks-flag-hidden' },
		{ bit: 63, message: 'disks-flag-no-automount' }
	],
	dos: [{ bit: 7, message: 'disks-flag-bootable' }]
};
