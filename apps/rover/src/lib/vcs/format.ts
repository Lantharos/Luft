import type { VcsFileStatus, VcsProject } from '#lib/bindings.js';
import type { VcsChangedFile } from './types';

export const statusOrder: VcsFileStatus[] = ['conflicted', 'deleted', 'added', 'untracked', 'renamed', 'modified', 'ignored'];

const STATUS_LABELS: Record<VcsFileStatus, string> = {
	conflicted: 'Conflicted',
	deleted: 'Deleted',
	added: 'Added',
	untracked: 'Untracked',
	renamed: 'Renamed',
	modified: 'Modified',
	ignored: 'Ignored'
};

const STATUS_MARKERS: Record<VcsFileStatus, string> = {
	conflicted: '!',
	deleted: 'D',
	added: 'A',
	untracked: '?',
	renamed: 'R',
	modified: 'M',
	ignored: 'I'
};

export const statusLabel = (status: VcsFileStatus) => STATUS_LABELS[status];
export const statusMarker = (status: VcsFileStatus) => STATUS_MARKERS[status];

export function projectSummary(project: VcsProject | null) {
	if (!project) return '';
	const parts = ['Git'];
	if (project.branch) parts.push(project.branch);
	parts.push(`${project.changedCount} changed`);
	if (project.ahead) parts.push(`ahead ${project.ahead}`);
	else if (project.behind) parts.push(`behind ${project.behind}`);
	return parts.join(' · ');
}

export function groupChangedFiles(files: VcsChangedFile[]) {
	return statusOrder
		.map((status) => ({ status, label: statusLabel(status), files: files.filter((file) => file.status === status) }))
		.filter((group) => group.files.length > 0);
}
