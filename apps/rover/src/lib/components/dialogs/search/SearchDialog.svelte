<script lang="ts">
	import { tick } from 'svelte';
	import { Dialog, SearchField } from '@luft/ui';
	import * as api from '$lib/api';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { search } from '$lib/features/search.svelte';
	import type { SearchResult } from '$lib/features/types';
	import { plural } from '$lib/utils/format';
	import { basename, parentPath } from '$lib/utils/paths';
	import SearchFilters from './SearchFilters.svelte';
	import SearchResults from './SearchResults.svelte';

	interface Props {
		manager: FileManager;
	}

	let { manager }: Props = $props();

	const SHOWN = 400;

	let field = $state<{ focus: () => void }>();
	let highlighted = $state(0);
	let shown = $derived(search.ordered.slice(0, SHOWN));
	let status = $derived.by(() => {
		if (!search.text.trim()) return 'Type to search this folder and everything inside it';
		if (search.running) return search.results.length > 0 ? `${plural(search.results.length, 'result')} so far` : 'Searching…';
		if (search.results.length === 0) return 'Nothing matches';
		const count = plural(search.results.length, 'result');
		return search.truncated || search.results.length > SHOWN ? `Showing the first ${shown.length} of ${count}, refine to narrow it down` : count;
	});

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	$effect(() => {
		void search.text;
		highlighted = 0;
		search.schedule();
	});

	async function reveal(result: SearchResult) {
		search.close();
		await manager.navigate(parentPath(result.path));
		manager.selectOnly(result.path);
	}

	function open(result: SearchResult) {
		if (result.is_dir) {
			search.close();
			void manager.navigate(result.path);
		} else {
			api.openWithDefault(result.path).catch(manager.notify);
		}
	}

	function keydown(event: KeyboardEvent) {
		const current = shown[highlighted];
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const step = event.key === 'ArrowDown' ? 1 : -1;
			highlighted = Math.min(Math.max(0, highlighted + step), Math.max(0, shown.length - 1));
		} else if (event.key === 'Enter' && current) {
			event.preventDefault();
			if (event.ctrlKey || event.metaKey) void reveal(current);
			else open(current);
		}
	}
</script>

<Dialog title={`Search in ${basename(search.root) || search.root}`} wide onclose={search.close}>
	<SearchField bind:this={field} label="Name or text" large bind:value={search.text} onkeydown={keydown} />
	<SearchFilters />
	<div class="soft-scroll -mx-2 h-[min(420px,50vh)] overflow-y-auto px-2">
		<SearchResults
			results={shown}
			root={search.root}
			{highlighted}
			onhighlight={(index) => (highlighted = index)}
			onreveal={reveal}
			onopen={open}
		/>
	</div>
	<p class="text-[12px] text-[var(--text-muted)]" role="status">{status}</p>

	{#snippet actions()}
		<button class="button" type="button" onclick={search.close}>Close</button>
	{/snippet}
</Dialog>
