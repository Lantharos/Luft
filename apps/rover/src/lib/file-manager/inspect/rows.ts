import { formatClock } from '@luft/ui';
import type { FileEntry } from '$lib/types';
import type { FileDetails } from '$lib/types/details';
import { formatBytes, formatFullDate, plural } from '$lib/utils/format';
import { parentPath } from '$lib/utils/paths';
import { statusLabel } from '$lib/vcs/format';
import type { VcsState } from '$lib/vcs/state.svelte';
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
		entry.is_dir
			? details?.itemCount != null
				? { label: 'Contains', value: plural(details.itemCount, 'item') }
				: null
			: { label: 'Size', value: formatBytes(entry.size) },
		dimensions(details, media),
		media?.duration ? { label: 'Duration', value: formatClock(media.duration) } : null,
		details?.created ? { label: 'Created', value: formatFullDate(details.created) } : null,
		entry.modified ? { label: 'Modified', value: formatFullDate(entry.modified) } : null,
		{ label: 'Where', value: tildePath(parentPath(entry.path), home), action: () => reveal(entry) },
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
	const status = vcs.statusFor(entry.path, entry.is_dir);
	const state = status && status !== 'ignored' ? statusLabel(status) : status === 'ignored' ? 'Ignored' : 'Unchanged';
	const where = project.branchOrWorkspace ? ` on ${project.branchOrWorkspace}` : '';
	return { label: project.kind === 'pig' ? 'Pig' : 'Git', value: `${state}${where}` };
}
