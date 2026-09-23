export type VcsKind = 'git' | 'pig';

export interface VcsProject {
	root: string;
	kind: VcsKind;
	branchOrWorkspace?: string;
	remoteName?: string;
	clean: boolean;
	ahead?: number;
	behind?: number;
	changedCount: number;
	addedCount: number;
	deletedCount: number;
	conflictedCount: number;
}

export type VcsFileStatus =
	| 'clean'
	| 'modified'
	| 'added'
	| 'deleted'
	| 'renamed'
	| 'untracked'
	| 'ignored'
	| 'conflicted';

export interface VcsProvider {
	kind: VcsKind;
	detect(path: string): Promise<VcsProject | null>;
	getProjectStatus(root: string): Promise<VcsProject>;
	getFileStatuses(root: string): Promise<Map<string, VcsFileStatus>>;
	getDiff(root: string, filePath?: string): Promise<string>;
	save(root: string, message: string, files?: string[]): Promise<void>;
	sync(root: string): Promise<void>;
	canSave: boolean;
	canSync: boolean;
}

export interface VcsChangedFile {
	path: string;
	status: VcsFileStatus;
}

export interface VcsStatusSnapshot {
	project: VcsProject;
	statuses: Record<string, VcsFileStatus>;
}

export interface VcsJobTicket {
	id: string;
}

export interface VcsJobUpdate {
	done: boolean;
	result?: VcsStatusSnapshot | null;
	error?: string | null;
}

export type VcsBusyState = 'save' | 'sync' | null;
