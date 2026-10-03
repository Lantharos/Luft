import * as api from '$lib/api';
import type { Drive } from '$lib/api';
import { dialogs } from '$lib/dialogs/dialogs.svelte';
import { disks } from '$lib/state/disks.svelte';

export function imageActions(drive: Drive, block: string, name: string) {
	return [
		{ label: 'Save as disk image…', run: () => dialogs.open({ kind: 'save-image', block, name }) },
		{
			label: 'Restore disk image…',
			run: () =>
				void disks.run(block, async () => {
					const image = await api.chooseImage();
					if (image) dialogs.open({ kind: 'restore', drive, block, target: name, image });
				})
		}
	];
}
