<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, Format } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { disks } from '#lib/state/disks.svelte.js';
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
		const done = await disks.run(drive.block, () => commands.disksCreatePartition({ table: drive.block, offset, size: length >= size ? 0 : length, format: $state.snapshot(format) }, WAIT));
		working = false;
		if (done) onclose();
	}
</script>

<Dialog title="New partition" {onclose}>
	<SizeField label="Size" bind:value={length} min={Math.min(SMALLEST, size)} max={size} />
	<FormatFields bind:format bind:valid offerErase={false} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid || working} onclick={submit}>{working ? 'Creating…' : 'Create'}</button>
	{/snippet}
</Dialog>
