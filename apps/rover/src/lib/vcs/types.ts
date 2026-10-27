import type { VcsFileStatus } from '#lib/bindings.js';

export interface VcsChangedFile {
	path: string;
	status: VcsFileStatus;
}

export type VcsBusyState = 'save' | 'sync' | null;
