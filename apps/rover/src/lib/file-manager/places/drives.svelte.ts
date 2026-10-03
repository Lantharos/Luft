import { SvelteSet } from 'svelte/reactivity';
import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import type { DriveInfo } from '$lib/types';
import { isInside } from '$lib/utils/paths';

export class DrivesState {
	list = $state.raw<DriveInfo[]>([]);
	readonly ejecting = new SvelteSet<string>();
	manageable = $state(false);

	ordered = $derived(this.list.toSorted((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)));

	load = async () => {
		if (!isDesktopRuntime()) return;
		this.list = await api.listDrives().catch(() => this.list);
	};

	eject = async (drive: DriveInfo) => {
		if (this.ejecting.has(drive.mount_point)) return;
		this.ejecting.add(drive.mount_point);
		try {
			await api.ejectDrive(drive.mount_point);
		} finally {
			this.ejecting.delete(drive.mount_point);
			await this.load();
		}
	};

	containing(path: string) {
		return this.list
			.filter((drive) => drive.mount_point !== '/' && isInside(path, drive.mount_point))
			.sort((a, b) => b.mount_point.length - a.mount_point.length)[0];
	}

	holding(path: string) {
		return this.containing(path) ?? this.list.find((drive) => drive.mount_point === '/');
	}

	isMounted(drive: DriveInfo) {
		return this.list.some((candidate) => candidate.mount_point === drive.mount_point);
	}
}

function rank(drive: DriveInfo) {
	if (drive.mount_point === '/') return 0;
	return drive.is_removable ? 2 : 1;
}
