<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import Film from '@lucide/svelte/icons/film';
	import { thumbnail, type Wallpaper } from './api';

	interface Props {
		wallpaper: Wallpaper;
		selected: boolean;
		onselect: () => void;
	}

	let { wallpaper, selected, onselect }: Props = $props();

	let tile = $state<HTMLButtonElement>();
	let source = $state<string | null>(null);

	$effect(() => {
		const observer = new IntersectionObserver(async ([entry]) => {
			if (!entry.isIntersecting) return;
			observer.disconnect();
			source = fileUrl(await thumbnail(wallpaper.path));
		}, { rootMargin: '200px' });
		observer.observe(tile!);
		return () => observer.disconnect();
	});
</script>

<button bind:this={tile} type="button" class="tile" class:selected aria-label={wallpaper.live ? `${wallpaper.name}, video` : wallpaper.name} aria-pressed={selected} onclick={onselect}>
	{#if source}
		<img src={source} alt="" decoding="async" />
	{/if}
	{#if wallpaper.live}
		<Film size={14} class="live" aria-hidden="true" />
	{/if}
</button>

<style>
	.tile {
		position: relative;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-radius: 14px;
		background: var(--control);
		transition: transform 180ms var(--ease), box-shadow 180ms var(--ease);
	}

	.tile:hover {
		transform: scale(1.02);
	}

	.tile.selected {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--accent);
	}

	.tile :global(.live) {
		position: absolute;
		right: 8px;
		bottom: 8px;
		color: rgba(255, 255, 255, 0.9);
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		animation: appear 240ms var(--ease);
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
