<script lang="ts">
	import { useApp } from '$lib/context';
	import { keepMine } from '$lib/documents/disk';
	import type { Document } from '$lib/documents/document.svelte';
	import { reload } from '$lib/documents/opening';
	import { save } from '$lib/documents/saving';

	let { document }: { document: Document } = $props();

	const app = useApp();
</script>

<div class="disk-bar" role="status">
	{#if document.disk === 'changed'}
		<span class="flex-1 truncate">This file changed on disk while you were editing it.</span>
		<button type="button" class="plain-button" onclick={() => void keepMine(app.workspace, document)}>Keep mine</button>
		<button type="button" class="button" onclick={() => void reload(app.workspace, document)}>Reload</button>
	{:else}
		<span class="flex-1 truncate">This file was deleted or moved.</span>
		<button type="button" class="button" onclick={() => void save(app.workspace, document)}>Save it again</button>
	{/if}
</div>

<style>
	.disk-bar {
		display: flex;
		flex: none;
		align-items: center;
		gap: 8px;
		margin: 0 12px 8px;
		border-radius: 16px;
		background: var(--accent-soft);
		padding: 6px 6px 6px 16px;
		font-size: 13px;
	}

	.disk-bar .button,
	.disk-bar .plain-button {
		min-height: 30px;
	}
</style>
