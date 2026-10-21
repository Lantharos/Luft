import { basename, isInside, parent } from '@luft/ui';
import * as api from '#lib/api.js';
import type { CloudConflict, CloudDrive, FileState } from '#lib/types/cloud.js';

export class CloudState {
	available = $state(false);
	drives = $state.raw<CloudDrive[]>([]);
	states = $state.raw<Record<string, FileState>>({});
	folder = $state('');

	load = async () => {
		try {
			this.drives = await api.cloudDrives();
			this.available = true;
		} catch {
			this.available = false;
			this.drives = [];
		}
		await this.#refreshStates();
	};

	follow = (folder: string) => {
		if (folder !== this.folder) this.states = {};
		this.folder = folder;
		void this.#refreshStates();
	};

	holding(path: string) {
		return this.drives.find((drive) => isInside(path, drive.path));
	}

	stateOf(path: string): FileState | undefined {
		return parent(path) === this.folder ? this.states[basename(path)] : undefined;
	}

	conflictsIn(folder: string): { drive: CloudDrive; conflict: CloudConflict }[] {
		const drive = this.holding(folder);
		if (!drive) return [];
		return drive.conflicts
			.filter((conflict) => parent(`${drive.path}/${conflict.copy}`) === folder)
			.map((conflict) => ({ drive, conflict }));
	}

	onlineOnly = (path: string) => Boolean(this.holding(path)) && this.stateOf(path) !== 'local';

	unreachable(path: string) {
		const drive = this.holding(path);
		return Boolean(drive && drive.state !== 'ready' && this.stateOf(path) === 'online');
	}

	async #refreshStates() {
		const folder = this.folder;
		if (!folder || !this.holding(folder)) return;
		const states = await api.cloudStates(folder).catch(() => null);
		if (states && folder === this.folder) this.states = states;
	}
}
