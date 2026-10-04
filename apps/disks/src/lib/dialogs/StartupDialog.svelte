<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, Switch, TextField } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { Volume } from '#lib/api.js';
	import { volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let enabled = $state(untrack(() => Boolean(volume.startup)));
	let directory = $state(untrack(() => volume.startup?.directory ?? `/mnt/${(volume.label || volume.uuid).replace(/[^\w.-]+/g, '-')}`));
	let readOnly = $state(untrack(() => volume.startup?.options.split(',').includes('ro') ?? false));
	let valid = $derived(!enabled || /^\/[^\s]+$/.test(directory));

	async function submit() {
		if (valid && (await disks.run(volume.block, () => api.setStartup(volume.block, enabled ? directory : null, readOnly)))) onclose();
	}
</script>

{#snippet row(title: string, checked: boolean, change: (value: boolean) => void)}
	<div class="flex items-center justify-between gap-4 px-1">
		<span class="text-[13px] font-medium">{title}</span>
		<Switch label={title} {checked} onchange={change} />
	</div>
{/snippet}

<Dialog title="Mount “{volumeName(volume)}” at startup" {onclose}>
	{@render row('Mount for everyone when the computer starts', enabled, (value) => (enabled = value))}
	{#if enabled}
		<TextField label="Folder" showLabel bind:value={directory} error={valid ? '' : 'Use a full folder path, such as /mnt/data'} live />
		{@render row('Read only', readOnly, (value) => (readOnly = value))}
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid} onclick={submit}>Save</button>
	{/snippet}
</Dialog>
