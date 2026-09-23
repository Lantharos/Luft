import type { VcsChangedFile, VcsFileStatus, VcsProject } from '$lib/vcs/types';

export const statusOrder: VcsFileStatus[] = [
	'conflicted',
	'deleted',
	'added',
	'untracked',
	'renamed',
	'modified',
	'ignored',
	'clean'
];

export function vcsKindLabel(kind: VcsProject['kind']) {
	return kind === 'pig' ? 'Pig' : 'Git';
}

export function primaryActionLabel(project: VcsProject | null) {
	return project?.kind === 'pig' ? 'Save' : 'Commit';
}

export function projectTypeLabel(project: VcsProject) {
	return project.kind === 'pig' ? 'Pig project' : 'Git repository';
}

export function workspaceLabel(project: VcsProject) {
	return project.kind === 'pig' ? 'Workspace' : 'Branch';
}

export function statusLabel(status: VcsFileStatus) {
	switch (status) {
		case 'added':
			return 'Added';
		case 'deleted':
			return 'Deleted';
		case 'renamed':
			return 'Renamed';
		case 'untracked':
			return 'Untracked';
		case 'ignored':
			return 'Ignored';
		case 'conflicted':
			return 'Conflicted';
		case 'clean':
			return 'Clean';
		default:
			return 'Modified';
	}
}

export function statusMarker(status: VcsFileStatus) {
	switch (status) {
		case 'added':
			return 'A';
		case 'deleted':
			return 'D';
		case 'renamed':
			return 'R';
		case 'untracked':
			return '?';
		case 'ignored':
			return 'I';
		case 'conflicted':
			return '!';
		case 'clean':
			return '';
		default:
			return 'M';
	}
}

export function projectSummary(project: VcsProject | null) {
	if (!project) return '';
	const name = vcsKindLabel(project.kind);
	const ref = project.branchOrWorkspace ? ` · ${project.branchOrWorkspace}` : '';
	const changes = project.changedCount === 1 ? '1 changed' : `${project.changedCount} changed`;
	const sync =
		project.kind === 'git' && project.ahead
			? ` · ahead ${project.ahead}`
			: project.kind === 'git' && project.behind
				? ` · behind ${project.behind}`
				: '';
	return `${name}${ref} · ${changes}${sync}`;
}

export function groupChangedFiles(files: VcsChangedFile[]) {
	return statusOrder
		.map((status) => ({
			status,
			label: statusLabel(status),
			files: files.filter((file) => file.status === status)
		}))
		.filter((group) => group.files.length > 0);
}

export function relativePath(root: string, path: string) {
	const normalizedRoot = root.replace(/\/$/, '');
	return path.startsWith(`${normalizedRoot}/`) ? path.slice(normalizedRoot.length + 1) : path;
}

export function absolutePath(root: string, path: string) {
	if (path.startsWith('/')) return path;
	return `${root.replace(/\/$/, '')}/${path}`;
}
