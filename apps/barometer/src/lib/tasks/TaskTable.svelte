<script lang="ts" module>
	import type { Row } from './columns';

	export interface Item {
		key: string;
		row: Row;
		title: string;
		icon: string | null;
		app?: string | null;
		note?: string;
		child?: boolean;
		expanded?: boolean;
	}
</script>

<script lang="ts">
	import { AppIcon, VirtualScroller, type VirtualHandle } from '@luft/ui';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Sort } from '$lib/state/settings.svelte';
	import { template, type Column } from './columns';
	import { desktopId } from './icons';
	import TableHeader from './TableHeader.svelte';

	interface Props {
		items: Item[];
		columns: Column[];
		sort: Sort;
		selected: string | null;
		label: string;
		onsort: (column: string) => void;
		oncolumns: (event: MouseEvent) => void;
		onselect: (item: Item) => void;
		onopen: (item: Item) => void;
		onmenu: (event: MouseEvent, item: Item) => void;
		ontoggle?: (item: Item) => void;
		onend: (item: Item, force: boolean) => void;
	}

	let { items, columns, sort, selected, label, onsort, oncolumns, onselect, onopen, onmenu, ontoggle, onend }: Props = $props();

	const LAYOUT = { itemHeight: 36, gap: 1, padding: { top: 4, right: 10, bottom: 20, left: 10 } };

	let scroller = $state<VirtualHandle>();
	let index = $derived(items.findIndex((item) => item.key === selected));

	function move(offset: number) {
		const next = items[Math.min(items.length - 1, Math.max(0, (index < 0 ? -1 : index) + offset))];
		if (!next) return;
		onselect(next);
		scroller?.scrollToIndex(items.indexOf(next));
	}

	function keydown(event: KeyboardEvent) {
		const item = items[index];
		const page = scroller?.metrics().pageRows ?? 10;
		const keys: Record<string, () => void> = {
			ArrowDown: () => move(1),
			ArrowUp: () => move(-1),
			PageDown: () => move(page),
			PageUp: () => move(-page),
			Home: () => move(-items.length),
			End: () => move(items.length),
			Enter: () => item && onopen(item),
			Delete: () => item && onend(item, event.shiftKey),
			ArrowRight: () => item?.expanded === false && ontoggle?.(item),
			ArrowLeft: () => item?.expanded && ontoggle?.(item)
		};
		const action = keys[event.key];
		if (!action) return;
		event.preventDefault();
		action();
	}
</script>

{#snippet header()}
	<TableHeader {columns} {sort} {onsort} onmenu={oncolumns} />
{/snippet}

<VirtualScroller
	bind:this={scroller}
	class="task-table soft-scroll min-h-0 flex-1"
	style="--table-columns: {template(columns)}"
	{items}
	key={(item) => item.key}
	layout={LAYOUT}
	overscan={6}
	stableOrder
	{header}
	role="grid"
	aria-label={label}
	tabindex={0}
	onkeydown={keydown}
>
	{#snippet children(item, index)}
		<div
			class="table-grid task-row"
			aria-rowindex={index + 2}
			class:selected={item.key === selected}
			class:child={item.child}
			role="row"
			tabindex="-1"
			aria-selected={item.key === selected}
			onpointerdown={() => onselect(item)}
			ondblclick={() => onopen(item)}
			oncontextmenu={(event) => {
				event.preventDefault();
				onselect(item);
				onmenu(event, item);
			}}
		>
			<span class="name">
				{#if item.expanded !== undefined}
					<button
						type="button"
						class="disclosure"
						class:open={item.expanded}
						aria-label={item.expanded ? 'Hide processes' : 'Show processes'}
						onpointerdown={(event) => event.stopPropagation()}
						onclick={() => ontoggle?.(item)}
					>
						<ChevronRight size={15} />
					</button>
				{/if}
				<AppIcon icon={item.icon} id={desktopId(item.app)} size={item.child ? 18 : 22} />
				<span class="truncate">{item.title}</span>
				{#if item.note}
					<span class="note">{item.note}</span>
				{/if}
			</span>
			{#each columns as column (column.id)}
				<span class="cell" class:numeric={column.numeric}>{column.text(item.row)}</span>
			{/each}
		</div>
	{/snippet}
</VirtualScroller>

<style>
	:global(.task-table) {
		outline: none;
	}

	:global(.table-grid) {
		display: grid;
		grid-template-columns: var(--table-columns);
		min-width: 100%;
	}

	.task-row {
		height: 100%;
		align-items: center;
		border-radius: 10px;
		padding-inline: 0;
		font-size: 13px;
		transition: background-color 120ms var(--ease);
	}

	.task-row:hover {
		background: var(--surface);
	}

	.task-row.selected {
		background: var(--surface-hover);
	}

	:global(.task-table:focus-visible) .task-row.selected {
		box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--accent) 60%, transparent);
	}

	.name {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 10px;
		padding-inline: 8px;
	}

	.child .name {
		padding-left: 40px;
		color: var(--text-soft);
	}

	.disclosure {
		display: grid;
		height: 22px;
		width: 22px;
		flex: none;
		margin-right: -4px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition:
			transform 200ms var(--ease),
			background-color 140ms var(--ease);
	}

	.disclosure:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.disclosure.open {
		transform: rotate(90deg);
	}

	.note {
		flex: none;
		font-size: 12px;
		color: var(--text-muted);
	}

	.cell {
		min-width: 0;
		overflow: hidden;
		padding-inline: 8px;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cell.numeric {
		text-align: right;
	}
</style>
