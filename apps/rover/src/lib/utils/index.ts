// Format bytes to human readable string
export function formatBytes(bytes: number, decimals = 1): string {
	if (bytes === 0) return '0 B';
	
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

// Format date from timestamp
export function formatDate(timestamp: number | null, format: 'short' | 'long' = 'short'): string {
	if (!timestamp) return '-';
	
	const date = new Date(timestamp * 1000);
	
	if (format === 'short') {
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// Get relative time (e.g., "2 hours ago")
export function relativeTime(timestamp: number | null): string {
	if (!timestamp) return '-';
	
	const now = Date.now() / 1000;
	const diff = now - timestamp;
	
	if (diff < 60) return 'Just now';
	if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
	
	return formatDate(timestamp);
}

// Get file extension
export function getExtension(filename: string): string {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot === -1 || lastDot === 0) return '';
	return filename.substring(lastDot + 1).toLowerCase();
}

// Get filename without extension
export function getBasename(filename: string): string {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot === -1 || lastDot === 0) return filename;
	return filename.substring(0, lastDot);
}

// Get parent path
export function getParentPath(path: string): string {
	const normalized = path.replace(/\/+$/, '');
	const lastSlash = normalized.lastIndexOf('/');
	if (lastSlash <= 0) return '/';
	return normalized.substring(0, lastSlash);
}

// Join paths
export function joinPath(...parts: string[]): string {
	return parts
		.map((part, i) => {
			if (i === 0) return part.replace(/\/+$/, '');
			return part.replace(/^\/+|\/+$/g, '');
		})
		.filter(Boolean)
		.join('/');
}

// Get path segments for breadcrumb
export function getPathSegments(path: string): { name: string; path: string }[] {
	const parts = path.split('/').filter(Boolean);
	const segments: { name: string; path: string }[] = [];
	
	let currentPath = '';
	for (const part of parts) {
		currentPath += '/' + part;
		segments.push({ name: part, path: currentPath });
	}
	
	return segments;
}

// Check if path is image
export function isImagePath(path: string): boolean {
	const ext = getExtension(path);
	return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif', 'heic', 'heif', 'tif', 'tiff'].includes(ext);
}

export function isPackagePath(path: string): boolean {
	const ext = getExtension(path);
	return ['appimage', 'deb', 'rpm', 'flatpak', 'snap'].includes(ext);
}

// Check if path is video
export function isVideoPath(path: string): boolean {
	const ext = getExtension(path);
	return ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'flv'].includes(ext);
}

// Check if path is audio
export function isAudioPath(path: string): boolean {
	const ext = getExtension(path);
	return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext);
}

// Check if path is text/code
export function isTextPath(path: string): boolean {
	const ext = getExtension(path);
	const textExts = [
		'txt', 'md', 'json', 'xml', 'yaml', 'yml', 'toml',
		'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html', 'svelte', 'vue',
		'py', 'rb', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp',
		'sh', 'bash', 'zsh', 'fish', 'ps1',
		'conf', 'ini', 'cfg', 'env', 'gitignore', 'dockerignore',
		'log', 'csv', 'sql'
	];
	return textExts.includes(ext);
}

// Get file icon based on extension/type
export function getFileIcon(entry: { is_dir: boolean; name: string; mime_type?: string | null }): string {
	if (entry.is_dir) return 'folder';
	
	const ext = getExtension(entry.name);
	const mime = entry.mime_type ?? '';
	
	if (isImagePath(entry.name) || mime.startsWith('image/')) return 'image';
	
	if (isVideoPath(entry.name)) return 'video';
	
	if (isAudioPath(entry.name)) return 'audio';
	
	if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) return 'archive';
	
	if (['pdf'].includes(ext)) return 'pdf';
	if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'document';
	if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return 'spreadsheet';
	if (['ppt', 'pptx', 'odp'].includes(ext)) return 'presentation';
	
	if (isPackagePath(entry.name) || isPackageMime(mime)) return 'package';
	
	if (isTextPath(entry.name)) return 'code';
	
	if (['exe', 'msi', 'run', 'bin'].includes(ext)) return 'executable';
	
	return 'file';
}

function isPackageMime(mime: string): boolean {
	return [
		'application/vnd.appimage',
		'application/x-appimage',
		'application/x-iso9660-appimage',
		'application/vnd.debian.binary-package',
		'application/x-debian-package',
		'application/x-rpm',
		'application/vnd.flatpak',
		'application/vnd.snap'
	].includes(mime);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

// Generate unique ID
export function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}

// Clamp number
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
