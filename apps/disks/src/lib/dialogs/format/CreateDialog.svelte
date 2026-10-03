<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Drive, Format } from '$lib/api';
	import { disks } from '$lib/state/disks.svelte';
	import FormatFields from './FormatFields.svelte';
	import SizeField from './SizeField.svelte';

	interface Props {
		drive: Drive;
		offset: number;
		size: number;
		onclose: () => void;
	}

	let { drive, offset, size, onclose }: Props = $props();

	const SMALLEST = 16 * 1024 * 1024;

	let length = $state(untrack(() => size));
	let format = $state<Format>(
		untrack(() => ({ filesystem: drive.removable ? 'exfat' : 'ext4', label: '', passphrase: null, remember: false, erase: false }))
	);
	let valid = $state(true);
	let working = $state(false);

	async function submit() {
		working = true;
		const done = await disks.run(drive.block, () => api.createPartition(drive.block, offset, length >= size ? 0 : length, $state.snapshot(format)));
		working = false;
		if (done) onclose();
	}
</script>

<Dialog title="New partition" description="Made from free space on {drive.name}. Nothing else on the drive changes." {onclose}>
	<SizeField label="Size" bind:value={length} min={Math.min(SMALLEST, size)} max={size} />
	<FormatFields bind:format bind:valid offerErase={false} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid || working} onclick={submit}>{working ? 'Creating…' : 'Create'}</button>
	{/snippet}
</Dialog>
