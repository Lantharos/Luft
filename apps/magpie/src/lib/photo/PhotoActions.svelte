<script lang="ts">
	import { MenuItem, tooltip } from '@luft/ui';
	import Info from '@lucide/svelte/icons/info';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import * as api from '#lib/api.js';
	import { chrome } from '#lib/app/chrome.svelte.js';
	import MoreMenu from '#lib/shell/MoreMenu.svelte';
	import { activePhoto } from './active.svelte';
	import { copyImage } from './clipboard';
	import { slideshow } from './slideshow.svelte';

	async function copy() {
		if (!activePhoto.source) return;
		await copyImage(activePhoto.source).then(
			() => chrome.notify('Copied'),
			() => chrome.notify("This image couldn't be copied")
		);
	}

	async function useAsWallpaper() {
		const item = activePhoto.item;
		if (!item) return;
		await api.setWallpaper(item.path).then(
			(style) => chrome.notify(style === 'dark' ? 'Set as your dark style wallpaper' : 'Set as your light style wallpaper'),
			() => chrome.notify("The wallpaper couldn't be changed")
		);
	}
</script>

<button type="button" class="icon-button" aria-label="Rotate left" disabled={!activePhoto.viewport} onclick={() => activePhoto.viewport?.rotate(-1)} {@attach tooltip('Rotate left')}>
	<RotateCcw size={17} />
</button>
<button type="button" class="icon-button" aria-label="Rotate right" disabled={!activePhoto.viewport} onclick={() => activePhoto.viewport?.rotate(1)} {@attach tooltip('Rotate right')}>
	<RotateCw size={17} />
</button>
<button
	type="button"
	class="icon-button"
	aria-label="Details"
	aria-pressed={chrome.details}
	class:active={chrome.details}
	onclick={() => (chrome.details = !chrome.details)}
	{@attach tooltip('Details')}
>
	<Info size={17} />
</button>
<MoreMenu>
	{#snippet children(close)}
		<MenuItem
			onclick={() => {
				close();
				slideshow.start();
			}}>Slideshow</MenuItem
		>
		<MenuItem
			disabled={!activePhoto.source}
			onclick={() => {
				close();
				void copy();
			}}>Copy</MenuItem
		>
		<MenuItem
			disabled={!activePhoto.item}
			onclick={() => {
				close();
				void useAsWallpaper();
			}}>Set as wallpaper</MenuItem
		>
		<MenuItem
			disabled={!activePhoto.viewport}
			onclick={() => {
				close();
				activePhoto.viewport?.flip();
			}}>Flip horizontally</MenuItem
		>
	{/snippet}
</MoreMenu>

<style>
	.active {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
