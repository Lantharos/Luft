import type { FileEntry } from '#lib/types/index.js';
import { entryIcon } from './file-kinds';

export type PreviewKind = 'folder' | 'image' | 'video' | 'audio' | 'markdown' | 'text' | 'pdf' | 'none';

type KindSource = Pick<FileEntry, 'name' | 'is_dir' | 'mime_type' | 'extension'>;

const PREVIEWS: Partial<Record<PreviewKind, string[]>> = {
	image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif'],
	video: ['mp4', 'm4v', 'webm', 'mov', 'ogv', 'mkv'],
	audio: ['mp3', 'wav', 'ogg', 'oga', 'flac', 'aac', 'm4a', 'opus', 'weba'],
	markdown: ['md', 'markdown', 'mdx'],
	pdf: ['pdf'],
	text: [
		'txt', 'log', 'csv', 'tsv', 'json', 'jsonc', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf', 'cfg', 'env', 'properties',
		'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'jsx', 'tsx', 'css', 'scss', 'sass', 'less', 'html', 'htm', 'svelte', 'vue',
		'py', 'rb', 'rs', 'go', 'java', 'kt', 'c', 'h', 'cpp', 'hpp', 'cc', 'cs', 'swift', 'sh', 'bash', 'zsh', 'fish', 'ps1',
		'sql', 'lua', 'php', 'pl', 'r', 'dart', 'zig', 'nix', 'cmake', 'gradle', 'proto', 'graphql', 'tex', 'bib', 'srt',
		'vtt', 'patch', 'diff', 'service', 'desktop', 'lock', 'gitignore', 'dockerignore', 'editorconfig'
	]
};

const PREVIEW_BY_EXTENSION = new Map(
	Object.entries(PREVIEWS).flatMap(([kind, extensions]) => extensions.map((extension) => [extension, kind as PreviewKind]))
);

const PLAIN_TEXT_NAMES = new Set(['readme', 'license', 'copying', 'authors', 'changelog', 'makefile', 'dockerfile', 'containerfile']);

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

const CATEGORY_KINDS: Partial<Record<ReturnType<typeof entryIcon>, string>> = {
	image: 'image',
	video: 'video',
	music: 'audio',
	archive: 'archive',
	'file-text': 'document',
	package: 'package'
};

function extensionOf(entry: KindSource) {
	return (entry.extension ?? '').toLowerCase();
}

export function previewKind(entry: KindSource): PreviewKind {
	if (entry.is_dir) return 'folder';
	const byExtension = PREVIEW_BY_EXTENSION.get(extensionOf(entry));
	if (byExtension) return byExtension;
	const mime = entry.mime_type ?? '';
	if (mime.startsWith('text/') || PLAIN_TEXT_NAMES.has(entry.name.toLowerCase())) return 'text';
	return 'none';
}

export function kindLabel(entry: KindSource) {
	if (entry.is_dir) return 'Folder';
	const extension = extensionOf(entry);
	const named = NAMED_KINDS[extension];
	if (named) return named;
	const category = CATEGORY_KINDS[entryIcon(entry)];
	const label = extension.toUpperCase();
	if (category) return label ? `${label} ${category}` : category[0].toUpperCase() + category.slice(1);
	return label ? `${label} file` : 'File';
}
