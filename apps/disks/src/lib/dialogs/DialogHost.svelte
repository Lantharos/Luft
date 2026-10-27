<script lang="ts">
	import { bytes, ConfirmDialog, RecoveryKeyDialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, Volume } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { volumeName } from '#lib/format.js';
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
	import FormatDialog from './format/FormatDialog.svelte';
	import LabelDialog from './LabelDialog.svelte';
	import PassphraseDialog from './encryption/PassphraseDialog.svelte';
	import SaveImageDialog from './images/SaveImageDialog.svelte';
	import StartupDialog from './StartupDialog.svelte';
	import RemoveSystemDialog from './systems/RemoveSystemDialog.svelte';
	import UnlockDialog from './encryption/UnlockDialog.svelte';
	import WriteImageDialog from './images/WriteImageDialog.svelte';

	let dialog = $derived(dialogs.current);

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
{:else if dialog?.kind === 'remove-system'}
	<RemoveSystemDialog system={dialog.system} onclose={dialogs.close} />
{:else if dialog?.kind === 'recovery-key'}
	{@const { key, name } = dialog}
	<RecoveryKeyDialog
		{key}
		title="Recovery key for “{name}”"
		description="Keep a copy somewhere other than this drive and computer."
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
		title="Discard the planned changes?"
		description="Nothing on the drive has changed yet."
		action="Discard"
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
		title="Delete “{volumeName(volume)}”?"
		description="The partition and all {bytes(volume.size)} on it will be removed from {drive.name}. This can't be undone."
		action="Delete partition"
		danger
		run={() => disks.run(volume.block, () => commands.disksDeletePartition({ block: volume.block }, WAIT))}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'trash'}
	{@const { path, name, size, folder } = dialog}
	<ConfirmDialog
		title="Move “{name}” to the trash?"
		description="{folder ? 'It and everything in it take' : 'It takes'} up {bytes(size)}, freed once the trash is emptied."
		action="Move to trash"
		danger
		run={() => space.trash(path)}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'restore'}
	{@const { drive, block, target, image } = dialog}
	<ConfirmDialog
		title="Write “{image.name}”?"
		description="Everything on {target === drive.name ? `${drive.name} (${bytes(drive.size)})` : `“${target}” on ${drive.name}`} will be replaced by the {bytes(image.size)} image. This can't be undone."
		action="Erase and write"
		danger
		run={() => disks.run(block, () => commands.disksImageRestore({ block, path: image.path }, WAIT))}
		onclose={dialogs.close}
	/>
{/if}
