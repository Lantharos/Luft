<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import { on } from 'svelte/events';
	import type { ListColumnId, SortBy } from '#lib/bindings.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { COLUMN_SORT, columnLabel, type ListColumns } from '#lib/file-manager/view/list-columns.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';

	interface Props {
		manager: FileManager;
		columns: ListColumns;
		recent: boolean;
		onmenu: (event: MouseEvent) => void;
	}

	let { manager, columns, recent, onmenu }: Props = $props();

	const DRAG_THRESHOLD = 4;
	let moving = $state<{ id: ListColumnId; offset: number } | null>(null);
	let movedJustNow = false;

	function sort(by: SortBy) {
		if (movedJustNow) return (movedJustNow = false);
		if (!recent) manager.setSortBy(by);
	}

	function follow(node: HTMLElement, pointerId: number, onmove: (event: PointerEvent) => void, onend: () => void) {
		node.setPointerCapture(pointerId);
		const stops = [
			on(node, 'pointermove', onmove),
			on(node, 'pointerup', finish),
			on(node, 'pointercancel', finish)
		];
		function finish() {
			stops.forEach((stop) => stop());
			onend();
		}
	}

	function startResize(event: PointerEvent, id: ListColumnId, width: number) {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		follow(
			event.currentTarget as HTMLElement,
			event.pointerId,
			(move) => columns.resize(id, width - (move.clientX - startX)),
			() => {
				movedJustNow = true;
				columns.finishResize();
			}
		);
	}

	function startMove(event: PointerEvent, id: ListColumnId) {
		if (event.button !== 0) return;
		const heading = event.currentTarget as HTMLElement;
		const others = [...heading.parentElement!.querySelectorAll<HTMLElement>('[data-column]')]
			.filter((element) => element !== heading)
			.map((element) => {
				const box = element.getBoundingClientRect();
				return { id: element.dataset.column as ListColumnId, center: box.left + box.width / 2 };
			});
		const startX = event.clientX;
		let pointerX = startX;
		follow(
			heading,
			event.pointerId,
			(move) => {
				pointerX = move.clientX;
				const offset = pointerX - startX;
				if (moving || Math.abs(offset) > DRAG_THRESHOLD) moving = { id, offset };
			},
			() => {
				if (!moving) return;
				movedJustNow = true;
				moving = null;
				columns.move(id, others.find((other) => other.center > pointerX)?.id ?? null);
			}
		);
	}
</script>

{#snippet direction(by: SortBy)}
	{#if !recent && settings.value.sortBy === by}
		{#if settings.value.sortAsc}
			<ChevronUp size={13} />
		{:else}
			<ChevronDown size={13} />
		{/if}
	{/if}
{/snippet}

<div
	class="list-grid list-header"
	role="row"
	tabindex="-1"
	oncontextmenu={onmenu}
	onpointerdowncapture={() => (movedJustNow = false)}
>
	<button
		class={['list-heading', !recent && settings.value.sortBy === 'name' && 'is-active']}
		type="button"
		aria-disabled={recent}
		onclick={() => sort('name')}
	>
		<span class="truncate">Name</span>
		{@render direction('name')}
	</button>
	{#each columns.shown as column (column.id)}
		<button
			class={[
				'list-heading',
				`list-${column.id}`,
				!recent && settings.value.sortBy === COLUMN_SORT[column.id] && 'is-active',
				moving?.id === column.id && 'is-moving'
			]}
			style:translate={moving?.id === column.id ? `${moving.offset}px 0` : undefined}
			type="button"
			aria-disabled={recent}
			data-column={column.id}
			onpointerdown={(event) => startMove(event, column.id)}
			onclick={() => sort(COLUMN_SORT[column.id])}
		>
			<span
				class="list-resize"
				role="separator"
				aria-orientation="vertical"
				aria-label={`Resize ${columnLabel(column.id, recent)}`}
				onpointerdown={(event) => startResize(event, column.id, column.width)}
			></span>
			<span class="truncate">{columnLabel(column.id, recent)}</span>
			{@render direction(COLUMN_SORT[column.id])}
		</button>
	{/each}
</div>

<style>
	.list-header {
		height: 34px;
		margin-inline: 10px;
		background: var(--content);
		color: var(--text-muted);
		font-size: 12px;
		box-shadow: 0 1px 0 var(--hairline);
	}

	.list-heading {
		display: flex;
		height: 100%;
		min-width: 0;
		align-items: center;
		gap: 4px;
		transition: color var(--motion-tap) var(--ease-decelerate);
	}

	.list-heading:hover:not(:disabled),
	.list-heading.is-active {
		color: var(--text);
	}

	.list-heading.list-size {
		justify-content: flex-end;
	}

	.list-heading[data-column] {
		position: relative;
		cursor: grab;
	}

	.list-heading.is-moving {
		z-index: 1;
		cursor: grabbing;
		color: var(--text);
		background: var(--content);
	}

	.list-resize {
		position: absolute;
		top: 7px;
		bottom: 7px;
		left: -14px;
		width: 12px;
		cursor: col-resize;
	}

	.list-resize::after {
		content: '';
		position: absolute;
		inset: 0 5px;
		border-radius: var(--radius-pill);
		background: var(--hairline);
		opacity: 0;
		transition: opacity var(--motion-tap) var(--ease-decelerate);
	}

	.list-header:hover .list-resize::after {
		opacity: 1;
	}

	.list-resize:hover::after {
		background: var(--text-muted);
	}
</style>
