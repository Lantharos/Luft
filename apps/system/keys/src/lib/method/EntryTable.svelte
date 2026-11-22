<script lang="ts">
	import { t } from '@luft/i18n';
	import { tick } from 'svelte';
	import ArrowRight from '@luft/symbols/icons/arrow-right';
	import Plus from '@luft/symbols/icons/plus';
	import X from '@luft/symbols/icons/x';
	import { IconButton, SearchField, TextCell, tooltip, VirtualScroller, type VirtualHandle } from '@luft/ui';
	import type { MethodEditor, Row, Table } from './editor.svelte';

	interface Props {
		editor: MethodEditor;
		table: Table;
		empty: string;
		add: string;
		context?: boolean;
	}

	let { editor, table, empty, add, context = false }: Props = $props();

	const ROW = 44;
	const GAP = 2;
	const TALLEST = 420;
	const SEARCH_FROM = 8;

	let query = $state('');
	let scroller = $state<VirtualHandle>();
	let rows = $derived(editor[table]);
	let repeated = $derived(editor.duplicates(table));
	let shown = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		return needle ? rows.filter((row) => row.keys.toLowerCase().includes(needle) || row.text.toLowerCase().includes(needle)) : rows;
	});

	async function addRow() {
		query = '';
		const row = editor.add(table);
		await tick();
		scroller?.scrollToIndex(rows.length - 1);
		await tick();
		scroller?.element()?.querySelector<HTMLInputElement>(`[data-uid="${row.uid}"] input`)?.focus();
	}

	function edit(row: Row, field: 'keys' | 'text' | 'after') {
		return (event: Event & { currentTarget: HTMLInputElement }) => editor.update(table, row.uid, field, event.currentTarget.value);
	}
</script>

<div class="flex flex-col gap-3">
	{#if rows.length}
		<div class="columns heading" class:context data-own-undo>
			{#if rows.length >= SEARCH_FROM}
				<div class="search">
					<SearchField label={t('keys-search')} bind:value={query} />
				</div>
			{:else}
				<span>{t('keys-entry-keys')}</span>
				<span></span>
				<span>{t('keys-entry-text')}</span>
				{#if context}
					<span>{t('keys-entry-after')}</span>
				{/if}
			{/if}
			<button type="button" class="icon-button" aria-label={add} {@attach tooltip(add)} onclick={() => void addRow()}><Plus size={18} /></button>
		</div>
		<VirtualScroller
			bind:this={scroller}
			style="height: {Math.min(TALLEST, shown.length * (ROW + GAP))}px"
			items={shown}
			key={(row) => String(row.uid)}
			layout={{ itemHeight: ROW, gap: GAP }}
		>
			{#snippet children(row)}
				<div
					class="columns row"
					class:context
					class:repeated={repeated.has(row.uid)}
					data-uid={row.uid}
					{@attach repeated.has(row.uid) ? tooltip(t('keys-entry-repeated')) : undefined}
				>
					<TextCell class="font-mono" value={row.keys} label={t('keys-entry-keys')} placeholder="a'" invalid={repeated.has(row.uid)} oninput={edit(row, 'keys')} />
					<ArrowRight size={15} class="text-[var(--text-muted)]" />
					<TextCell value={row.text} label={t('keys-entry-text')} placeholder="á" oninput={edit(row, 'text')} />
					{#if context}
						<TextCell class="font-mono" value={row.after} label={t('keys-entry-after')} placeholder={t('keys-entry-anywhere')} oninput={edit(row, 'after')} />
					{/if}
					<IconButton icon={X} label={t('keys-remove')} onclick={() => editor.remove(table, row.uid)} />
				</div>
			{/snippet}
		</VirtualScroller>
		{#if !shown.length}
			<p class="px-3 text-[13px] text-[var(--text-muted)]">{t('keys-no-matches')}</p>
		{/if}
	{:else}
		<div class="flex flex-col items-center gap-4 pt-16 text-center">
			<p class="text-[15px] text-[var(--text-soft)]">{empty}</p>
			<button type="button" class="button" onclick={() => void addRow()}><Plus size={16} />{add}</button>
		</div>
	{/if}
</div>

<style>
	.columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1.2fr) 32px;
		align-items: center;
		gap: 8px;
	}

	.columns.context {
		grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1.2fr) minmax(0, 0.9fr) 32px;
	}

	.heading {
		min-height: 36px;
		padding-inline: 12px 4px;
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.search {
		grid-column: 1 / -2;
		margin-left: -8px;
	}

	.row {
		height: 100%;
		border-radius: 14px;
		padding-inline: 4px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.row:hover,
	.row:focus-within {
		background: var(--surface);
	}

	.row :global(.icon-button) {
		opacity: 0;
		transition: opacity var(--motion-tap) var(--ease-decelerate);
	}

	.row:hover :global(.icon-button),
	.row:focus-within :global(.icon-button) {
		opacity: 1;
	}
</style>
