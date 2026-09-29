import type { FileEntry } from '$lib/types';

export type EntryIconName = 'folder' | 'file' | 'image' | 'video' | 'music' | 'archive' | 'code' | 'file-text' | 'package';

const EXTENSION_ICONS: Record<EntryIconName, string[]> = {
	folder: [],
	file: [],
	image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif', 'heic', 'heif', 'tif', 'tiff'],
	video: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'flv'],
	music: ['mp3', 'wav', 'ogg', 'oga', 'flac', 'aac', 'm4a', 'm4b', 'wma', 'opus', 'weba'],
	archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'zst'],
	'file-text': ['pdf', 'doc', 'docx', 'odt', 'rtf', 'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp'],
	package: ['appimage', 'deb', 'rpm', 'flatpak', 'snap'],
	code: [
		'txt', 'md', 'json', 'xml', 'yaml', 'yml', 'toml', 'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html', 'svelte', 'vue',
		'py', 'rb', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'conf', 'ini', 'cfg',
		'env', 'gitignore', 'dockerignore', 'log', 'sql', 'exe', 'msi', 'run', 'bin'
	]
};

const ICON_BY_EXTENSION = new Map(
	Object.entries(EXTENSION_ICONS).flatMap(([icon, extensions]) => extensions.map((extension) => [extension, icon as EntryIconName]))
);

const TRANSPARENT_EXTENSIONS = new Set(['png', 'apng', 'svg', 'gif', 'webp', 'ico', 'avif', 'ttf', 'otf', 'ttc', 'woff', 'woff2', 'pfb']);

const PACKAGE_MIME_TYPES = new Set([
	'application/vnd.appimage',
	'application/x-appimage',
	'application/x-iso9660-appimage',
	'application/vnd.debian.binary-package',
	'application/x-debian-package',
	'application/x-rpm',
	'application/vnd.flatpak',
	'application/vnd.snap'
]);

function extensionOf(name: string) {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function isImage(entry: Pick<FileEntry, 'name' | 'mime_type'>) {
	return entry.mime_type?.startsWith('image/') || ICON_BY_EXTENSION.get(extensionOf(entry.name)) === 'image';
}

export function mayBeTransparent(entry: Pick<FileEntry, 'name' | 'mime_type'>) {
	return Boolean(entry.mime_type?.startsWith('font/')) || TRANSPARENT_EXTENSIONS.has(extensionOf(entry.name));
}

export function entryIcon(entry: Pick<FileEntry, 'name' | 'is_dir' | 'mime_type'>): EntryIconName {
	if (entry.is_dir) return 'folder';
	if (isImage(entry)) return 'image';
	if (entry.mime_type && PACKAGE_MIME_TYPES.has(entry.mime_type)) return 'package';
	return ICON_BY_EXTENSION.get(extensionOf(entry.name)) ?? 'file';
}
