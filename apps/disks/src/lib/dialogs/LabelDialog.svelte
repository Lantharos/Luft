<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Filesystem, Volume } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { LABEL_LIMITS, volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let label = $state(untrack(() => volume.label));
	let limit = $derived(LABEL_LIMITS[volume.fsType as Filesystem] ?? 255);
	let valid = $derived(label.length <= limit && label !== volume.label);

	async function submit() {
		if (valid && (await disks.run(volume.block, () => commands.disksLabel({ block: volume.block, label }, WAIT)))) onclose();
	}
</script>

<Dialog title="Rename “{volumeName(volume)}”" {onclose}>
	<TextField label="Name" bind:value={label} error={label.length > limit ? `Up to ${limit} characters for this format` : ''} live onkeydown={(event) => event.key === 'Enter' && submit()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid} onclick={submit}>Rename</button>
	{/snippet}
</Dialog>
