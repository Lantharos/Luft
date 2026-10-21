import type { FileEntry } from '#lib/types/index.js';

export type FileKind = 'folder' | 'file' | 'image' | 'video' | 'audio' | 'archive' | 'document' | 'package' | 'code';
export type PreviewKind = 'folder' | 'image' | 'video' | 'audio' | 'markdown' | 'text' | 'pdf' | 'none';

type KindSource = Pick<FileEntry, 'isDir' | 'mimeType'>;
type LabelSource = KindSource & Pick<FileEntry, 'extension'>;

const APP_BUNDLES = new Set(['application/vnd.appimage', 'application/x-iso9660-appimage', 'application/vnd.flatpak', 'application/vnd.flatpak.ref']);

const PACKAGES = new Set([
	...APP_BUNDLES,
	'application/vnd.debian.binary-package',
	'application/x-deb',
	'application/x-rpm',
	'application/vnd.snap',
	'application/x-msi'
]);

const ARCHIVES = new Set([
	'application/zip',
	'application/vnd.rar',
	'application/x-7z-compressed',
	'application/x-tar',
	'application/gzip',
	'application/x-bzip2',
	'application/x-xz',
	'application/zstd',
	'application/x-compressed-tar',
	'application/x-bzip2-compressed-tar',
	'application/x-xz-compressed-tar',
	'application/x-zstd-compressed-tar'
]);

const DOCUMENT_PREFIXES = ['application/vnd.oasis.opendocument.', 'application/vnd.openxmlformats-officedocument.', 'application/vnd.ms-'];
const DOCUMENTS = new Set(['application/pdf', 'application/msword', 'application/rtf', 'application/epub+zip', 'text/csv', 'text/tab-separated-values']);

const TEXT_APPLICATIONS = new Set([
	'application/json',
	'application/xml',
	'application/yaml',
	'application/toml',
	'application/sql',
	'application/x-desktop',
	'application/x-ruby',
	'application/x-php',
	'application/x-perl',
	'application/x-fishscript',
	'application/x-powershell',
	'application/x-subrip',
	'application/vnd.dart'
]);

const TRANSPARENT_IMAGES = new Set([
	'image/png',
	'image/apng',
	'image/svg+xml',
	'image/gif',
	'image/webp',
	'image/vnd.microsoft.icon',
	'image/avif',
	'application/x-font-type1'
]);

const PREVIEWS: Partial<Record<PreviewKind, string[]>> = {
	image: ['image/jpeg', 'image/png', 'image/apng', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/vnd.microsoft.icon', 'image/avif'],
	video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/matroska'],
	audio: ['audio/mpeg', 'audio/vnd.wave', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/webm'],
	markdown: ['text/markdown'],
	pdf: ['application/pdf']
};

const PREVIEW_BY_MIME = new Map(Object.entries(PREVIEWS).flatMap(([kind, types]) => types.map((type) => [type, kind as PreviewKind])));

const NAMED_KINDS: Record<string, string> = {
	md: 'Markdown',
	txt: 'Plain text',
	pdf: 'PDF document',
	json: 'JSON',
	ts: 'TypeScript',
	js: 'JavaScript',
	rs: 'Rust source',
	py: 'Python script',
	sh: 'Shell script',
	html: 'Web page',
	css: 'Stylesheet',
	svelte: 'Svelte component',
	svg: 'SVG image',
	appimage: 'AppImage'
};

const CATEGORY_LABELS: Partial<Record<FileKind, string>> = {
	image: 'image',
	video: 'video',
	audio: 'audio',
	archive: 'archive',
	document: 'document',
	package: 'package'
};

function isText(mime: string) {
	return mime.startsWith('text/') || TEXT_APPLICATIONS.has(mime) || mime.endsWith('+json') || mime.endsWith('+xml');
}

function isDocument(mime: string) {
	return DOCUMENTS.has(mime) || DOCUMENT_PREFIXES.some((prefix) => mime.startsWith(prefix));
}

export function fileKind({ isDir, mimeType }: KindSource): FileKind {
	if (isDir) return 'folder';
	if (!mimeType) return 'file';
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	if (PACKAGES.has(mimeType)) return 'package';
	if (ARCHIVES.has(mimeType)) return 'archive';
	if (isDocument(mimeType)) return 'document';
	if (isText(mimeType)) return 'code';
	return 'file';
}

export function previewKind({ isDir, mimeType }: KindSource): PreviewKind {
	if (isDir) return 'folder';
	if (!mimeType) return 'none';
	return PREVIEW_BY_MIME.get(mimeType) ?? (isText(mimeType) ? 'text' : 'none');
}

export function isImage(entry: KindSource) {
	return fileKind(entry) === 'image';
}

export function mayBeTransparent({ mimeType }: KindSource) {
	return Boolean(mimeType && (mimeType.startsWith('font/') || TRANSPARENT_IMAGES.has(mimeType)));
}

export function isAppBundle({ mimeType }: KindSource) {
	return Boolean(mimeType && APP_BUNDLES.has(mimeType));
}

export function kindLabel(entry: LabelSource) {
	if (entry.isDir) return 'Folder';
	const extension = (entry.extension ?? '').toLowerCase();
	const named = NAMED_KINDS[extension];
	if (named) return named;
	const category = CATEGORY_LABELS[fileKind(entry)];
	const label = extension.toUpperCase();
	if (category) return label ? `${label} ${category}` : category[0].toUpperCase() + category.slice(1);
	return label ? `${label} file` : 'File';
}
