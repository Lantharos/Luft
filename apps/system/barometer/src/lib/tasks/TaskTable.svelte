<script lang="ts">
	import { t } from '@luft/i18n';
	import { AppIcon, Spinner, VirtualScroller, type VirtualHandle } from '@luft/ui';
	import ChevronRight from '@luft/symbols/icons/chevron-right';
	import type { Snippet } from 'svelte';
	import type { Sort } from '#lib/state/settings.svelte.js';
	import { sharedByGroups, template, type Column } from './columns';
	import { desktopId } from './icons';
	import TableHeader from './TableHeader.svelte';
	import { notes, type Node } from './tree/node.svelte';

	interface Props {
		items: Node[];
		columns: Column[];
		sort: Sort;
		selected: string | null;
		label: string;
		onsort: (column: string) => void;
		oncolumns: (event: MouseEvent) => void;
		onselect: (node: Node) => void;
		onopen: (node: Node) => void;
		onmenu: (event: MouseEvent, node: Node) => void;
		ontoggle: (node: Node) => void;
		onend: (node: Node, force: boolean) => void;
		ontype: (text: string) => void;
		actions?: Snippet<[Node]>;
	}

	let { items, columns, sort, selected, label, onsort, oncolumns, onselect, onopen, onmenu, ontoggle, onend, ontype, actions }: Props = $props();

	const LAYOUT = { itemHeight: 36, gap: 1, padding: { top: 4, right: 10, bottom: 20, left: 10 } };

	let scroller = $state<VirtualHandle>();
	let index = $derived(items.findIndex((node) => node.key === selected));

	export function reveal(key: string) {
		const at = items.findIndex((node) => node.key === key);
		if (at >= 0) scroller?.scrollToIndex(at, 'center');
	}

	function select(at: number) {
		const next = items[Math.min(items.length - 1, Math.max(0, at))];
		if (!next) return;
		onselect(next);
		scroller?.scrollToIndex(items.indexOf(next));
	}

	function left(node: Node) {
		if (node.expanded) ontoggle(node);
		else if (node.parent) select(items.indexOf(node.parent));
	}

	function right(node: Node) {
		if (node.expanded === false) ontoggle(node);
		else if (node.expanded) select(index + 1);
	}

	function keydown(event: KeyboardEvent) {
		const node = items[index];
		const page = scroller?.metrics().pageRows ?? 10;
		const from = index < 0 ? -1 : index;
		const keys: Record<string, () => void> = {
			ArrowDown: () => select(from + 1),
			ArrowUp: () => select(from - 1),
			PageDown: () => select(from + page),
			PageUp: () => select(from - page),
			Home: () => select(0),
			End: () => select(items.length - 1),
			Enter: () => node && onopen(node),
			Delete: () => node && onend(node, event.shiftKey),
			ArrowRight: () => node && right(node),
			ArrowLeft: () => node && left(node)
		};
		const action = keys[event.key];
		if (action) {
			event.preventDefault();
			action();
		} else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
			event.preventDefault();
			ontype(event.key);
		}
	}
</script>

{#snippet header()}
	<TableHeader {columns} {sort} {onsort} onmenu={oncolumns} />
{/snippet}

<VirtualScroller
	bind:this={scroller}
	class="task-table min-h-0 flex-1"
	style="--table-columns: {template(columns)}"
	{items}
	key={(node) => node.key}
	layout={LAYOUT}
	overscan={6}
	stableOrder
	animateOrder
	{header}
	role="treegrid"
	aria-label={label}
	tabindex={0}
	onkeydown={keydown}
>
	{#snippet children(node, at)}
		{#if node.kind === 'group'}
			{@render heading(node, at)}
		{:else}
			{@render row(node, at)}
		{/if}
	{/snippet}
</VirtualScroller>

{#snippet disclosure(node: Node, label: string)}
	<button
		type="button"
		class="disclosure"
		class:open={node.expanded}
		aria-label={label}
		onpointerdown={(event) => event.stopPropagation()}
		onclick={() => ontoggle(node)}
	>
		<ChevronRight size={15} />
	</button>
{/snippet}

{#snippet heading(node: Node, at: number)}
	<div
		class="group-heading"
		class:selected={node.key === selected}
		role="row"
		tabindex="-1"
		aria-rowindex={at + 2}
		aria-level={1}
		aria-expanded={node.expanded}
		aria-selected={node.key === selected}
		onpointerdown={() => onselect(node)}
		ondblclick={() => ontoggle(node)}
	>
		{@render disclosure(node, node.expanded ? t('barometer-group-hide', { group: node.title }) : t('barometer-group-show', { group: node.title }))}
		<span role="rowheader">{node.title}</span>
	</div>
{/snippet}

{#snippet row(node: Node, at: number)}
	<div
		class="table-grid task-row"
		aria-rowindex={at + 2}
		aria-level={node.child ? 3 : 2}
		aria-expanded={node.expanded}
		class:selected={node.key === selected}
		class:child={node.child}
		role="row"
		tabindex="-1"
		aria-selected={node.key === selected}
		onpointerdown={() => onselect(node)}
		ondblclick={() => onopen(node)}
		oncontextmenu={(event) => {
			event.preventDefault();
			onselect(node);
			onmenu(event, node);
		}}
	>
		<span class="name">
			{#if node.expanded !== undefined}
				{@render disclosure(node, node.expanded ? t('barometer-processes-hide') : t('barometer-processes-show'))}
			{/if}
			<AppIcon icon={node.icon} id={desktopId(node.app)} size={node.child ? 18 : 22} />
			<span class="truncate">{node.title}</span>
			{#if node.kind === 'entry' && node.count > 1}
				<span class="count">{node.count}</span>
			{/if}
			{#if node.working}<Spinner size={12} class="text-[var(--text-muted)]" />{/if}
			{#if node.note}
				<span class="note" class:alert={node.note === 'unresponsive'}>{notes()[node.note]}</span>
			{/if}
			{@render actions?.(node)}
		</span>
		{#if node.kind !== 'window'}
			{#each columns as column (column.id)}
				<span class="cell" class:numeric={column.numeric}>{node.kind === 'process' || sharedByGroups(column) ? column.text(node.row) : ''}</span>
			{/each}
		{/if}
	</div>
{/snippet}

<style>
	:global(.task-table) {
		outline: none;
		overflow-anchor: none;
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
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.task-row:hover {
		background: var(--surface);
	}

	.task-row.selected,
	.group-heading.selected {
		background: var(--surface-hover);
	}

	:global(.task-table:focus-visible) :is(.task-row, .group-heading).selected {
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

	.group-heading {
		display: flex;
		height: 100%;
		align-items: center;
		gap: 10px;
		border-radius: 10px;
		padding-inline: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-soft);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
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
			transform var(--motion-quick) var(--ease-decelerate),
			background-color var(--motion-tap) var(--ease-decelerate);
	}

	.disclosure:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.disclosure.open {
		transform: rotate(90deg);
	}

	.count,
	.note {
		flex: none;
		font-size: 12px;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.note.alert {
		color: var(--danger);
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
