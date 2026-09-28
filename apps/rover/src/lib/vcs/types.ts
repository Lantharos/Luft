export type VcsKind = 'git' | 'pig';

export interface VcsRoot {
	root: string;
	kind: VcsKind;
}

export interface VcsProject extends VcsRoot {
	branchOrWorkspace: string | null;
	ahead: number | null;
	behind: number | null;
	changedCount: number;
	addedCount: number;
	deletedCount: number;
	conflictedCount: number;
}

export type VcsFileStatus = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'ignored' | 'conflicted';

export interface VcsChangedFile {
	path: string;
	status: VcsFileStatus;
}

export interface VcsStatusEvent {
	id: string;
	project: VcsProject | null;
	statuses: Record<string, VcsFileStatus> | null;
	error: string | null;
}

export type VcsBusyState = 'save' | 'sync' | null;
