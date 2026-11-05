<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from '@luft/ui';
	import type { FileEntry } from '#lib/bindings.js';
	import EmptyState from '#lib/components/pane/EmptyState.svelte';
	import LoadingRows from '#lib/components/pane/LoadingRows.svelte';
	import TrashPane from '#lib/components/pane/TrashPane.svelte';
	import ColumnsView from '#lib/components/views/ColumnsView.svelte';
	import GridView from '#lib/components/views/GridView.svelte';
	import ListView from '#lib/components/views/list/ListView.svelte';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import { entryContext } from '#lib/file-manager/view/entry-props.js';
	import { emptyStateFor } from './empty-states';

	const context = entryContext();
	const { manager, view, drag } = context;

	let mode = $derived(manager.view === 'recent' ? 'list' : manager.viewMode);
	let listingKey = $derived(`${manager.view}:${mode === 'columns' ? '' : manager.currentPath}`);
	let empty = $derived(
		manager.error || (manager.displayEntries.length === 0 && !manager.draft && !manager.loading.active) ? emptyStateFor(context) : null
	);
	let paneKey = $derived(dropKey('pane', manager.currentPath));

	let lastKey = '';
	let lastEntries: FileEntry[] = [];
	let lastCreating = false;

	$effect.pre(() => {
		const key = listingKey;
		const entries = manager.displayEntries;
		const creating = manager.draft?.mode === 'create';
		untrack(() => {
			if (key !== lastKey || lastEntries.length === 0) view.motion.enter();
			else if (entries !== lastEntries || creating !== lastCreating) view.motion.reorder();
			lastKey = key;
			lastEntries = entries;
			lastCreating = creating;
		});
	});

	$effect(() => {
		const arrival = manager.arrival;
		if (arrival) untrack(() => view.arrive(arrival));
	});

	$effect(() => {
		if (manager.selection.size !== 1) return;
		const [path] = manager.selection;
		untrack(() => view.follow(path));
	});
</script>

<section
	class="pane-stack"
	aria-label="File browser"
	ondragover={(event) => (context.chooser ? event.preventDefault() : drag.overEntry(event, undefined, paneKey))}
	ondrop={(event) => !context.chooser && manager.view === 'home' && drag.drop(event, manager.currentPath)}
>
	{#if manager.view === 'trash'}
		<div class="pane-layer">
			<TrashPane {manager} />
		</div>
	{:else}
		{#key mode}
			<div class="pane-layer" in:fade out:fade>
				{#if empty}
					<EmptyState {...empty} />
				{:else if manager.loading.skeleton}
					<LoadingRows />
				{:else}
					{#key listingKey}
						{#if mode === 'grid'}
							<GridView />
						{:else if mode === 'columns'}
							<ColumnsView />
						{:else}
							<ListView />
						{/if}
					{/key}
				{/if}
			</div>
		{/key}
	{/if}
</section>

<style>
	.pane-stack {
		position: relative;
		display: grid;
		min-height: 0;
		min-width: 0;
		flex: 1;
	}

	.pane-layer {
		display: flex;
		min-height: 0;
		min-width: 0;
		flex-direction: column;
		grid-area: 1 / 1;
	}
</style>
