import { t } from '@luft/i18n';
import type { VcsFileStatus, VcsProject } from '#lib/bindings.js';
import type { VcsChangedFile } from './types';

export const statusOrder: VcsFileStatus[] = ['conflicted', 'deleted', 'added', 'untracked', 'renamed', 'modified', 'ignored'];

const STATUS_LABELS: Record<VcsFileStatus, string> = {
	conflicted: 'rover-vcs-status-conflicted',
	deleted: 'rover-vcs-status-deleted',
	added: 'rover-vcs-status-added',
	untracked: 'rover-vcs-status-untracked',
	renamed: 'rover-vcs-status-renamed',
	modified: 'rover-vcs-status-modified',
	ignored: 'rover-vcs-status-ignored'
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

export const statusLabel = (status: VcsFileStatus) => t(STATUS_LABELS[status]);
export const statusMarker = (status: VcsFileStatus) => STATUS_MARKERS[status];

export function projectSummary(project: VcsProject | null) {
	if (!project) return '';
	const parts = ['Git'];
	if (project.branch) parts.push(project.branch);
	parts.push(t('rover-vcs-summary-changed', { count: project.changedCount }));
	if (project.ahead) parts.push(t('rover-vcs-summary-ahead', { count: project.ahead }));
	else if (project.behind) parts.push(t('rover-vcs-summary-behind', { count: project.behind }));

	return parts.join(' · ');
}

export function groupChangedFiles(files: VcsChangedFile[]) {
	return statusOrder
		.map((status) => ({ status, label: statusLabel(status), files: files.filter((file) => file.status === status) }))
		.filter((group) => group.files.length > 0);
}
