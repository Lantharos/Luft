import { t } from '@luft/i18n';
import { bytes, dateTime, formatClock, parent } from '@luft/ui';
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
				? { label: t('rover-details-contains'), value: t('rover-details-items', { count: details.itemCount }) }
				: null
			: { label: t('rover-details-size'), value: bytes(entry.size) },
		dimensions(details, media),
		media?.duration ? { label: t('rover-details-duration'), value: formatClock(media.duration) } : null,
		details?.created ? { label: t('rover-properties-created'), value: dateTime(details.created) } : null,
		entry.modified ? { label: t('rover-properties-modified'), value: dateTime(entry.modified) } : null,
		{ label: t('rover-details-where'), value: tildePath(parent(entry.path), home), action: () => reveal(entry) },
		details?.linkTarget ? { label: t('rover-properties-points-to'), value: details.linkTarget } : null,
		versionControl(entry, vcs)
	];
	return rows.filter((row): row is DetailRow => row !== null);
}

function dimensions(details: FileDetails | null, media: MediaInfo | null): DetailRow | null {
	const [width, height] = details?.dimensions ?? [media?.width, media?.height];
	return width && height ? { label: t('rover-properties-dimensions'), value: t('rover-details-dimensions', { width: String(width), height: String(height) }) } : null;
}

function versionControl(entry: FileEntry, vcs: VcsState): DetailRow | null {
	const project = vcs.project;
	if (!project) return null;
	const status = vcs.statusFor(entry.path, entry.isDir);
	const state = status ? statusLabel(status) : t('rover-vcs-status-unchanged');
	return { label: 'Git', value: project.branch ? t('rover-details-git-branch', { state, branch: project.branch }) : state };

}
