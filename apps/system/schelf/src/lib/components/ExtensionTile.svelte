<script lang="ts">
	import type { CatalogApp } from '#lib/bindings.js';
	import Check from '@lucide/svelte/icons/check';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import ExtensionArt from './ExtensionArt.svelte';

	let { app }: { app: CatalogApp } = $props();
	const installed = $derived(library.forListing(app) !== null);
</script>

<button type="button" class="tile" onclick={() => navigation.push({ page: 'app', target: { listing: app }, name: app.name })}>
	<span class="art"><ExtensionArt art={app.art} icon={app.icon} /></span>
	<span class="name">
		<span class="truncate">{app.name}</span>
		{#if installed}
			<span class="installed"><Check size={13} strokeWidth={2.5} />Installed</span>
		{/if}
	</span>
	<span class="summary">{app.summary}</span>
</button>

<style>
	.tile {
		display: flex;
		width: 100%;
		flex-direction: column;
		text-align: left;
	}

	.art {
		display: block;
		margin-bottom: 10px;
		transition: transform var(--motion-tap) var(--ease-decelerate);
	}

	.tile:hover .art {
		transform: scale(1.015);
	}

	.tile:active .art {
		transform: scale(0.99);
	}

	.name,
	.summary {
		overflow: hidden;
		padding: 0 2px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
	}

	.installed {
		display: flex;
		flex: none;
		align-items: center;
		gap: 4px;
		align-self: center;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-soft);
	}

	.summary {
		font-size: 12.5px;
		color: var(--text-muted);
	}
</style>
