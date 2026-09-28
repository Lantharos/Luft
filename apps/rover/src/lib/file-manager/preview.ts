import type { DriveInfo, FileEntry, TrashItem, UserDirs } from '$lib/types';
import { joinPath } from '$lib/utils/paths';

const now = Math.floor(Date.now() / 1000);

export const previewUserDirs: UserDirs = {
	home: '/home/kristof',
	desktop: '/home/kristof/Desktop',
	documents: '/home/kristof/Documents',
	downloads: '/home/kristof/Downloads',
	pictures: '/home/kristof/Pictures',
	music: '/home/kristof/Music',
	videos: '/home/kristof/Videos'
};

export const previewDrives: DriveInfo[] = [
	{
		name: 'System',
		mount_point: '/',
		total_space: 1024 ** 4,
		available_space: 412 * 1024 ** 3,
		used_space: 612 * 1024 ** 3,
		is_removable: false
	},
	{
		name: 'Archive',
		mount_point: '/mnt/archive',
		total_space: 2 * 1024 ** 4,
		available_space: 1.3 * 1024 ** 4,
		used_space: 0.7 * 1024 ** 4,
		is_removable: false
	},
	{
		name: 'ROVER USB',
		mount_point: '/run/media/kristof/ROVER_USB',
		total_space: 64 * 1024 ** 3,
		available_space: 42 * 1024 ** 3,
		used_space: 22 * 1024 ** 3,
		is_removable: true
	}
];

export const previewTrash: TrashItem[] = [
	{
		id: '/home/kristof/.local/share/Trash/files/old-notes.txt',
		name: 'old-notes.txt',
		original_path: '/home/kristof/Documents/old-notes.txt',
		trash_path: '/home/kristof/.local/share/Trash',
		deleted_at: now - 86400,
		size: 12_480,
		is_dir: false
	}
];

export function previewEntries(path: string): FileEntry[] {
	return path.endsWith('/Downloads')
		? [
				entry(path, 'Rover_0.1.0_amd64.AppImage', false, 118_000_000, 'AppImage', now - 1800),
				entry(path, 'screenshots', true, 0, null, now - 7200),
				entry(path, 'invoice.pdf', false, 822_000, 'pdf', now - 14800)
			]
		: [
				entry(path, 'Desktop', true, 0, null, now - 4200),
				entry(path, 'Documents', true, 0, null, now - 6400),
				entry(path, 'Downloads', true, 0, null, now - 1800),
				entry(path, 'Pictures', true, 0, null, now - 9200),
				entry(path, 'rover-notes.md', false, 18_240, 'md', now - 3600),
				entry(path, 'wireframe.png', false, 1_420_000, 'png', now - 12000)
			];
}

function entry(path: string, name: string, isDir: boolean, size: number, extension: string | null, modified: number): FileEntry {
	return {
		name,
		path: joinPath(path, name),
		is_dir: isDir,
		is_file: !isDir,
		is_hidden: name.startsWith('.'),
		size,
		modified,
		mime_type: extension ? mimeFor(extension) : null,
		extension
	};
}

function mimeFor(extension: string) {
	if (extension === 'png') return 'image/png';
	if (extension === 'pdf') return 'application/pdf';
	if (extension === 'md') return 'text/markdown';
	return 'application/octet-stream';
}
