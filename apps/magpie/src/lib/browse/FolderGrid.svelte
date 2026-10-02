<script lang="ts">
	import { VirtualScroller, type VirtualHandle } from '@luft/ui';
	import Play from '@lucide/svelte/icons/play';
	import type { Item } from '$lib/api';
	import FontSample from '$lib/font/FontSample.svelte';
	import { library } from '$lib/library/library.svelte';
	import { thumbnails } from '$lib/library/thumbnails.svelte';

	const LAYOUT = { itemHeight: 118, minItemWidth: 118, gap: 6, padding: { top: 2, right: 12, bottom: 16, left: 12 } };

	let scroller = $state<VirtualHandle>();

	$effect(() => {
		if (library.index >= 0) scroller?.scrollToIndex(library.index, 'nearest');
	});

	function choose(item: Item, index: number) {
		library.select(item, index > library.index ? 1 : -1);
	}
</script>

<VirtualScroller bind:this={scroller} class="hidden-scroll scroll-fade min-h-0 flex-1" items={library.siblings} key={(item) => item.path} layout={LAYOUT}>
	{#snippet children(item, index)}
		{@const thumbnail = thumbnails.source(item)}
		<button
			type="button"
			class="tile"
			class:current={item.path === library.current?.path}
			aria-label={item.name}
			aria-current={item.path === library.current?.path}
			title={item.name}
			onclick={() => choose(item, index)}
		>
			{#if thumbnail}
				<img src={thumbnail} alt="" draggable="false" decoding="async" />
			{:else if item.kind === 'font'}
				<span class="grid h-full place-items-center"><FontSample path={item.path} /></span>
			{/if}
			{#if item.kind === 'video'}
				<span class="video"><Play size={12} fill="currentColor" /></span>
			{/if}
		</button>
	{/snippet}
</VirtualScroller>

<style>
	.tile {
		position: relative;
		display: block;
		height: 100%;
		width: 100%;
		overflow: hidden;
		border-radius: 10px;
		background: var(--sidebar-control);
		transition:
			transform 160ms var(--ease),
			box-shadow 160ms var(--ease);
	}

	.tile:hover {
		transform: scale(0.97);
	}

	.tile.current {
		box-shadow:
			0 0 0 2px var(--accent),
			inset 0 0 0 1px rgba(0, 0, 0, 0.2);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		animation: reveal 200ms var(--ease);
	}

	.video {
		position: absolute;
		right: 6px;
		bottom: 6px;
		display: grid;
		height: 22px;
		width: 22px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
	}

	@keyframes reveal {
		from {
			opacity: 0;
		}
	}
</style>
