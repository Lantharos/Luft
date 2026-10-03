import * as api from '#lib/api.js';
import type { Drive, Volume } from '#lib/api.js';
import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
import { editor } from '#lib/editor/editor.svelte.js';
import { changing } from '#lib/encryption.svelte.js';
import { inner, volumeName } from '#lib/format.js';
import { explorable } from '#lib/partitions/types.js';
import { disks } from '#lib/state/disks.svelte.js';

export interface Action {
	label: string;
	run: () => void;
	danger?: boolean;
	checked?: boolean;
}

function act(volume: Volume, action: () => Promise<unknown>) {
	void disks.run(volume.block, action);
}

function unlock(volume: Volume) {
	void disks.run(volume.block, async () => {
		if (!(await api.unlock(volume.block, null, false))) dialogs.open({ kind: 'unlock', volume });
	});
}

export function imageActions(drive: Drive, block: string, name: string): Action[] {
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

function resume(drive: Drive, volume: Volume) {
	void disks.run(volume.block, async () => {
		const outcome = await api.trust.resume(volume.uuid, '');
		if ('wrongKey' in outcome) dialogs.open({ kind: 'encryption', drive, volume });
	});
}

export function isProtected(volume: Volume) {
	return volume.system || Boolean(volume.encryption?.cleartext?.system);
}

export function primaryAction(drive: Drive, volume: Volume): Action | null {
	const contents = inner(volume);
	const mounted = contents.mountPoints.length > 0;
	if (isProtected(volume) || drive.readOnly) return null;
	if (volume.encryption && !volume.encryption.cleartext) return { label: 'Unlock', run: () => unlock(volume) };
	const encryption = disks.encryption(volume);
	if (encryption && (encryption.state === 'paused' || encryption.state === 'waiting')) return { label: 'Resume', run: () => resume(drive, volume) };
	if (mounted) return { label: 'Open', run: () => void api.openFolder(contents.mountPoints[0]) };
	if (contents.usage === 'filesystem') return { label: 'Mount', run: () => act(volume, () => api.mount(contents.block)) };
	return null;
}

export function volumeMenu(drive: Drive, volume: Volume, remembered: boolean): Action[][] {
	const contents = inner(volume);
	const mounted = contents.mountPoints.length > 0;
	const filesystem = contents.usage === 'filesystem';
	const name = volumeName(volume);
	const look: Action[] = [];
	if (mounted && isProtected(volume)) look.push({ label: 'Open', run: () => void api.openFolder(contents.mountPoints[0]) });
	if (explorable(volume)) look.push({ label: 'See what’s using space', run: () => disks.explore(contents.mountPoints[0], name) });
	look.push({ label: 'Details', run: () => dialogs.open({ kind: 'details', drive, volume }) });
	if (isProtected(volume) || drive.readOnly) return [look];

	const state: Action[] = [];
	if (mounted && filesystem) state.push({ label: 'Unmount', run: () => act(volume, () => api.unmount(contents.block)) });
	if (volume.encryption?.cleartext) state.push({ label: 'Lock', run: () => act(volume, () => api.lock(volume.block)) });

	const edit: Action[] = [];
	if (filesystem) {
		edit.push({ label: 'Rename…', run: () => dialogs.open({ kind: 'label', volume: contents }) });
		if (!drive.removable) edit.push({ label: 'Mount at startup…', run: () => dialogs.open({ kind: 'startup', volume: contents }) });
	}
	if (volume.number !== null && drive.table) edit.push({ label: 'Resize or move…', run: () => editor.open(drive.id, volume.block) });

	const encryption: Action[] = [];
	const progress = disks.encryption(volume);
	if (disks.protection.available && volume.encryption) {
		encryption.push({ label: 'Encryption…', run: () => dialogs.open({ kind: 'encryption', drive, volume }) });
		if (progress?.state === 'encrypting' || progress?.state === 'decrypting') {
			encryption.push({ label: 'Pause', run: () => act(volume, () => api.trust.pause(volume.uuid)) });
		}
	} else if (disks.protection.available && (filesystem || !contents.usage) && !changing(progress)) {
		encryption.push({ label: 'Turn on encryption…', run: () => dialogs.open({ kind: 'encrypt', drive, volume }) });
	} else if (volume.encryption) {
		encryption.push({ label: 'Change passphrase…', run: () => dialogs.open({ kind: 'passphrase', volume }) });
		if (remembered) encryption.push({ label: 'Forget saved passphrase', run: () => act(volume, () => api.forgetPassphrase(volume.block)) });
	}

	const erase: Action[] = [{ label: 'Format…', run: () => dialogs.open({ kind: 'format-volume', drive, volume }), danger: true }];
	if (volume.number !== null) erase.push({ label: 'Delete partition…', run: () => dialogs.open({ kind: 'delete', drive, volume }), danger: true });

	return [look, state, edit, encryption, imageActions(drive, volume.block, name), erase];
}

export function driveMenu(drive: Drive): Action[][] {
	const about: Action[] = [{ label: 'Drive details', run: () => dialogs.open({ kind: 'drive', drive }) }];
	const edit: Action[] = drive.table && !drive.readOnly ? [{ label: 'Edit partitions…', run: () => editor.open(drive.id) }] : [];
	if (drive.system || drive.readOnly) return [about, edit];
	return [about, edit, imageActions(drive, drive.block, drive.name), [{ label: 'Format drive…', run: () => dialogs.open({ kind: 'format-drive', drive }), danger: true }]];
}
