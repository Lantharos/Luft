import Archive from '@lucide/svelte/icons/archive';
import Code from '@lucide/svelte/icons/code';
import File from '@lucide/svelte/icons/file';
import FileText from '@lucide/svelte/icons/file-text';
import Folder from '@lucide/svelte/icons/folder';
import Image from '@lucide/svelte/icons/image';
import Music from '@lucide/svelte/icons/music';
import Package from '@lucide/svelte/icons/package';
import Video from '@lucide/svelte/icons/video';
import type { Component } from 'svelte';
import type { EntryIconName } from '#lib/utils/file-kinds.js';

export const KIND_ICONS: Record<EntryIconName, Component> = {
	folder: Folder,
	file: File,
	image: Image,
	video: Video,
	music: Music,
	archive: Archive,
	code: Code,
	'file-text': FileText,
	package: Package
};
