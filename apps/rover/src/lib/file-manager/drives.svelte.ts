import { SvelteSet } from 'svelte/reactivity';
import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import type { DriveInfo } from '$lib/types';
import { isInside } from '$lib/utils/paths';

export class DrivesState {
	list = $state.raw<DriveInfo[]>([]);
	readonly hidden = new SvelteSet<string>();
	readonly ejecting = new SvelteSet<string>();

	sidebar = $derived(this.list.filter((drive) => drive.is_removable && !this.hidden.has(drive.mount_point)));

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

	isMounted(drive: DriveInfo) {
		return this.list.some((candidate) => candidate.mount_point === drive.mount_point);
	}
}
