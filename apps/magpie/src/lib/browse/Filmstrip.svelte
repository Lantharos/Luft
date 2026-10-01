<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import type { Item } from '$lib/api';
	import { library } from '$lib/library/library.svelte';
	import { thumbnails } from '$lib/library/thumbnails.svelte';

	const TILE = 64;
	const GAP = 6;
	const PADDING = 8;
	const OVERSCAN = 6;
	const PITCH = TILE + GAP;

	let scroller = $state<HTMLDivElement>();
	let width = $state(0);
	let scrollLeft = $state(0);

	let items = $derived(library.siblings);
	let first = $derived(Math.max(0, Math.floor((scrollLeft - PADDING) / PITCH) - OVERSCAN));
	let last = $derived(Math.min(items.length, Math.ceil((scrollLeft + width) / PITCH) + OVERSCAN));
	let visible = $derived(items.slice(first, last));
	let length = $derived(PADDING * 2 + items.length * PITCH - GAP);

	$effect(() => {
		const index = library.index;
		if (!scroller || index < 0) return;
		scroller.scrollTo({ left: PADDING + index * PITCH + TILE / 2 - width / 2, behavior: 'smooth' });
	});

	function wheel(node: HTMLDivElement) {
		const scroll = (event: WheelEvent) => {
			if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
			event.preventDefault();
			node.scrollLeft += event.deltaY;
		};
		node.addEventListener('wheel', scroll, { passive: false });
		return () => node.removeEventListener('wheel', scroll);
	}

	function choose(item: Item, index: number) {
		library.select(item, index > library.index ? 1 : -1);
	}
</script>

<div class="strip floating-bar" style:width="min({length}px, 100%)" data-no-drag>
	<div
		bind:this={scroller}
		bind:clientWidth={width}
		class="scroller hidden-scroll"
		onscroll={() => (scrollLeft = scroller!.scrollLeft)}
		{@attach wheel}
	>
		<div class="track" style:width="{length}px">
			{#each visible as item, offset (item.path)}
				{@const index = first + offset}
				{@const thumbnail = thumbnails.source(item)}
				<button
					type="button"
					class="tile"
					class:current={index === library.index}
					style:transform="translateX({PADDING + index * PITCH}px)"
					aria-label={item.name}
					title={item.name}
					onclick={() => choose(item, index)}
				>
					{#if thumbnail}
						<img src={thumbnail} alt="" draggable="false" decoding="async" />
					{/if}
					{#if item.kind === 'video'}
						<span class="video"><Play size={10} fill="currentColor" /></span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.strip {
		max-width: 960px;
		padding: 0;
		overflow: hidden;
	}

	.scroller {
		overflow-x: auto;
		overflow-y: hidden;
	}

	.track {
		position: relative;
		height: calc(64px + 16px);
	}

	.tile {
		position: absolute;
		top: 8px;
		left: 0;
		height: 64px;
		width: 64px;
		overflow: hidden;
		border-radius: 10px;
		background: color-mix(in oklab, var(--ink) 6%, transparent);
		opacity: 0.72;
		transition:
			opacity 160ms var(--ease),
			box-shadow 160ms var(--ease);
	}

	.tile:hover,
	.tile.current {
		opacity: 1;
	}

	.tile.current {
		box-shadow: 0 0 0 2px var(--accent);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	.video {
		position: absolute;
		right: 4px;
		bottom: 4px;
		display: grid;
		height: 18px;
		width: 18px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
	}
</style>
