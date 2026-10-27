import { basename, isInside, parent } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { CloudConflict, Drive, FileState } from '#lib/bindings.js';

export class CloudState {
	available = $state(false);
	drives = $state.raw<Drive[]>([]);
	states = $state.raw<Record<string, FileState>>({});
	folder = $state('');

	load = async () => {
		try {
			this.drives = await commands.cloudDrives();
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

	conflictsIn(folder: string): { drive: Drive; conflict: CloudConflict }[] {
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
		const states = await commands.cloudStates({ path: folder }).catch(() => null);
		if (states && folder === this.folder) this.states = states;
	}
}
