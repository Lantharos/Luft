import * as api from '#lib/api.js';
import { isDesktopRuntime } from '#lib/runtime.js';
import { errorMessage } from '#lib/utils/format.js';
import { absolutePath, relativePath } from '#lib/utils/paths.js';
import { groupChangedFiles, statusOrder } from './format';
import type { VcsBusyState, VcsChangedFile, VcsFileStatus, VcsProject, VcsStatusEvent } from './types';

const REFRESH_DELAY_MS = 720;

type StatusResult = Pick<VcsStatusEvent, 'project' | 'statuses' | 'error'>;

export class VcsState {
	project = $state.raw<VcsProject | null>(null);
	statuses = $state.raw(new Map<string, VcsFileStatus>());
	error = $state<string | null>(null);
	panelOpen = $state(false);
	saveDialogOpen = $state(false);
	saveFiles = $state.raw<string[] | null>(null);
	diff = $state('');
	diffPath = $state<string | null>(null);
	isDiffLoading = $state(false);
	busy = $state<VcsBusyState>(null);
	lastResult = $state<string | null>(null);

	changedFiles = $derived(changedFiles(this.statuses));
	changeGroups = $derived(groupChangedFiles(this.changedFiles));
	folderStatuses = $derived(folderStatuses(this.changedFiles));

	#path = '';
	#generation = 0;
	#refreshTimer: ReturnType<typeof setTimeout> | undefined;
	#waiting = new Map<string, (result: StatusResult) => void>();
	#arrived = new Map<string, StatusResult>();

	open = async (path: string) => {
		this.#path = path;
		if (!isDesktopRuntime()) return;
		const root = await api.vcsRoot(path).catch(() => null);
		if (this.#path !== path) return;
		if (!root) return this.clear();
		if (this.project?.root !== root.root) this.#schedule(root.root);
	};

	clear = () => {
		this.#path = '';
		this.#generation += 1;
		clearTimeout(this.#refreshTimer);
		this.project = null;
		this.statuses = new Map();
		this.diff = '';
		this.diffPath = null;
	};

	refresh = () => {
		if (this.project) this.#schedule(this.project.root);
		else if (this.#path) void this.open(this.#path);
	};

	receive = (event: VcsStatusEvent) => {
		const resolve = this.#waiting.get(event.id);
		if (!resolve) return void this.#arrived.set(event.id, event);
		this.#waiting.delete(event.id);
		resolve(event);
	};

	statusFor = (path: string, isDir: boolean): VcsFileStatus | null => {
		if (!this.project) return null;
		const relative = relativePath(this.project.root, path);
		return this.statuses.get(relative) ?? (isDir ? (this.folderStatuses.get(relative) ?? null) : null);
	};

	relativePath = (path: string) => (this.project ? relativePath(this.project.root, path) : path);

	openSaveDialog = (files: string[] | null = null) => {
		this.saveFiles = files;
		this.saveDialogOpen = true;
	};

	loadDiff = async (path: string | null = null) => {
		if (!this.project) return;
		this.isDiffLoading = true;
		this.error = null;
		this.diffPath = path;
		try {
			this.diff = await api.vcsDiff(this.project.root, path && absolutePath(this.project.root, path));
		} catch (caught) {
			this.diff = '';
			this.error = errorMessage(caught);
		} finally {
			this.isDiffLoading = false;
		}
	};

	save = async (message: string, files: string[]) => {
		const project = this.project;
		if (!project) return;
		await this.#run('save', async () => {
			await api.saveVcs(project.root, message, files.map((path) => absolutePath(project.root, path)));
			this.saveDialogOpen = false;
			this.lastResult = project.kind === 'pig' ? 'Saved' : 'Committed';
		});
	};

	sync = async () => {
		const project = this.project;
		if (!project) return;
		await this.#run('sync', async () => {
			await api.syncVcs(project.root);
			this.lastResult = 'Synced';
		});
	};

	async #run(state: Exclude<VcsBusyState, null>, action: () => Promise<void>) {
		this.busy = state;
		this.error = null;
		try {
			await action();
			if (this.project) await this.#load(this.project.root);
		} catch (caught) {
			this.error = errorMessage(caught);
		} finally {
			this.busy = null;
		}
	}

	#schedule(root: string) {
		clearTimeout(this.#refreshTimer);
		this.#refreshTimer = setTimeout(() => void this.#load(root), REFRESH_DELAY_MS);
	}

	async #load(root: string) {
		const generation = ++this.#generation;
		const id = await api.startVcsStatus(root).catch(() => null);
		if (!id) return;
		const result = this.#arrived.get(id) ?? (await new Promise<StatusResult>((resolve) => this.#waiting.set(id, resolve)));
		this.#arrived.delete(id);
		if (generation !== this.#generation) return;
		this.error = result.error;
		this.project = result.project;
		this.statuses = new Map(Object.entries(result.statuses ?? {}));
		if (this.diffPath && !this.statuses.has(this.diffPath)) {
			this.diff = '';
			this.diffPath = null;
		}
	}
}

function changedFiles(statuses: Map<string, VcsFileStatus>): VcsChangedFile[] {
	return [...statuses]
		.filter(([, status]) => status !== 'ignored')
		.map(([path, status]) => ({ path, status }))
		.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) || a.path.localeCompare(b.path));
}

function folderStatuses(files: VcsChangedFile[]) {
	const folders = new Map<string, VcsFileStatus>();
	for (const { path, status } of files) {
		for (let slash = path.lastIndexOf('/'); slash > 0; slash = path.lastIndexOf('/', slash - 1)) {
			const folder = path.slice(0, slash);
			const current = folders.get(folder);
			if (!current || statusOrder.indexOf(status) < statusOrder.indexOf(current)) folders.set(folder, status);
		}
	}
	return folders;
}
