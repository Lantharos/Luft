import type { Volume } from '#lib/api.js';

export type Table = 'gpt' | 'dos';

type Role = 'firmware' | 'boot' | 'reserved' | 'swap' | 'data';

interface PartitionType {
	value: string;
	label: string;
	role: Role;
	offered?: boolean;
}

const EFI_SYSTEM = 'c12a7328-f81f-11d2-ba4b-00a0c93ec93b';
const LINUX_DATA = '0fc63daf-8483-4772-8e79-3d69d8477de4';
const BASIC_DATA = 'ebd0a0a2-b9e5-4433-87c0-68b6b72699c7';

const GPT: PartitionType[] = [
	{ value: LINUX_DATA, label: 'Linux data', role: 'data', offered: true },
	{ value: '4f68bce3-e8cd-4db1-96e7-fbcaf984b709', label: 'Linux root', role: 'data', offered: true },
	{ value: '933ac7e1-2eb4-4f13-b844-0e14e2aef915', label: 'Linux home', role: 'data', offered: true },
	{ value: 'ca7d7ccb-63ed-4c53-861c-1742536059cc', label: 'Linux encrypted', role: 'data', offered: true },
	{ value: 'e6d6d379-f507-44c2-a23c-238f2a3df928', label: 'Linux LVM', role: 'data', offered: true },
	{ value: '0657fd6d-a4ab-43c4-84e5-0933c84b4f4f', label: 'Linux swap', role: 'swap', offered: true },
	{ value: 'bc13c2ff-59e6-4262-a352-b275fd6f7172', label: 'Linux boot', role: 'boot', offered: true },
	{ value: EFI_SYSTEM, label: 'EFI system', role: 'firmware', offered: true },
	{ value: '21686148-6449-6e6f-744e-656564454649', label: 'BIOS boot', role: 'firmware', offered: true },
	{ value: BASIC_DATA, label: 'Microsoft basic data', role: 'data', offered: true },
	{ value: 'e3c9e316-0b5c-4db8-817d-f92df00215ae', label: 'Microsoft reserved', role: 'reserved', offered: true },
	{ value: 'de94bba4-06d1-4d40-a16a-bfd50179d6ac', label: 'Windows recovery', role: 'reserved', offered: true },
	{ value: '48465300-0000-11aa-aa11-00306543ecac', label: 'Apple HFS+', role: 'data' },
	{ value: '7c3457ef-0000-11aa-aa11-00306543ecac', label: 'Apple APFS', role: 'data' }
];

const DOS: PartitionType[] = [
	{ value: '0x83', label: 'Linux', role: 'data', offered: true },
	{ value: '0x82', label: 'Linux swap', role: 'swap', offered: true },
	{ value: '0x8e', label: 'Linux LVM', role: 'data', offered: true },
	{ value: '0x07', label: 'NTFS or exFAT', role: 'data', offered: true },
	{ value: '0x0c', label: 'FAT32', role: 'data', offered: true },
	{ value: '0x0b', label: 'FAT32', role: 'data' },
	{ value: '0xef', label: 'EFI system', role: 'firmware', offered: true },
	{ value: '0x27', label: 'Windows recovery', role: 'reserved' },
	{ value: '0x05', label: 'Extended', role: 'reserved' },
	{ value: '0x0f', label: 'Extended', role: 'reserved' }
];

const BY_VALUE = new Map([...GPT, ...DOS].map((type) => [type.value, type]));

export function partitionType(value: string | null) {
	return value ? (BY_VALUE.get(value.toLowerCase()) ?? null) : null;
}

export function typeName(value: string | null) {
	if (!value) return null;
	return partitionType(value)?.label ?? value;
}

export function typeOptions(table: Table, current: string) {
	const offered = (table === 'gpt' ? GPT : DOS).filter((type) => type.offered);
	const known = offered.some((type) => type.value === current.toLowerCase());
	return [...(known || !current ? [] : [{ value: current, label: typeName(current) ?? current }]), ...offered.map(({ value, label }) => ({ value, label }))];
}

const FILESYSTEM_TYPES: Record<Table, Record<string, string>> = {
	gpt: { exfat: BASIC_DATA, ntfs: BASIC_DATA, vfat: BASIC_DATA },
	dos: { exfat: '0x07', ntfs: '0x07', vfat: '0x0c' }
};

export function typeFor(table: Table, filesystem: string) {
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

export const FLAGS: Record<Table, { bit: number; label: string; description: string }[]> = {
	gpt: [
		{ bit: 0, label: 'Needed by the firmware', description: 'Tools leave it alone, even when it looks unused' },
		{ bit: 2, label: 'Bootable on older computers', description: 'Marks it for computers that start without UEFI' },
		{ bit: 62, label: 'Hidden', description: 'File managers don’t show it' },
		{ bit: 63, label: 'Don’t mount automatically', description: 'It stays unmounted until someone mounts it' }
	],
	dos: [{ bit: 7, label: 'Bootable', description: 'Marks it as the partition the computer starts from' }]
};
