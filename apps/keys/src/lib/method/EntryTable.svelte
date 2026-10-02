<script lang="ts">
	import { tick } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { IconButton, SearchField, VirtualScroller, type VirtualHandle } from '@luft/ui';
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

	let query = $state('');
	let scroller = $state<VirtualHandle>();
	let rows = $derived(editor[table]);
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
	<div class="flex items-center gap-2">
		<div class="flex-1">
			<SearchField label="Search" bind:value={query} />
		</div>
		<button type="button" class="button" onclick={() => void addRow()}><Plus size={16} />{add}</button>
	</div>
	{#if rows.length}
		<div class="columns px-3 text-[12px] text-[var(--text-muted)]" class:context>
			<span>You type</span>
			<span></span>
			<span>You get</span>
			{#if context}
				<span>Only after</span>
			{/if}
		</div>
		<VirtualScroller
			bind:this={scroller}
			class="soft-scroll"
			style="height: {Math.min(TALLEST, shown.length * (ROW + GAP))}px"
			items={shown}
			key={(row) => String(row.uid)}
			layout={{ itemHeight: ROW, gap: GAP }}
		>
			{#snippet children(row)}
				<div class="columns row" class:context data-uid={row.uid}>
					<input class="cell font-mono" value={row.keys} spellcheck="false" aria-label="You type" placeholder="a'" oninput={edit(row, 'keys')} />
					<ArrowRight size={15} class="text-[var(--text-muted)]" />
					<input class="cell" value={row.text} spellcheck="false" aria-label="You get" placeholder="á" oninput={edit(row, 'text')} />
					{#if context}
						<input class="cell font-mono" value={row.after} spellcheck="false" aria-label="Only after" placeholder="Anything" oninput={edit(row, 'after')} />
					{/if}
					<IconButton icon={X} label="Remove" onclick={() => editor.remove(table, row.uid)} />
				</div>
			{/snippet}
		</VirtualScroller>
		{#if !shown.length}
			<p class="px-1.5 text-[13px] text-[var(--text-muted)]">Nothing matches “{query.trim()}”</p>
		{/if}
	{:else}
		<p class="px-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">{empty}</p>
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

	.row {
		height: 100%;
		border-radius: 14px;
		padding-inline: 4px;
		transition: background-color 120ms var(--ease);
	}

	.row:hover,
	.row:focus-within {
		background: var(--surface);
	}

	.cell {
		height: 34px;
		min-width: 0;
		border-radius: 10px;
		background: transparent;
		padding-inline: 8px;
		font-size: 14px;
		color: var(--text);
		outline: none;
		transition:
			background-color 120ms var(--ease),
			box-shadow 120ms var(--ease);
	}

	.cell:hover {
		background: var(--surface-hover);
	}

	.cell:focus {
		background: var(--control);
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.cell::placeholder {
		color: color-mix(in oklab, var(--text-muted) 55%, transparent);
	}
</style>
