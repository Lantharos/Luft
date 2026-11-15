import { t } from '@luft/i18n';
import { commands } from '#lib/bindings.js';
import type { Drive, Volume } from '#lib/bindings.js';
import { WAIT, openFolder } from '#lib/bridge/index.js';
import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
import { editor } from '#lib/editor/editor.svelte.js';
import { changing } from '#lib/encryption.svelte.js';
import { inner, volumeName } from '#lib/format.js';
import { luftVolume } from '#lib/luft.js';
import { explorable } from '#lib/partitions/types.js';
import { disks } from '#lib/state/disks.svelte.js';

export interface Action {
	label: string;
	run: () => void;
	danger?: boolean;
	checked?: boolean;
}

const moveLuft = (): Action => ({ label: t('disks-action-move-luft'), run: () => dialogs.open({ kind: 'move-luft' }) });

function act(volume: Volume, action: () => Promise<unknown>) {
	void disks.run(volume.block, action);
}

function unlock(volume: Volume) {
	void disks.run(volume.block, async () => {
		const outcome = await commands.disksUnlock({ block: volume.block, passphrase: null, remember: false }, WAIT);
		if (!('done' in outcome && outcome.done)) dialogs.open({ kind: 'unlock', volume });
	});
}

function imageActions(drive: Drive, block: string, name: string): Action[] {
	return [
		{ label: t('disks-action-save-image'), run: () => dialogs.open({ kind: 'save-image', block, name }) },
		{
			label: t('disks-action-restore-image'),
			run: () =>
				void disks.run(block, async () => {
					const image = await commands.disksImageChoose();
					if (image) dialogs.open({ kind: 'restore', drive, block, target: name, image });
				})
		}
	];
}

function resume(drive: Drive, volume: Volume) {
	void disks.run(volume.block, async () => {
		const outcome = await commands.trustResume({ uuid: volume.uuid, unlock: '' }, WAIT);
		if ('wrongKey' in outcome) dialogs.open({ kind: 'encryption', drive, volume });
	});
}

function isProtected(volume: Volume) {
	return volume.system || Boolean(volume.encryption?.cleartext?.system);
}

export function primaryAction(drive: Drive, volume: Volume): Action | null {
	const contents = inner(volume);
	const mounted = contents.mountPoints.length > 0;
	if (isProtected(volume) || drive.readOnly) return null;
	if (volume.encryption && !volume.encryption.cleartext) return { label: t('disks-action-unlock'), run: () => unlock(volume) };
	const encryption = disks.encryption(volume);
	if (encryption && (encryption.state === 'paused' || encryption.state === 'waiting')) return { label: t('disks-action-resume'), run: () => resume(drive, volume) };
	if (mounted) return { label: t('disks-action-open'), run: () => void openFolder(contents.mountPoints[0]) };
	if (contents.usage === 'filesystem') return { label: t('disks-action-mount'), run: () => act(volume, () => commands.disksMount({ block: contents.block }, WAIT)) };
	return null;
}

export function volumeMenu(drive: Drive, volume: Volume, remembered: boolean): Action[][] {
	const contents = inner(volume);
	const mounted = contents.mountPoints.length > 0;
	const filesystem = contents.usage === 'filesystem';
	const name = volumeName(volume);
	const look: Action[] = [];
	if (mounted && isProtected(volume) && !disks.holdsLuft(volume)) look.push({ label: t('disks-action-open'), run: () => void openFolder(contents.mountPoints[0]) });
	if (explorable(volume)) look.push({ label: t('disks-explore'), run: () => disks.exploreVolume(volume) });
	look.push({ label: t('disks-action-details'), run: () => dialogs.open({ kind: 'details', drive, volume }) });
	if (luftVolume(drive)?.block === volume.block) return [look, [moveLuft()]];
	if (isProtected(volume) || drive.readOnly) return [look];

	const state: Action[] = [];
	if (mounted && filesystem) state.push({ label: t('disks-action-unmount'), run: () => act(volume, () => commands.disksUnmount({ block: contents.block }, WAIT)) });
	if (volume.encryption?.cleartext) state.push({ label: t('disks-action-lock'), run: () => act(volume, () => commands.disksLock({ block: volume.block }, WAIT)) });

	const edit: Action[] = [];
	if (filesystem) {
		edit.push({ label: t('disks-action-rename'), run: () => dialogs.open({ kind: 'label', volume: contents }) });
		if (!drive.removable) edit.push({ label: t('disks-action-startup'), run: () => dialogs.open({ kind: 'startup', volume: contents }) });
	}
	if (volume.number !== null && drive.table) edit.push({ label: t('disks-action-resize'), run: () => editor.open(drive.id, volume.block) });

	const encryption: Action[] = [];
	const progress = disks.encryption(volume);
	if (disks.protection.available && volume.encryption) {
		encryption.push({ label: t('disks-action-encryption'), run: () => dialogs.open({ kind: 'encryption', drive, volume }) });
		if (progress?.state === 'encrypting' || progress?.state === 'decrypting') {
			encryption.push({ label: t('disks-action-pause'), run: () => act(volume, () => commands.trustPause({ uuid: volume.uuid }, WAIT)) });
		}
	} else if (disks.protection.available && (filesystem || !contents.usage) && !changing(progress)) {
		encryption.push({ label: t('disks-action-encrypt'), run: () => dialogs.open({ kind: 'encrypt', drive, volume }) });
	} else if (volume.encryption) {
		encryption.push({ label: t('disks-action-passphrase'), run: () => dialogs.open({ kind: 'passphrase', volume }) });
		if (remembered) encryption.push({ label: t('disks-action-forget'), run: () => act(volume, () => commands.disksForgetPassphrase({ block: volume.block }, WAIT)) });
	}

	const erase: Action[] = [{ label: t('disks-action-format'), run: () => dialogs.open({ kind: 'format-volume', drive, volume }), danger: true }];
	if (volume.number !== null) erase.push({ label: t('disks-action-delete'), run: () => dialogs.open({ kind: 'delete', drive, volume }), danger: true });

	return [look, state, edit, encryption, imageActions(drive, volume.block, name), erase];
}

export function driveMenu(drive: Drive): Action[][] {
	const about: Action[] = [{ label: t('disks-action-drive-details'), run: () => dialogs.open({ kind: 'drive', drive }) }];
	const edit: Action[] = drive.table && !drive.readOnly ? [{ label: t('disks-action-edit'), run: () => editor.open(drive.id) }] : [];
	if (luftVolume(drive)) return [about, edit, [moveLuft()]];
	if (drive.system || drive.readOnly) return [about, edit];
	return [about, edit, imageActions(drive, drive.block, drive.name), [{ label: t('disks-action-format-drive'), run: () => dialogs.open({ kind: 'format-drive', drive }), danger: true }]];
}
