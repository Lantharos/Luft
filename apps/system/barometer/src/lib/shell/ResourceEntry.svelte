<script lang="ts">
	import Graph from '#lib/graph/Graph.svelte';
	import type { Resource } from '#lib/resources/registry.js';
	import { app } from '#lib/state/app.svelte.js';
	import { monitor } from '#lib/state/monitor.svelte.js';

	interface Props {
		resource: Resource;
	}

	let { resource }: Props = $props();

	let active = $derived(app.page === resource.id);
	let lines = $derived(resource.lines(monitor.ticks));
	let summary = $derived(monitor.latest ? resource.summary(monitor.latest) : '');
</script>

<button type="button" class="nav-item tall entry" class:active aria-current={active ? 'page' : undefined} onclick={() => app.open(resource.id)}>
	<span class="text">
		<span class="title">{resource.title}</span>
		<span class="nav-detail summary">{summary}</span>
	</span>
	<Graph class="spark" {lines} max={resource.max} floor={resource.floor} binary={resource.binary} compact />
</button>

<style>
	.entry {
		padding-right: 8px;
	}

	.text {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 2px;
	}

	.title {
		overflow: hidden;
		font-size: 14px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.summary {
		overflow: hidden;
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.entry :global(.spark) {
		height: 34px;
		width: 64px;
		flex: none;
		border-radius: 10px;
		background: var(--sidebar-control);
	}
</style>
