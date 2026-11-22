<script lang="ts">
	import { closeSearchPanel, findNext, findPrevious, getSearchQuery, replaceAll, replaceNext, SearchQuery, setSearchQuery } from '@codemirror/search';
	import type { EditorView } from '@codemirror/view';
	import ArrowDown from '@luft/symbols/icons/arrow-down';
	import ArrowUp from '@luft/symbols/icons/arrow-up';
	import CaseSensitive from '@luft/symbols/icons/case-sensitive';
	import ChevronRight from '@luft/symbols/icons/chevron-right';
	import Regex from '@luft/symbols/icons/regex';
	import WholeWord from '@luft/symbols/icons/whole-word';
	import X from '@luft/symbols/icons/x';
	import { i18n, t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import { untrack } from 'svelte';
	import { debounce } from '#lib/utils/debounce.js';
	import { countMatches, type MatchCount } from './count';

	interface Props {
		view: EditorView;
		replace: boolean;
	}

	let { view, replace }: Props = $props();

	const COUNT_DELAY_MS = 120;

	const current = () => getSearchQuery(view.state);
	let query = current();
	let search = $state(query.search);
	let replacement = $state(query.replace);
	let caseSensitive = $state(query.caseSensitive);
	let regexp = $state(query.regexp);
	let wholeWord = $state(query.wholeWord);
	let replacing = $state(untrack(() => replace));
	let count = $state<MatchCount | null>(null);
	let invalid = $state(false);
	let searchField = $state<HTMLInputElement>();
	let replaceField = $state<HTMLInputElement>();

	const recount = debounce(() => {
		count = query.search && query.valid ? countMatches(view.state, query) : null;
	}, COUNT_DELAY_MS);

	let summary = $derived.by(() => {
		if (!search) return '';
		if (invalid) return t('draft-search-invalid');
		if (!count) return '';
		if (count.total === 0) return t('draft-search-none');
		const numbers = new Intl.NumberFormat(i18n.formats);
		const total = count.complete ? numbers.format(count.total) : t('draft-search-at-least', { count: numbers.format(count.total) });
		return count.current ? t('draft-search-current', { current: numbers.format(count.current), total }) : total;
	});

	function commit() {
		const next = new SearchQuery({ search, replace: replacement, caseSensitive, regexp, wholeWord });
		invalid = Boolean(search) && !next.valid;
		if (!next.eq(getSearchQuery(view.state))) view.dispatch({ effects: setSearchQuery.of(next) });
	}

	export function refresh() {
		const latest = current();
		if (!latest.eq(query)) {
			query = latest;
			search = latest.search;
			replacement = latest.replace;
			caseSensitive = latest.caseSensitive;
			regexp = latest.regexp;
			wholeWord = latest.wholeWord;
			invalid = Boolean(search) && !latest.valid;
		}
		recount();
	}

	export function focus(withReplace: boolean) {
		replacing ||= withReplace;
		refresh();
		const field = withReplace ? replaceField : searchField;
		requestAnimationFrame(() => {
			field?.focus();
			field?.select();
		});
	}

	function toggle(option: 'caseSensitive' | 'regexp' | 'wholeWord') {
		if (option === 'caseSensitive') caseSensitive = !caseSensitive;
		else if (option === 'regexp') regexp = !regexp;
		else wholeWord = !wholeWord;
		commit();
	}

	function close() {
		closeSearchPanel(view);
		view.focus();
	}

	function keydown(event: KeyboardEvent, field: 'search' | 'replace') {
		const shortcuts: Record<string, () => void> = { c: () => toggle('caseSensitive'), r: () => toggle('regexp'), w: () => toggle('wholeWord') };
		if (event.altKey && shortcuts[event.key.toLowerCase()]) shortcuts[event.key.toLowerCase()]();
		else if (event.key === 'Escape') close();
		else if (event.key === 'Enter' && field === 'replace' && event.ctrlKey) replaceAll(view);
		else if (event.key === 'Enter' && field === 'replace') replaceNext(view);
		else if (event.key === 'Enter') (event.shiftKey ? findPrevious : findNext)(view);
		else return;
		event.preventDefault();
	}
</script>

{#snippet option(label: string, active: boolean, run: () => void, Icon: typeof Regex)}
	<button type="button" class="search-option" class:active aria-label={label} aria-pressed={active} onclick={run} {@attach tooltip(label)}>
		<Icon size={16} />
	</button>
{/snippet}

<div class="search-bar" role="search">
	<button
		type="button"
		class="icon-button search-expand"
		class:open={replacing}
		aria-label={replacing ? t('draft-search-hide-replace') : t('draft-search-show-replace')}
		aria-expanded={replacing}
		onclick={() => (replacing = !replacing)}
	>
		<ChevronRight size={16} />
	</button>
	<div class="search-rows">
		<div class="search-row">
			<div class="search-field" class:invalid>
				<input
					bind:this={searchField}
					bind:value={search}
					{...{ 'main-field': 'true' }}
					aria-label={t('draft-search-find')}
					placeholder={t('draft-search-find')}
					spellcheck="false"
					oninput={commit}
					onkeydown={(event) => keydown(event, 'search')}
				/>
				{@render option(t('draft-search-match-case'), caseSensitive, () => toggle('caseSensitive'), CaseSensitive)}
				{@render option(t('draft-search-whole-word'), wholeWord, () => toggle('wholeWord'), WholeWord)}
				{@render option(t('draft-search-regex'), regexp, () => toggle('regexp'), Regex)}
			</div>
			<span class="search-summary" class:invalid aria-live="polite">{summary}</span>
			<button type="button" class="icon-button" aria-label={t('draft-search-previous')} onclick={() => findPrevious(view)} {@attach tooltip(t('draft-search-previous'))}>
				<ArrowUp size={16} />
			</button>
			<button type="button" class="icon-button" aria-label={t('draft-search-next')} onclick={() => findNext(view)} {@attach tooltip(t('draft-search-next'))}>
				<ArrowDown size={16} />
			</button>
			<button type="button" class="icon-button" aria-label={t('draft-search-close')} onclick={close}>
				<X size={16} />
			</button>
		</div>
		{#if replacing}
			<div class="search-row">
				<div class="search-field">
					<input
						bind:this={replaceField}
						bind:value={replacement}
						aria-label={t('draft-search-replacement')}
						placeholder={t('draft-search-replacement')}
						spellcheck="false"
						oninput={commit}
						onkeydown={(event) => keydown(event, 'replace')}
					/>
				</div>
				<button type="button" class="plain-button search-action" onclick={() => replaceNext(view)}>{t('draft-search-replace')}</button>
				<button type="button" class="plain-button search-action" onclick={() => replaceAll(view)}>{t('draft-search-replace-all')}</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.search-bar {
		display: flex;
		gap: 4px;
		padding: 8px 14px 8px 10px;
		box-shadow: 0 1px 0 var(--hairline);
		font-family: var(--font-sans);
	}

	.search-rows {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 6px;
	}

	.search-row {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.search-expand {
		height: 32px;
		width: 28px;
		transition: transform var(--motion-quick) var(--ease-decelerate);
	}

	.search-expand.open :global(svg) {
		transform: rotate(90deg);
	}

	.search-expand :global(svg) {
		transition: transform var(--motion-quick) var(--ease-decelerate);
	}

	.search-field {
		display: flex;
		height: 32px;
		width: min(420px, 100%);
		flex: 0 1 auto;
		align-items: center;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding: 0 4px 0 14px;
		transition: box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.search-field:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.search-field.invalid:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--danger);
	}

	.search-field input {
		min-width: 0;
		flex: 1;
		background: transparent;
		font-family: var(--font-mono);
		font-size: 13px;
		outline: none;
	}

	.search-field input::placeholder {
		color: var(--text-muted);
		font-family: var(--font-sans);
	}

	.search-option {
		display: grid;
		height: 26px;
		width: 26px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.search-option:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.search-option.active {
		background: var(--accent);
		color: var(--accent-text);
	}

	.search-summary {
		min-width: 96px;
		padding-inline: 10px;
		color: var(--text-muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.search-summary.invalid {
		color: var(--danger);
	}

	.search-action {
		min-height: 30px;
		margin-left: 4px;
	}
</style>
