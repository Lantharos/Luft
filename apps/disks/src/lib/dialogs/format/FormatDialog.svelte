<script lang="ts">
	import { untrack } from 'svelte';
	import { bytes, Dialog } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, Format, Volume } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import FormatFields from './FormatFields.svelte';

	interface Props {
		drive: Drive;
		volume: Volume | null;
		onclose: () => void;
	}

	let { drive, volume, onclose }: Props = $props();

	let format = $state<Format>(
		untrack(() => ({
			filesystem: drive.removable ? 'exfat' : 'ext4',
			label: volume ? volume.label : '',
			passphrase: null,
			remember: false,
			erase: false
		}))
	);
	let valid = $state(true);
	let working = $state(false);

	let target = $derived(volume ? `“${volumeName(volume)}” on ${drive.name}` : `${drive.name} (${bytes(drive.size)})`);
	let loss = $derived(
		volume ? `Everything on ${target} will be erased.` : `Every partition and everything on ${target} will be erased.`
	);

	async function submit() {
		working = true;
		const block = volume?.block ?? drive.block;
		const done = await disks.run(block, () =>
			volume ? commands.disksFormatVolume({ block: volume.block, format: $state.snapshot(format) }, WAIT) : commands.disksFormatDrive({ block: drive.block, size: drive.size, removable: drive.removable, format: $state.snapshot(format) }, WAIT)
		);
		working = false;
		if (done) onclose();
	}
</script>

<Dialog title={volume ? 'Format partition' : 'Format drive'} description={loss} {onclose}>
	<FormatFields bind:format bind:valid offerErase />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button danger" disabled={!valid || working} onclick={submit}>{working ? 'Formatting…' : 'Erase and format'}</button>
	{/snippet}
</Dialog>
