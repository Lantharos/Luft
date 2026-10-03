import * as api from '$lib/api';
import type { Drive, Segment, Volume } from '$lib/api';
import { dialogs } from '$lib/dialogs/dialogs.svelte';
import { inner, volumeName } from '$lib/format';
import { disks } from '$lib/state/disks.svelte';

export interface Action {
	label: string;
	run: () => void;
	danger?: boolean;
	checked?: boolean;
}

const SHRINKS = 2 | 8;
const GROWS = 4 | 16;

function act(volume: Volume, action: () => Promise<unknown>) {
	void disks.run(volume.block, action);
}

function unlock(volume: Volume) {
	void disks.run(volume.block, async () => {
		if (!(await api.unlock(volume.block, null, false))) dialogs.open({ kind: 'unlock', volume });
	});
}

function roomAfter(segments: Segment[], volume: Volume) {
	const index = segments.findIndex((segment) => segment.kind === 'volume' && segment.block === volume.block);
	const next = segments[index + 1];
	return next?.kind === 'free' ? next.size : 0;
}

function resizable(drive: Drive, volume: Volume, room: number) {
	if (volume.number === null || volume.encryption) return false;
	const flags = disks.support(volume.fsType)?.resize ?? 0;
	return (room > 0 && (flags & GROWS) !== 0) || (volume.used !== null && (flags & SHRINKS) !== 0);
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

export function isProtected(volume: Volume) {
	return volume.system || Boolean(volume.encryption?.cleartext?.system);
}

export function primaryAction(drive: Drive, volume: Volume): Action | null {
	const contents = inner(volume);
	const mounted = contents.mountPoints.length > 0;
	if (isProtected(volume) || drive.readOnly) return null;
	if (volume.encryption && !volume.encryption.cleartext) return { label: 'Unlock', run: () => unlock(volume) };
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
	if (mounted) look.push({ label: 'See what’s using space', run: () => disks.explore(contents.mountPoints[0], name) });
	look.push({ label: 'Details', run: () => dialogs.open({ kind: 'details', drive, volume }) });
	if (isProtected(volume) || drive.readOnly) return [look];

	const room = roomAfter(drive.segments, volume);
	const state: Action[] = [];
	if (mounted && filesystem) state.push({ label: 'Unmount', run: () => act(volume, () => api.unmount(contents.block)) });
	if (volume.encryption?.cleartext) state.push({ label: 'Lock', run: () => act(volume, () => api.lock(volume.block)) });

	const edit: Action[] = [];
	if (filesystem) {
		edit.push({ label: 'Rename…', run: () => dialogs.open({ kind: 'label', volume: contents }) });
		if (!drive.removable) edit.push({ label: 'Mount at startup…', run: () => dialogs.open({ kind: 'startup', volume: contents }) });
	}
	if (resizable(drive, volume, room)) edit.push({ label: 'Resize…', run: () => dialogs.open({ kind: 'resize', volume, room }) });

	const encryption: Action[] = [];
	if (volume.encryption) {
		encryption.push({ label: 'Change passphrase…', run: () => dialogs.open({ kind: 'passphrase', volume }) });
		if (remembered) encryption.push({ label: 'Forget saved passphrase', run: () => act(volume, () => api.forgetPassphrase(volume.block)) });
	}

	const erase: Action[] = [{ label: 'Format…', run: () => dialogs.open({ kind: 'format-volume', drive, volume }), danger: true }];
	if (volume.number !== null) erase.push({ label: 'Delete partition…', run: () => dialogs.open({ kind: 'delete', drive, volume }), danger: true });

	return [look, state, edit, encryption, imageActions(drive, volume.block, name), erase];
}

export function driveMenu(drive: Drive): Action[][] {
	const about: Action[] = [{ label: 'Drive details', run: () => dialogs.open({ kind: 'drive', drive }) }];
	if (drive.system || drive.readOnly) return [about];
	return [about, imageActions(drive, drive.block, drive.name), [{ label: 'Format drive…', run: () => dialogs.open({ kind: 'format-drive', drive }), danger: true }]];
}
