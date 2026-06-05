import * as api from '$lib/api';
import type { VcsFileStatus, VcsKind, VcsProject, VcsProvider } from '$lib/vcs/types';

function statusMap(statuses: Record<string, VcsFileStatus>) {
	return new Map(Object.entries(statuses));
}

function desktopProvider(kind: VcsKind): VcsProvider {
	return {
		kind,
		canSave: true,
		canSync: true,
		async detect(path) {
			const project = await api.detectVcs(path);
			return project?.kind === kind ? project : null;
		},
		getProjectStatus: api.getVcsProjectStatus,
		async getFileStatuses(root) {
			return statusMap(await api.getVcsFileStatuses(root));
		},
		getDiff: api.getVcsDiff,
		save: api.saveVcs,
		sync: api.syncVcs
	};
}

export const vcsProviders = [desktopProvider('pig'), desktopProvider('git')] as const;

export async function detectVcsProject(path: string): Promise<VcsProject | null> {
	const project = await api.detectVcs(path);
	if (!project) return null;
	return providerFor(project.kind) ? project : null;
}

export function providerFor(kind: VcsKind): VcsProvider {
	return vcsProviders.find((provider) => provider.kind === kind) ?? vcsProviders[1];
}
