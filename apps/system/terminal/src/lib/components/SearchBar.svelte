<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { SearchField, tooltip } from '@luft/ui';
	import CaseSensitive from '@lucide/svelte/icons/case-sensitive';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Regex from '@lucide/svelte/icons/regex';
	import X from '@lucide/svelte/icons/x';
	import type { ISearchOptions } from '@xterm/addon-search';
	import { settings } from '#lib/state/settings.svelte.js';
	import { withAlpha } from '#lib/terminal/palette.js';
	import type { TerminalSession } from '#lib/terminal/session.svelte.js';

	interface Props {
		session: TerminalSession;
		onclose: () => void;
	}

	let { session, onclose }: Props = $props();

	let query = $state(untrack(() => session.terminal.getSelection()));
	let caseSensitive = $state(false);
	let regex = $state(false);
	let results = $state({ index: -1, count: 0 });
	let field = $state<SearchField>();

	let options = $derived<ISearchOptions>({
		caseSensitive,
		regex,
		decorations: {
			matchBackground: withAlpha(settings.accent, 0.28),
			activeMatchBackground: withAlpha(settings.accent, 0.62),
			matchOverviewRuler: withAlpha(settings.accent, 0.5),
			activeMatchColorOverviewRuler: settings.accent
		}
	});

	$effect(() => {
		const subscription = session.search.onDidChangeResults(({ resultIndex, resultCount }) => {
			results = { index: resultIndex, count: resultCount };
		});
		field?.focus();
		return () => {
			subscription.dispose();
			session.search.clearDecorations();
		};
	});

	$effect(() => {
		if (query) session.search.findNext(query, { ...options, incremental: true });
		else {
			session.search.clearDecorations();
			results = { index: -1, count: 0 };
		}
	});

	function step(direction: 1 | -1) {
		if (!query) return;
		if (direction > 0) session.search.findNext(query, options);
		else session.search.findPrevious(query, options);
	}

	function close() {
		onclose();
		session.focus();
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
		else if (event.key === 'Enter') step(event.shiftKey ? -1 : 1);
		else return;
		event.preventDefault();
	}
</script>

<div class="search-bar" role="search" onpointerdown={(event) => event.stopPropagation()}>
	<div class="search-field">
		<SearchField bind:this={field} bind:value={query} label={t('terminal-search-find')} onkeydown={keydown} />
	</div>
	<span class="search-count">
		{#if query}
			{results.count === 0 ? t('terminal-search-none') : t('terminal-search-position', { index: results.index + 1, count: results.count })}
		{/if}
	</span>
	<button type="button" class="search-toggle" class:is-on={caseSensitive} aria-pressed={caseSensitive} aria-label={t('terminal-search-match-case')} {@attach tooltip(t('terminal-search-match-case'))} onclick={() => (caseSensitive = !caseSensitive)}>
		<CaseSensitive size={16} />
	</button>
	<button type="button" class="search-toggle" class:is-on={regex} aria-pressed={regex} aria-label={t('terminal-search-regex')} {@attach tooltip(t('terminal-search-regex'))} onclick={() => (regex = !regex)}>
		<Regex size={15} />
	</button>
	<button type="button" class="search-toggle" aria-label={t('terminal-search-previous')} onclick={() => step(-1)}><ChevronUp size={16} /></button>
	<button type="button" class="search-toggle" aria-label={t('terminal-search-next')} onclick={() => step(1)}><ChevronDown size={16} /></button>
	<button type="button" class="search-toggle" aria-label={t('terminal-search-close')} onclick={close}><X size={15} /></button>
</div>
