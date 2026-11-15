import type { Component } from 'svelte';
import { t } from '@luft/i18n';
import AppWindow from '@lucide/svelte/icons/app-window';
import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
import Cog from '@lucide/svelte/icons/cog';
import Download from '@lucide/svelte/icons/download';
import House from '@lucide/svelte/icons/house';
import Layers from '@lucide/svelte/icons/layers';
import type { Part, PartKind } from '#lib/bindings.js';
import type { Tile } from './tiles';

export const PART_ICONS: Record<PartKind, Component<{ size?: number }>> = {
	files: House,
	apps: AppWindow,
	luft: Layers,
	olderLuft: ArchiveRestore,
	update: Download,
	other: Cog
};

export const PART_NAMES: Record<PartKind, string> = {
	files: 'disks-space-part-files',
	apps: 'disks-space-part-apps',
	luft: 'disks-space-part-luft',
	olderLuft: 'disks-space-part-older-luft',
	update: 'disks-space-part-update',
	other: 'disks-space-part-other'
};

const NIGHTLY = '-nightly.';

function versionName(version: string) {
	const [release, number] = version.split(NIGHTLY);
	return number ? t('disks-space-version-nightly', { version: release, number }) : t('disks-space-version', { version: release });
}

export function partTiles(parts: Part[]): Tile[] {
	return parts.map((part, index) => ({
		key: `part:${part.kind}`,
		kind: part.path.length ? 'dir' : 'part',
		name: part.path.at(-1) ?? '',
		label: part.version ? versionName(part.version) : t(PART_NAMES[part.kind]),
		size: part.size,
		detail: part.measured ? t(`${PART_NAMES[part.kind]}.description`) : t('disks-space-measuring-part'),
		inner: [],
		done: part.measured,
		tone: index % 3,
		part: part.kind
	}));
}
