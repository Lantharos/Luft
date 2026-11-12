import type { Component } from 'svelte';
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
	files: 'Your files',
	apps: 'Apps',
	luft: 'This version of Luft',
	olderLuft: 'Older versions of Luft',
	update: 'Downloaded update',
	other: 'System files'
};

const PART_DETAILS: Record<PartKind, string> = {
	files: 'Home folders',
	apps: 'Installed apps and what they keep outside home folders',
	luft: 'The version running now',
	olderLuft: 'Kept so you can go back',
	update: 'Installs at the next restart',
	other: 'Logs, caches and system settings'
};

const NIGHTLY = '-nightly.';

function versionName(version: string) {
	const [release, number] = version.split(NIGHTLY);
	return `Luft ${number ? `${release} Nightly ${number}` : release}`;
}

export function partTiles(parts: Part[]): Tile[] {
	return parts.map((part, index) => ({
		key: `part:${part.kind}`,
		kind: part.path.length ? 'dir' : 'part',
		name: part.path.at(-1) ?? '',
		label: part.version ? versionName(part.version) : PART_NAMES[part.kind],
		size: part.size,
		detail: part.measured ? PART_DETAILS[part.kind] : 'Measuring…',
		inner: [],
		done: part.measured,
		tone: index % 3,
		part: part.kind
	}));
}
