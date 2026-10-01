<script lang="ts">
	import Layers from '@lucide/svelte/icons/layers';
	import type { AppUpdate } from '$lib/bridge/types';
	import AppArt from '$lib/components/AppArt.svelte';
	import ProgressButton from '$lib/components/ProgressButton.svelte';
	import { updateJob } from '$lib/app/jobs';
	import { bytes } from '$lib/format';
	import { navigation } from '$lib/state/navigation.svelte';
	import { operations } from '$lib/state/operations.svelte';

	let { update }: { update: AppUpdate } = $props();

	const operation = $derived(operations.forKey(update.key));
	const active = $derived(operation && operation.state !== 'failed' ? operation : null);
	const versions = $derived(update.from && update.to && update.from !== update.to ? `${update.from} → ${update.to}` : (update.to ?? update.from));
	const detail = $derived(operation?.state === 'failed' ? operation.error : [versions, update.size ? bytes(update.size) : null].filter(Boolean).join(' · '));

	function open() {
		if (!update.platform) navigation.push({ page: 'app', target: { installed: update.key }, name: update.name });
	}
</script>

<div class="row">
	<button type="button" class="main" disabled={update.platform} onclick={open}>
		{#if update.platform}
			<span class="platform"><Layers size={20} /></span>
		{:else}
			<AppArt icon={update.icon} desktop={update.desktop} size={40} />
		{/if}
		<span class="flex min-w-0 flex-col gap-0.5">
			<span class="name truncate">{update.name}</span>
			<span class="truncate text-[12.5px]" class:failed={operation?.state === 'failed'}>{detail}</span>
		</span>
	</button>
	{#if active}
		<ProgressButton operation={active} />
	{:else}
		<button type="button" class="button" onclick={() => operations.run(update.key, update.name, updateJob(update))}>Update</button>
	{/if}
</div>

<style>
	.row {
		display: flex;
		min-height: 64px;
		align-items: center;
		gap: 8px;
		padding-right: 16px;
		transition: background-color 160ms var(--ease);
	}

	.row:has(.main:hover:not(:disabled)) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		min-width: 0;
		flex: 1;
		align-items: center;
		gap: 14px;
		align-self: stretch;
		padding-left: 16px;
		text-align: left;
		color: var(--text-muted);
	}

	.name {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}

	.platform {
		display: grid;
		height: 40px;
		width: 40px;
		flex: none;
		place-items: center;
		border-radius: 24%;
		background: var(--control);
		color: var(--text-soft);
	}

	.failed {
		color: var(--danger);
	}
</style>
