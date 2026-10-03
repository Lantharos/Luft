<script lang="ts">
	import type { CatalogApp } from '#lib/catalog/types.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import AppArt from './AppArt.svelte';

	let { app }: { app: CatalogApp } = $props();
</script>

<button type="button" class="tile" onclick={() => navigation.push({ page: 'app', target: { origin: app.origin, id: app.id }, name: app.name })}>
	<AppArt icon={app.icon} size={52} />
	<span class="text">
		<span class="name">{app.name}</span>
		<span class="summary">{app.summary}</span>
	</span>
</button>

<style>
	.tile {
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		gap: 14px;
		border-radius: var(--radius-group);
		padding: 12px 14px;
		text-align: left;
		transition: background-color 160ms var(--ease), transform 160ms var(--ease);
	}

	.tile:hover {
		background: var(--surface-hover);
	}

	.tile:active {
		transform: scale(0.98);
	}

	.text {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 3px;
	}

	.name {
		overflow: hidden;
		font-size: 14px;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.summary {
		display: -webkit-box;
		overflow: hidden;
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--text-muted);
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
</style>
