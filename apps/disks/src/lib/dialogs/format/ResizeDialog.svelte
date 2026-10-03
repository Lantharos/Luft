<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Volume } from '$lib/api';
	import { volumeName } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import SizeField from './SizeField.svelte';

	interface Props {
		volume: Volume;
		room: number;
		onclose: () => void;
	}

	let { volume, room, onclose }: Props = $props();

	const SHRINKS = 2 | 8;
	const GROWS = 4 | 16;
	const HEADROOM = 1.1;
	const MARGIN = 64 * 1024 * 1024;

	let flags = $derived(disks.support(volume.fsType)?.resize ?? 0);
	let min = $derived(volume.used !== null && flags & SHRINKS ? Math.min(volume.size, Math.ceil(volume.used * HEADROOM + MARGIN)) : volume.size);
	let max = $derived(flags & GROWS ? volume.size + room : volume.size);
	let size = $state(untrack(() => volume.size));
	let working = $state(false);

	async function submit() {
		working = true;
		const done = await disks.run(volume.block, () => api.resize(volume.block, size));
		working = false;
		if (done) onclose();
	}
</script>

<Dialog
	title="Resize “{volumeName(volume)}”"
	description={volume.used === null && flags & SHRINKS ? 'Mount it first to see how far it can shrink.' : `Files on it stay where they are. Back up anything important first.`}
	{onclose}
>
	<SizeField label="Size" bind:value={size} {min} {max} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={working || size === volume.size} onclick={submit}>{working ? 'Resizing…' : 'Resize'}</button>
	{/snippet}
</Dialog>
