import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import { absolutePath, groupChangedFiles, relativePath, statusOrder } from '$lib/vcs/format';
import { providerFor } from '$lib/vcs/provider';
import type { VcsBusyState, VcsChangedFile, VcsFileStatus, VcsProject } from '$lib/vcs/types';
import { SvelteMap } from 'svelte/reactivity';

const refreshDelay = 720;
const pollDelay = 180;

export class VcsState {
	project = $state<VcsProject | null>(null);
	statuses = new SvelteMap<string, VcsFileStatus>();
	isLoading = $state(false);
	error = $state<string | null>(null);
	panelOpen = $state(false);
	saveDialogOpen = $state(false);
	saveFiles = $state.raw<string[] | null>(null);
	diff = $state('');
	diffPath = $state<string | null>(null);
	isDiffLoading = $state(false);
	busy = $state<VcsBusyState>(null);
	lastResult = $state<string | null>(null);
	private path = '';
	private requestId = 0;
	private refreshTimer: ReturnType<typeof setTimeout> | null = null;

	get changedFiles(): VcsChangedFile[] {
		return [...this.statuses.entries()]
			.filter(([, status]) => status !== 'clean' && status !== 'ignored')
			.map(([path, status]) => ({ path, status }))
			.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || a.path.localeCompare(b.path));
	}

	get changeGroups() {
		return groupChangedFiles(this.changedFiles);
	}

	open(path: string) {
		if (!path.startsWith('/')) {
			this.clear();
			return;
		}
		this.path = path;
		this.scheduleRefresh();
	}

	clear() {
		this.path = '';
		this.requestId += 1;
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.reset();
	}

	openSaveDialog(files?: string[]) {
		this.saveFiles = files ?? null;
		this.saveDialogOpen = true;
	}

	statusFor(path: string, isDir: boolean): VcsFileStatus | null {
		if (!this.project) return null;
		const rel = relativePath(this.project.root, path);
		const exact = this.statuses.get(rel);
		if (exact && exact !== 'clean') return exact;
		if (!isDir) return null;
		return this.folderStatus(rel);
	}

	absolutePath(path: string) {
		return this.project ? absolutePath(this.project.root, path) : path;
	}

	relativePath(path: string) {
		return this.project ? relativePath(this.project.root, path) : path;
	}

	async refreshNow(path = this.path) {
		if (!path.startsWith('/') || !isDesktopRuntime()) {
			this.reset();
			return;
		}
		const requestId = ++this.requestId;
		this.isLoading = true;
		this.error = null;
		try {
			const ticket = await api.startVcsStatus(path);
			await this.pollStatus(ticket.id, requestId);
		} catch (caught) {
			if (requestId !== this.requestId) return;
			this.project = null;
			this.setStatuses();
			this.error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			if (requestId === this.requestId) this.isLoading = false;
		}
	}

	async loadDiff(path?: string) {
		if (!this.project) return;
		this.isDiffLoading = true;
		this.error = null;
		this.diffPath = path ?? null;
		try {
			const provider = providerFor(this.project.kind);
			this.diff = await provider.getDiff(this.project.root, path ? this.absolutePath(path) : undefined);
		} catch (caught) {
			this.diff = '';
			this.error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			this.isDiffLoading = false;
		}
	}

	async save(message: string, files: string[]) {
		if (!this.project) return;
		this.busy = 'save';
		this.error = null;
		try {
			const provider = providerFor(this.project.kind);
			await provider.save(this.project.root, message, files.map((path) => this.absolutePath(path)));
			this.saveDialogOpen = false;
			this.lastResult = this.project.kind === 'pig' ? 'Saved' : 'Committed';
			await this.refreshNow(this.project.root);
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			this.busy = null;
		}
	}

	async sync() {
		if (!this.project) return;
		this.busy = 'sync';
		this.error = null;
		try {
			const provider = providerFor(this.project.kind);
			await provider.sync(this.project.root);
			this.lastResult = 'Synced';
			await this.refreshNow(this.project.root);
		} catch (caught) {
			this.error = caught instanceof Error ? caught.message : String(caught);
		} finally {
			this.busy = null;
		}
	}

	private scheduleRefresh() {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = setTimeout(() => void this.refreshNow(), refreshDelay);
	}

	private async pollStatus(jobId: string, requestId: number) {
		while (true) {
			await wait(pollDelay);
			const update = await api.getVcsStatusResult(jobId);
			if (!update.done) continue;
			if (requestId !== this.requestId) return;
			if (update.error) {
				this.project = null;
				this.setStatuses();
				this.error = update.error;
				return;
			}
			if (!update.result) {
				this.reset();
				return;
			}
			this.project = update.result.project;
			this.setStatuses(Object.entries(update.result.statuses));
			this.clearStaleDiff();
			return;
		}
	}

	private reset() {
		this.project = null;
		this.setStatuses();
		this.diff = '';
		this.diffPath = null;
		this.isLoading = false;
	}

	private setStatuses(statuses?: Iterable<[string, VcsFileStatus]>) {
		this.statuses.clear();
		if (!statuses) return;
		for (const [path, status] of statuses) this.statuses.set(path, status);
	}

	private clearStaleDiff() {
		if (!this.diffPath || this.statuses.has(this.diffPath)) return;
		this.diff = '';
		this.diffPath = null;
	}

	private folderStatus(path: string) {
		const prefix = path ? `${path}/` : '';
		let best: VcsFileStatus | null = null;
		for (const [candidate, status] of this.statuses) {
			if (status === 'clean' || status === 'ignored') continue;
			if (candidate !== path && !candidate.startsWith(prefix)) continue;
			if (!best || statusOrder.indexOf(status) < statusOrder.indexOf(best)) best = status;
		}
		return best;
	}
}

function wait(ms: number) {
	return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}
