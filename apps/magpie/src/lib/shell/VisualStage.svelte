<script lang="ts">
	import { tooltip } from '@luft/ui';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { fly } from 'svelte/transition';
	import type { Item } from '$lib/api';
	import { chrome } from '$lib/app/chrome.svelte';
	import { appear, disappear } from '$lib/app/transitions';
	import Filmstrip from '$lib/browse/Filmstrip.svelte';
	import { library } from '$lib/library/library.svelte';
	import { activePhoto } from '$lib/photo/active.svelte';
	import PhotoDetails from '$lib/photo/PhotoDetails.svelte';
	import PhotoView from '$lib/photo/PhotoView.svelte';
	import { keepPhotos, loadPhoto } from '$lib/photo/source';
	import ZoomControls from '$lib/photo/ZoomControls.svelte';
	import VideoView from '$lib/video/VideoView.svelte';

	const PRELOAD_DELAY_MS = 250;

	let showStrip = $derived(chrome.mode === 'viewer' && chrome.strip && library.siblings.length > 1);

	let { item }: { item: Item } = $props();

	$effect(() => {
		const neighbors = [library.siblings[library.index - 1], item, library.siblings[library.index + 1]].filter(
			(candidate): candidate is Item => candidate?.kind === 'image'
		);
		keepPhotos(neighbors);
		const timer = setTimeout(() => neighbors.forEach((neighbor) => void loadPhoto(neighbor).catch(() => {})), PRELOAD_DELAY_MS);
		return () => clearTimeout(timer);
	});
</script>

<div class="flex min-h-0 flex-1">
	<div
		class="relative min-w-0 flex-1 overflow-hidden"
		class:with-strip={showStrip}
		role="presentation"
		onpointermove={chrome.wake}
	>
		{#key item.path}
			<div class="absolute inset-0" in:appear out:disappear>
				{#if item.kind === 'image'}
					<PhotoView {item} />
				{:else}
					<VideoView {item} />
				{/if}
			</div>
		{/key}
		{#if library.hasPrevious}
			<button type="button" class="nav left fade-idle" aria-label="Previous" onclick={() => library.step(-1)} {@attach tooltip('Previous')}>
				<ChevronLeft size={22} />
			</button>
		{/if}
		{#if library.hasNext}
			<button type="button" class="nav right fade-idle" aria-label="Next" onclick={() => library.step(1)} {@attach tooltip('Next')}>
				<ChevronRight size={22} />
			</button>
		{/if}
		{#if showStrip}
			<div class="strip fade-idle" transition:fly={{ y: 16, duration: 200 }}>
				<Filmstrip />
			</div>
		{/if}
		{#if item.kind === 'image' && activePhoto.viewport}
			<div class="zoom fade-idle">
				<ZoomControls viewport={activePhoto.viewport} />
			</div>
		{/if}
	</div>
	{#if chrome.details && item.kind === 'image'}
		<PhotoDetails {item} />
	{/if}
</div>

<style>
	.nav {
		position: absolute;
		top: 50%;
		display: grid;
		height: 44px;
		width: 44px;
		place-items: center;
		translate: 0 -50%;
		border-radius: var(--radius-pill);
		background: var(--control);
		color: var(--text);
		box-shadow: 0 6px 22px var(--shadow-soft);
		backdrop-filter: blur(18px);
		transition:
			opacity 240ms var(--ease),
			background-color 160ms var(--ease),
			transform 160ms var(--ease);
	}

	.nav:hover {
		background: var(--control-hover);
	}

	.nav:active {
		transform: scale(0.94);
	}

	.left {
		left: 16px;
	}

	.right {
		right: 16px;
	}

	.with-strip {
		--strip-space: 96px;
	}

	.strip {
		position: absolute;
		right: 16px;
		bottom: 16px;
		left: 16px;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.strip > :global(*) {
		pointer-events: auto;
	}

	.zoom {
		position: absolute;
		right: 16px;
		bottom: calc(16px + var(--strip-space, 0px));
	}
</style>
