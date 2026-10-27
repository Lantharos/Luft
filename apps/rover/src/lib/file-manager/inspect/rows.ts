import { bytes, dateTime, formatClock, parent, plural } from '@luft/ui';
import type { FileDetails, FileEntry } from '#lib/bindings.js';
import { statusLabel } from '#lib/vcs/format.js';
import type { VcsState } from '#lib/vcs/state.svelte.js';
import type { MediaInfo } from './details.svelte';

export type DetailRow = { label: string; value: string; action?: () => void };

type RowSources = {
	entry: FileEntry;
	details: FileDetails | null;
	media: MediaInfo | null;
	vcs: VcsState;
	home: string;
	reveal: (entry: FileEntry) => void;
};

export function tildePath(path: string, home: string) {
	if (path === home) return '~';
	return path.startsWith(`${home}/`) ? `~${path.slice(home.length)}` : path;
}

export function detailRows({ entry, details, media, vcs, home, reveal }: RowSources): DetailRow[] {
	const rows: (DetailRow | null)[] = [
		entry.isDir
			? details?.itemCount != null
				? { label: 'Contains', value: plural(details.itemCount, 'item') }
				: null
			: { label: 'Size', value: bytes(entry.size) },
		dimensions(details, media),
		media?.duration ? { label: 'Duration', value: formatClock(media.duration) } : null,
		details?.created ? { label: 'Created', value: dateTime(details.created) } : null,
		entry.modified ? { label: 'Modified', value: dateTime(entry.modified) } : null,
		{ label: 'Where', value: tildePath(parent(entry.path), home), action: () => reveal(entry) },
		details?.linkTarget ? { label: 'Points to', value: details.linkTarget } : null,
		versionControl(entry, vcs)
	];
	return rows.filter((row): row is DetailRow => row !== null);
}

function dimensions(details: FileDetails | null, media: MediaInfo | null): DetailRow | null {
	const [width, height] = details?.dimensions ?? [media?.width, media?.height];
	return width && height ? { label: 'Dimensions', value: `${width} × ${height}` } : null;
}

function versionControl(entry: FileEntry, vcs: VcsState): DetailRow | null {
	const project = vcs.project;
	if (!project) return null;
	const status = vcs.statusFor(entry.path, entry.isDir);
	const state = status && status !== 'ignored' ? statusLabel(status) : status === 'ignored' ? 'Ignored' : 'Unchanged';
	const where = project.branch ? ` on ${project.branch}` : '';
	return { label: 'Git', value: `${state}${where}` };
}
