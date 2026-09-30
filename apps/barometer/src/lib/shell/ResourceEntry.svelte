<script lang="ts">
	import Graph from '$lib/graph/Graph.svelte';
	import type { Resource } from '$lib/resources/registry';
	import { app } from '$lib/state/app.svelte';
	import { monitor } from '$lib/state/monitor.svelte';

	interface Props {
		resource: Resource;
	}

	let { resource }: Props = $props();

	let active = $derived(app.page === resource.id);
	let lines = $derived(resource.lines(monitor.ticks));
	let summary = $derived(monitor.latest ? resource.summary(monitor.latest) : '');
</script>

<button type="button" class="entry" class:active aria-current={active ? 'page' : undefined} onclick={() => app.open(resource.id)}>
	<span class="text">
		<span class="title">{resource.title}</span>
		<span class="summary">{summary}</span>
	</span>
	<Graph class="spark" {lines} max={resource.max} floor={resource.floor} binary={resource.binary} compact />
</button>

<style>
	.entry {
		display: flex;
		min-height: 52px;
		width: 100%;
		flex: none;
		align-items: center;
		gap: 12px;
		border-radius: 16px;
		padding: 7px 8px 7px 14px;
		text-align: left;
		color: var(--sidebar-text);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease),
			transform 150ms var(--ease);
	}

	.entry:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.entry.active {
		background: var(--sidebar-active);
		color: var(--text);
	}

	.entry:active {
		transform: scale(0.98);
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

	.active .title {
		font-weight: 500;
	}

	.summary {
		overflow: hidden;
		font-size: 12px;
		color: var(--sidebar-text-muted);
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
