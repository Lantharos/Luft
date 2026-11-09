<script lang="ts">
	import { reorder } from '@luft/ui';
	import type { PageView } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';
	import IncomingCard from './IncomingCard.svelte';
	import PageCard from './PageCard.svelte';

	let { onopen }: { onopen: (page: PageView) => void } = $props();

	const DRAG_DISTANCE = 6;

	let grid = $state<HTMLElement>();
	let order = $state.raw<PageView[] | null>(null);
	let lifted = $state<string | null>(null);
	let pressed: { id: string; x: number; y: number; pointer: number } | null = null;
	let shown = $derived(order ?? flatbed.pages);

	function down(event: PointerEvent) {
		const card = (event.target as HTMLElement).closest<HTMLElement>('[data-page]');
		if (!card || event.button !== 0 || (event.target as HTMLElement).closest('.actions')) return;
		pressed = { id: card.dataset.page!, x: event.clientX, y: event.clientY, pointer: event.pointerId };
	}

	function move(event: PointerEvent) {
		if (!pressed || event.pointerId !== pressed.pointer) return;
		if (!lifted) {
			if (Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) < DRAG_DISTANCE) return;
			lifted = pressed.id;
			order = flatbed.pages;
			grid?.setPointerCapture(event.pointerId);
		}
		const target = [...grid!.querySelectorAll<HTMLElement>('[data-page]')].find((card) => {
			const box = card.getBoundingClientRect();
			return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
		});
		const over = target?.dataset.page;
		if (!over || over === lifted || !order) return;
		const from = order.findIndex((page) => page.id === lifted);
		const to = order.findIndex((page) => page.id === over);
		const next = [...order];
		next.splice(to, 0, ...next.splice(from, 1));
		order = next;
	}

	function up() {
		if (lifted && order && order.some((page, index) => page.id !== flatbed.pages[index]?.id)) flatbed.reorder(order);
		const wasDrag = lifted !== null;
		pressed = null;
		lifted = null;
		order = null;
		if (wasDrag) suppressClick = true;
	}

	let suppressClick = false;

	function click(event: MouseEvent) {
		if (!suppressClick) return;
		suppressClick = false;
		event.stopPropagation();
		event.preventDefault();
	}
</script>

<div
	bind:this={grid}
	class="grid"
	role="list"
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onclickcapture={click}
>
	{#each shown as page, index (page.id)}
		<div role="listitem" animate:reorder>
			<PageCard {page} number={index + 1} lifted={lifted === page.id} onopen={() => onopen(page)} />
		</div>
	{/each}
	{#if flatbed.scanning}
		<IncomingCard number={shown.length + 1} />
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
		align-items: end;
		gap: 28px 24px;
		padding: 8px 32px 120px;
	}
</style>
