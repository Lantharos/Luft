<script lang="ts">
	import type { CatalogApp } from '#lib/bindings.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import ExtensionArt from './ExtensionArt.svelte';

	let { app }: { app: CatalogApp } = $props();
</script>

<button type="button" class="tile" onclick={() => navigation.push({ page: 'app', target: { listing: app }, name: app.name })}>
	<span class="art"><ExtensionArt art={app.art} icon={app.icon} /></span>
	<span class="name">{app.name}</span>
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
		font-size: 14px;
		font-weight: 600;
	}

	.summary {
		font-size: 12.5px;
		color: var(--text-muted);
	}
</style>
