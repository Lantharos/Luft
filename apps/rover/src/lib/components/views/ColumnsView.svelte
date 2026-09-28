<script lang="ts">
	import { ColumnsData } from '$lib/file-manager/view/columns.svelte';
	import { entryContext } from '$lib/file-manager/view/entry-props';
	import FolderColumn from './FolderColumn.svelte';

	const { manager } = entryContext();
	const data = new ColumnsData(manager);
	let strip = $state<HTMLDivElement>();

	$effect(() => data.load(data.columns.filter((column) => !column.current).map((column) => column.path)));

	$effect(() => {
		if (data.columns.length > 0) strip?.scrollTo({ left: strip.scrollWidth, behavior: 'smooth' });
	});
</script>

<div bind:this={strip} class="columns-strip soft-scroll" role="group" aria-label="Folder columns">
	{#each data.columns as column (column.path)}
		<FolderColumn {column} entries={column.current ? manager.displayEntries : data.entries(column.path)} />
	{/each}
</div>
