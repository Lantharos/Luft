<script lang="ts">
	import { tick } from 'svelte';
	import { t } from '@luft/i18n';
	import { basename, Dialog, parent, SearchField, Spinner } from '@luft/ui';
	import type { SearchResult } from '#lib/bindings.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { search } from '#lib/features/search.svelte.js';
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
		const count = search.results.length;
		if (!search.text.trim()) return t('rover-search-start');
		if (search.running) return count > 0 ? t('rover-search-so-far', { count }) : t('rover-search-searching');
		if (count === 0) return t('rover-search-nothing');
		return search.truncated || count > SHOWN ? t('rover-search-truncated', { shown: shown.length, count }) : t('rover-search-results', { count });
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
		await manager.navigate(parent(result.path));
		manager.selectOnly(result.path);
	}

	function open(result: SearchResult) {
		if (result.isDir) {
			search.close();
			void manager.navigate(result.path);
		} else {
			void manager.openFile(result.path);
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

<Dialog title={t('rover-search-title', { folder: basename(search.root) || search.root })} wide onclose={search.close}>
	<SearchField bind:this={field} label={t('rover-search-field')} large bind:value={search.text} onkeydown={keydown} />
	<SearchFilters online={Boolean(manager.cloud.holding(search.root))} />
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
	<p class="flex items-center gap-2 text-[12px] text-[var(--text-muted)]" role="status">
		{#if search.running}<Spinner size={12} />{/if}
		{status}
	</p>

	{#snippet actions()}
		<button class="button" type="button" onclick={search.close}>{t('rover-close')}</button>

	{/snippet}
</Dialog>
