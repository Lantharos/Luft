<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import EmptyState from '$lib/components/pane/EmptyState.svelte';
	import TrashPane from '$lib/components/pane/TrashPane.svelte';
	import ColumnsView from '$lib/components/views/ColumnsView.svelte';
	import GridView from '$lib/components/views/GridView.svelte';
	import ListView from '$lib/components/views/ListView.svelte';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import { entryContext } from '$lib/file-manager/view/entry-props';
	import type { FileEntry } from '$lib/types';
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
	let lastPath = '';

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
		const path = manager.currentPath;
		untrack(() => {
			if (lastPath && path !== lastPath && manager.view === 'home') view.followListing(lastPath, path);
			lastPath = path;
		});
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
	data-drop-path={manager.view === 'home' ? manager.currentPath : undefined}
	data-drop-key={paneKey}
	ondragover={(event) => (context.chooser ? event.preventDefault() : drag.overEntry(event, undefined, paneKey))}
	ondrop={(event) => !context.chooser && manager.view === 'home' && drag.drop(event, manager.currentPath)}
>
	{#if manager.view === 'trash'}
		<div class="pane-layer">
			<TrashPane {manager} />
		</div>
	{:else}
		{#key mode}
			<div class="pane-layer" in:fade={{ duration: 160, delay: 60 }} out:fade={{ duration: 120 }}>
				{#if empty}
					<EmptyState {...empty} />
				{:else if manager.loading.skeleton}
					<div class="loading-rows" aria-hidden="true">
						{#each { length: 10 }, index (index)}
							<span style:opacity={0.5 - index * 0.04}></span>
						{/each}
					</div>
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
