import Archive from '@luft/symbols/icons/archive';
import Code from '@luft/symbols/icons/code';
import File from '@luft/symbols/icons/file';
import FileText from '@luft/symbols/icons/file-text';
import Folder from '@luft/symbols/icons/folder';
import Image from '@luft/symbols/icons/image';
import Music from '@luft/symbols/icons/music';
import Package from '@luft/symbols/icons/package';
import Video from '@luft/symbols/icons/video';
import type { Component } from 'svelte';
import type { FileKind } from '#lib/utils/kinds.js';

export const KIND_ICONS: Record<FileKind, Component> = {
	folder: Folder,
	file: File,
	image: Image,
	video: Video,
	audio: Music,
	archive: Archive,
	code: Code,
	document: FileText,
	package: Package
};
