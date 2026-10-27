import { isInside } from '@luft/ui';
import { SvelteSet } from 'svelte/reactivity';
import * as api from '#lib/bridge/index.js';
import type { DriveInfo, WindowsDrive } from '#lib/types/index.js';

export class DrivesState {
	list = $state.raw<DriveInfo[]>([]);
	windows = $state.raw<WindowsDrive[]>([]);
	readonly ejecting = new SvelteSet<string>();
	readonly opening = new SvelteSet<string>();
	readonly understood = new SvelteSet<string>();
	manageable = $state(false);

	ordered = $derived(this.list.toSorted((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)));

	load = async () => {
		const [list, windows] = await Promise.all([api.listDrives().catch(() => this.list), api.listWindows().catch(() => [])]);
		this.list = list;
		this.windows = windows;
	};

	open = async (drive: WindowsDrive, readOnly: boolean) => {
		this.opening.add(drive.device);
		try {
			return await api.openWindows(drive.device, readOnly);
		} finally {
			this.opening.delete(drive.device);
			await this.load();
		}
	};

	eject = async (drive: DriveInfo) => {
		if (this.ejecting.has(drive.mountPoint)) return;
		this.ejecting.add(drive.mountPoint);
		try {
			await api.ejectDrive(drive.mountPoint);
		} finally {
			this.ejecting.delete(drive.mountPoint);
			await this.load();
		}
	};

	containing(path: string) {
		return this.list
			.filter((drive) => drive.mountPoint !== '/' && isInside(path, drive.mountPoint))
			.sort((a, b) => b.mountPoint.length - a.mountPoint.length)[0];
	}

	holding(path: string) {
		return this.containing(path) ?? this.list.find((drive) => drive.mountPoint === '/');
	}

	isMounted(drive: DriveInfo) {
		return this.list.some((candidate) => candidate.mountPoint === drive.mountPoint);
	}
}

function rank(drive: DriveInfo) {
	if (drive.mountPoint === '/') return 0;
	return drive.isRemovable ? 2 : 1;
}
