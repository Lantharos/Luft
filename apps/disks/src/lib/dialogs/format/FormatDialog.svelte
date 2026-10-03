<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { Drive, Format, Volume } from '#lib/api.js';
	import { bytes, volumeName } from '#lib/format.js';
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
			volume ? api.formatVolume(volume.block, $state.snapshot(format)) : api.formatDrive(drive.block, drive.size, drive.removable, $state.snapshot(format))
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
