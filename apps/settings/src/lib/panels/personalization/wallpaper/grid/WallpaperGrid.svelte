<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Wallpaper } from '#lib/bindings.js';
	import type { WallpaperChoice } from '../choice.svelte';
	import WallpaperTile from './WallpaperTile.svelte';

	interface Props {
		wallpapers: Wallpaper[];
		choice: WallpaperChoice;
		shape: number;
		children?: Snippet;
	}

	let { wallpapers, choice, shape, children }: Props = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(var(--tile),1fr))] gap-3 p-4" style:--tile="{Math.round(120 * Math.sqrt(shape))}px">
	{#each wallpapers as wallpaper (wallpaper.path)}
		<WallpaperTile {wallpaper} selected={wallpaper.path === choice.current} focus={choice.focusOf(wallpaper)} {shape} onselect={() => choice.choose(wallpaper)} />
	{/each}
	{@render children?.()}
</div>
