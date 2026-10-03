import type { DriveInfo, FileEntry, TrashItem, UserDirs } from '#lib/types/index.js';
import { joinPath } from '#lib/utils/paths.js';

const now = Math.floor(Date.now() / 1000);
const HOME = '/home/kristof';
const LARGE_FOLDER_SIZE = 12_000;

export const previewUserDirs: UserDirs = {
	home: HOME,
	desktop: `${HOME}/Desktop`,
	documents: `${HOME}/Documents`,
	downloads: `${HOME}/Downloads`,
	pictures: `${HOME}/Pictures`,
	music: `${HOME}/Music`,
	videos: `${HOME}/Videos`
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
		available_space: 0.2 * 1024 ** 4,
		used_space: 1.8 * 1024 ** 4,
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
		id: `${HOME}/.local/share/Trash/files/old-notes.txt`,
		name: 'old-notes.txt',
		original_path: `${HOME}/Documents/old-notes.txt`,
		trash_path: `${HOME}/.local/share/Trash`,
		deleted_at: now - 86400,
		size: 12_480,
		is_dir: false
	}
];

const FOLDERS: Record<string, [string, number, number][]> = {
	[HOME]: [
		['Desktop/', 0, 4200],
		['Documents/', 0, 6400],
		['Downloads/', 0, 1800],
		['Music/', 0, 90_000],
		['Pictures/', 0, 9200],
		['Videos/', 0, 120_000],
		['Many files/', 0, 400_000],
		['rover-notes.md', 18_240, 3600],
		['wireframe.png', 1_420_000, 12_000],
		['budget-2026.ods', 48_200, 250_000]
	],
	[`${HOME}/Downloads`]: [
		['screenshots/', 0, 7200],
		['Rover_0.1.0_amd64.AppImage', 118_000_000, 1800],
		['invoice.pdf', 822_000, 14_800],
		['fonts.zip', 3_400_000, 260_000],
		['talk.mp4', 84_000_000, 520_000]
	],
	[`${HOME}/Documents`]: [
		['Projects/', 0, 3000],
		['letter.odt', 24_000, 40_000],
		['setup.sh', 2_100, 800_000],
		['notes.txt', 4_300, 9_000],
		['config.toml', 900, 1_200_000]
	],
	[`${HOME}/Pictures`]: [
		['Wallpapers/', 0, 80_000],
		['aurora.jpg', 4_200_000, 20_000],
		['desk.png', 2_800_000, 60_000],
		['icon.svg', 6_000, 90_000],
		['scan.tiff', 18_000_000, 900_000]
	],
	[`${HOME}/Music`]: [
		['Night Drive.flac', 32_000_000, 40_000],
		['Loop.ogg', 2_400_000, 90_000]
	]
};

export const previewRecent: FileEntry[] = [
	entry(`${HOME}/Documents`, 'notes.txt', 4_300, now - 900),
	entry(HOME, 'rover-notes.md', 18_240, now - 3600),
	entry(`${HOME}/Pictures`, 'aurora.jpg', 4_200_000, now - 7200),
	entry(`${HOME}/Downloads`, 'invoice.pdf', 822_000, now - 90_000)
];

export function previewEntries(path: string): FileEntry[] {
	if (path === `${HOME}/Many files`) return largeFolder(path);
	return (FOLDERS[path] ?? []).map(([name, size, age]) => entry(path, name, size, now - age));
}

function largeFolder(path: string) {
	const extensions = ['png', 'txt', 'rs', 'pdf', 'mp3', 'json'];
	return Array.from({ length: LARGE_FOLDER_SIZE }, (_, index) =>
		entry(path, `item-${String(index).padStart(5, '0')}.${extensions[index % extensions.length]}`, 1000 + index * 37, now - index * 60)
	);
}

function entry(folder: string, name: string, size: number, modified: number): FileEntry {
	const isDir = name.endsWith('/');
	const cleanName = isDir ? name.slice(0, -1) : name;
	const dot = cleanName.lastIndexOf('.');
	const extension = !isDir && dot > 0 ? cleanName.slice(dot + 1) : null;
	return {
		name: cleanName,
		path: joinPath(folder, cleanName),
		is_dir: isDir,
		is_file: !isDir,
		is_hidden: cleanName.startsWith('.'),
		size,
		modified,
		mime_type: extension ? mimeFor(extension) : null,
		extension
	};
}

function mimeFor(extension: string) {
	const types: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpeg',
		svg: 'image/svg+xml',
		pdf: 'application/pdf',
		md: 'text/markdown',
		txt: 'text/plain',
		mp4: 'video/mp4',
		flac: 'audio/flac'
	};
	return types[extension] ?? 'application/octet-stream';
}
