import { bytes } from '@luft/ui';
import type { Stick, Variant } from '#lib/api/stick.js';

const FILESYSTEMS: Record<string, string> = {
	vfat: 'FAT',
	exfat: 'exFAT',
	ntfs: 'NTFS',
	iso9660: 'ISO 9660',
	xfs: 'XFS'
};

function contents(stick: Stick) {
	if (stick.ventoy) return 'Ventoy';
	const names = stick.volumes.map((volume) => volume.label ?? (volume.filesystem && (FILESYSTEMS[volume.filesystem] ?? volume.filesystem))).filter(Boolean);
	return names.length ? names.join(', ') : 'Empty';
}

export function detail(stick: Stick, needed: number) {
	if (stick.size < needed) return `${bytes(stick.size)} · Too small for Luft`;
	return `${bytes(stick.size)} · ${contents(stick)}`;
}

export function forThisComputer(variant: Variant, computer: string) {
	return variant === 'nvidia' ? `Smaller, with NVIDIA’s driver for this ${computer}’s graphics.` : `Smaller, for computers without NVIDIA graphics, like this ${computer}.`;
}
