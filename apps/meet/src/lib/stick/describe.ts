import { i18n, t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import type { Stick } from '#lib/api/stick.js';

const FILESYSTEMS: Record<string, string> = {
	vfat: 'FAT',
	exfat: 'exFAT',
	ntfs: 'NTFS',
	iso9660: 'ISO 9660',
	xfs: 'XFS'
};

function contents(stick: Stick) {
	if (stick.ventoy) return 'Ventoy';
	const names = stick.volumes.map((volume) => volume.label ?? (volume.filesystem && (FILESYSTEMS[volume.filesystem] ?? volume.filesystem))).filter((name): name is string => !!name);
	return names.length ? new Intl.ListFormat(i18n.locale, { type: 'unit' }).format(names) : t('stick-drive-empty');
}

export function detail(stick: Stick, needed: number) {
	if (stick.size < needed) return t('stick-drive-too-small', { size: bytes(stick.size) });
	return t('stick-drive-detail', { size: bytes(stick.size), contents: contents(stick) });
}
