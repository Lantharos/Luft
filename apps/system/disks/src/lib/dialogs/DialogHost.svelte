<script lang="ts">
	import { t } from '@luft/i18n';
	import { appWindow } from '@lantharos/sabine';
	import { bytes, ConfirmDialog, Dialog, RecoveryKeyDialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, Volume } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { builtIn, volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { space } from '#lib/state/space.svelte.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import DriveDetails from './details/DriveDetails.svelte';
	import HealthDialog from './details/HealthDialog.svelte';
	import VolumeDetails from './details/VolumeDetails.svelte';
	import CreateDialog from './format/CreateDialog.svelte';
	import ApplyDialog from './editor/ApplyDialog.svelte';
	import EncryptionDialog from './encryption/EncryptionDialog.svelte';
	import TurnOffDialog from './encryption/TurnOffDialog.svelte';
	import TurnOnDialog from './encryption/TurnOnDialog.svelte';
	import { dialogs } from './dialogs.svelte';
	import EraseDriveDialog from './format/EraseDriveDialog.svelte';
	import FormatDialog from './format/FormatDialog.svelte';
	import LabelDialog from './LabelDialog.svelte';
	import PassphraseDialog from './encryption/PassphraseDialog.svelte';
	import SaveImageDialog from './images/SaveImageDialog.svelte';
	import StartupDialog from './StartupDialog.svelte';
	import GiveLuftDialog from './systems/GiveLuftDialog.svelte';
	import FinishMoveDialog from './moving/FinishMoveDialog.svelte';
	import MoveLuftDialog from './moving/MoveLuftDialog.svelte';
	import RemoveSystemDialog from './systems/RemoveSystemDialog.svelte';
	import UnlockDialog from './encryption/UnlockDialog.svelte';
	import WriteImageDialog from './images/WriteImageDialog.svelte';

	let dialog = $derived(dialogs.current);
	let stoppable = $derived(disks.image && !disks.image.finished && !editor.running && [...disks.busy].every((key) => key === disks.image?.block) ? disks.image : null);

	const CLEAN = {
		trash: { title: 'disks-clean-trash', action: 'disks-clean-trash-action', description: 'disks-clean-trash-description' },
		downloads: { title: 'disks-clean-downloads', action: 'disks-clean-downloads-action', description: 'disks-clean-downloads-description' },
		caches: { title: 'disks-clean-caches', action: 'disks-clean-caches-action', description: 'disks-clean-caches-description' }
	};

	async function stopAndClose() {
		await commands.disksImageCancel();
		await appWindow.close();
	}

	const live = (drive: Drive) => disks.drives.find((candidate) => candidate.id === drive.id) ?? null;

	function liveVolume(drive: Drive | null, volume: Volume) {
		const segment = drive?.segments.find((candidate) => candidate.kind === 'volume' && candidate.block === volume.block);
		return segment?.kind === 'volume' ? segment : null;
	}
</script>

{#if dialog?.kind === 'details'}
	{@const drive = live(dialog.drive)}
	{@const volume = liveVolume(drive, dialog.volume)}
	{#if drive && volume}
		<VolumeDetails {drive} {volume} onclose={dialogs.close} />
	{/if}
{:else if dialog?.kind === 'drive'}
	<DriveDetails drive={live(dialog.drive) ?? dialog.drive} onclose={dialogs.close} />
{:else if dialog?.kind === 'health'}
	{@const drive = live(dialog.drive)}
	{#if drive?.health}
		<HealthDialog {drive} health={drive.health} onclose={dialogs.close} />
	{/if}
{:else if dialog?.kind === 'encrypt'}
	<TurnOnDialog drive={dialog.drive} volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'encryption'}
	{@const drive = live(dialog.drive)}
	{@const volume = liveVolume(drive, dialog.volume)}
	{#if drive && volume}
		<EncryptionDialog {drive} {volume} onclose={dialogs.close} />
	{/if}
{:else if dialog?.kind === 'turn-off'}
	<TurnOffDialog volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'give-luft'}
	<GiveLuftDialog drive={live(dialog.drive) ?? dialog.drive} offset={dialog.offset} size={dialog.size} onclose={dialogs.close} />
{:else if dialog?.kind === 'move-luft'}
	<MoveLuftDialog onclose={dialogs.close} />
{:else if dialog?.kind === 'remove-system'}
	<RemoveSystemDialog system={dialog.system} onclose={dialogs.close} />
{:else if dialog?.kind === 'recovery-key'}
	{@const { key, name, fresh } = dialog}
	<RecoveryKeyDialog
		{key}
		{fresh}
		title={t('disks-recovery-key-title', { name })}
		description={t('disks-recovery-key-description')}
		onsave={() => commands.trustSaveKey({ key, name }, WAIT)}
		onprint={() => commands.trustPrintKey({ key, name }, WAIT)}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'format-volume'}
	<FormatDialog drive={dialog.drive} volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'format-drive'}
	<FormatDialog drive={dialog.drive} volume={null} onclose={dialogs.close} />
{:else if dialog?.kind === 'create'}
	<CreateDialog drive={dialog.drive} offset={dialog.offset} size={dialog.size} onclose={dialogs.close} />
{:else if dialog?.kind === 'apply-plan'}
	<ApplyDialog name={editor.drive?.name ?? ''} onclose={dialogs.close} />
{:else if dialog?.kind === 'discard-plan'}
	<ConfirmDialog
		title={t('disks-discard-title')}
		description={t('disks-discard-description')}
		action={t('disks-discard-action')}
		danger
		run={async () => editor.close()}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'label'}
	<LabelDialog volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'unlock'}
	<UnlockDialog volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'passphrase'}
	<PassphraseDialog volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'startup'}
	<StartupDialog volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'save-image'}
	<SaveImageDialog block={dialog.block} name={dialog.name} onclose={dialogs.close} />
{:else if dialog?.kind === 'write-image'}
	<WriteImageDialog image={dialog.image} onclose={dialogs.close} />
{:else if dialog?.kind === 'delete'}
	{@const { drive, volume } = dialog}
	<ConfirmDialog
		title={t('disks-delete-title', { name: volumeName(volume) })}
		description={t('disks-delete-description', { size: bytes(volume.size), drive: drive.name })}
		action={t('disks-delete-action')}
		danger
		run={() => disks.run(volume.block, () => commands.disksDeletePartition({ block: volume.block }, WAIT))}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'trash'}
	{@const { path, name, size, folder } = dialog}
	<ConfirmDialog
		title={t('disks-trash-title', { name })}
		description={t('disks-trash-description', { kind: folder ? 'folder' : 'file', size: bytes(size) })}
		action={t('disks-trash-action')}
		danger
		run={() => space.trash(path)}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'clean'}
	{@const { what, size, items } = dialog}
	<ConfirmDialog title={t(CLEAN[what].title)} description={t(CLEAN[what].description, { size: bytes(size), count: items })} action={t(CLEAN[what].action)} danger run={() => space.clean(what)} onclose={dialogs.close} />
{:else if dialog?.kind === 'restore'}
	{@const { drive, block, target, image } = dialog}
	{@const whole = block === drive.block}
	{@const description = whole
		? t('disks-restore-drive', { drive: drive.name, size: bytes(drive.size), image: bytes(image.size) })
		: t('disks-restore-partition', { name: target, drive: drive.name, image: bytes(image.size) })}
	{@const run = () => disks.run(block, () => commands.disksImageRestore({ block, path: image.path }, WAIT))}
	{#if whole && builtIn(drive)}
		<EraseDriveDialog name={drive.name} title={t('disks-restore-title', { name: image.name })} {description} action={t('disks-restore-action')} {run} onclose={dialogs.close} />
	{:else}
		<ConfirmDialog title={t('disks-restore-title', { name: image.name })} {description} action={t('disks-restore-action')} danger {run} onclose={dialogs.close} />
	{/if}
{:else if dialog?.kind === 'finish-move'}
	<FinishMoveDialog move={dialog.move} onclose={dialogs.close} />
{:else if dialog?.kind === 'still-working'}
	<Dialog
		title={t('disks-still-working')}
		description={t('disks-still-working-description', { work: stoppable ? (stoppable.restoring ? 'writing' : 'saving') : 'other' })}
		onclose={dialogs.close}
	>
		{#snippet actions()}
			{#if stoppable}
				<button type="button" class="button danger" onclick={stopAndClose}>{t('disks-still-working-stop')}</button>
			{/if}
			<button type="button" class="button primary" onclick={dialogs.close}>{t('disks-still-working-keep')}</button>
		{/snippet}
	</Dialog>
{/if}
