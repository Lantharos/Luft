<script lang="ts">
	import * as api from '$lib/api';
	import { bytes, volumeName } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CreateDialog from './format/CreateDialog.svelte';
	import { dialogs } from './dialogs.svelte';
	import FormatDialog from './format/FormatDialog.svelte';
	import LabelDialog from './LabelDialog.svelte';
	import PassphraseDialog from './encryption/PassphraseDialog.svelte';
	import ResizeDialog from './format/ResizeDialog.svelte';
	import SaveImageDialog from './images/SaveImageDialog.svelte';
	import StartupDialog from './StartupDialog.svelte';
	import UnlockDialog from './encryption/UnlockDialog.svelte';
	import WriteImageDialog from './images/WriteImageDialog.svelte';

	let dialog = $derived(dialogs.current);
</script>

{#if dialog?.kind === 'format-volume'}
	<FormatDialog drive={dialog.drive} volume={dialog.volume} onclose={dialogs.close} />
{:else if dialog?.kind === 'format-drive'}
	<FormatDialog drive={dialog.drive} volume={null} onclose={dialogs.close} />
{:else if dialog?.kind === 'create'}
	<CreateDialog drive={dialog.drive} offset={dialog.offset} size={dialog.size} onclose={dialogs.close} />
{:else if dialog?.kind === 'resize'}
	<ResizeDialog volume={dialog.volume} room={dialog.room} onclose={dialogs.close} />
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
		confirm="Delete partition"
		onconfirm={() => disks.run(volume.block, () => api.deletePartition(volume.block))}
		onclose={dialogs.close}
	/>
{:else if dialog?.kind === 'restore'}
	{@const { drive, block, target, image } = dialog}
	<ConfirmDialog
		title="Write “{image.name}”?"
		description="Everything on {target === drive.name ? `${drive.name} (${bytes(drive.size)})` : `“${target}” on ${drive.name}`} will be replaced by the {bytes(image.size)} image. This can't be undone."
		confirm="Erase and write"
		onconfirm={() => disks.run(block, () => api.restoreImage(block, image.path))}
		onclose={dialogs.close}
	/>
{/if}
