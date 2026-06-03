import type { DriveInfo, FileEntry, TrashItem, UserDirs } from '$lib/types';

const now = Math.floor(Date.now() / 1000);
const previewImageThumbnail = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
	<rect width="96" height="96" rx="18" fill="#252522"/>
	<path d="M14 66 36 42l16 16 11-12 19 20v14H14Z" fill="#9fb7b5"/>
	<path d="M14 72 42 54l18 16 22-14v24H14Z" fill="#c8b66f" opacity=".75"/>
	<circle cx="66" cy="30" r="10" fill="#f3f3ef" opacity=".75"/>
</svg>
`)}`;

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
		device: '/dev/nvme0n1p3',
		fs_type: 'btrfs',
		total_space: 1024 ** 4,
		available_space: 412 * 1024 ** 3,
		used_space: 612 * 1024 ** 3,
		is_removable: false,
		is_readonly: false
	},
	{
		name: 'Archive',
		mount_point: '/mnt/archive',
		device: '/dev/sda1',
		fs_type: 'ext4',
		total_space: 2 * 1024 ** 4,
		available_space: 1.3 * 1024 ** 4,
		used_space: 0.7 * 1024 ** 4,
		is_removable: false,
		is_readonly: false
	}
];

export const previewTrash: TrashItem[] = [
	{
		id: '/home/kristof/.local/share/Trash/files/old-notes.txt',
		name: 'old-notes.txt',
		original_path: '/home/kristof/Documents/old-notes.txt',
		trash_path: '/home/kristof/.local/share/Trash',
		trash_name: 'Home',
		deleted_at: now - 86400,
		size: 12_480,
		is_dir: false
	}
];

export function previewEntries(path: string): FileEntry[] {
	const items = path.endsWith('/Downloads')
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

	return items;
}

export function previewThumbnails(entries: FileEntry[]) {
	return Object.fromEntries(
		entries.filter((item) => item.name === 'wireframe.png').map((item) => [item.path, previewImageThumbnail])
	);
}

function entry(path: string, name: string, isDir: boolean, size: number, extension: string | null, modified: number): FileEntry {
	const fullPath = `${path.replace(/\/$/, '')}/${name}`;

	return {
		name,
		path: fullPath,
		is_dir: isDir,
		is_file: !isDir,
		is_symlink: false,
		is_hidden: name.startsWith('.'),
		size,
		modified,
		created: modified - 3600,
		accessed: modified,
		mime_type: extension ? mimeFor(extension) : null,
		extension,
		permissions: isDir ? 0o755 : 0o644,
		uid: 1000,
		gid: 1000
	};
}

function mimeFor(extension: string) {
	if (extension === 'png') return 'image/png';
	if (extension === 'pdf') return 'application/pdf';
	if (extension === 'md') return 'text/markdown';
	return 'application/octet-stream';
}
