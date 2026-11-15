<script lang="ts">
	import { t } from '@luft/i18n';
	import { MenuItem, tooltip } from '@luft/ui';
	import Info from '@lucide/svelte/icons/info';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import { commands } from '#lib/bindings.js';
	import { canPrint, printCurrent } from '#lib/app/actions.js';
	import { chrome } from '#lib/app/chrome.svelte.js';
	import MoreMenu from '#lib/shell/MoreMenu.svelte';
	import { activePhoto } from './active.svelte';
	import { copyImage } from './clipboard';
	import { slideshow } from './slideshow.svelte';

	async function copy() {
		if (!activePhoto.source) return;
		await copyImage(activePhoto.source).then(
			() => chrome.notify(t('magpie-copied')),
			() => chrome.notify(t('magpie-photo-copy-failed'))
		);
	}

	async function useAsWallpaper() {
		const item = activePhoto.item;
		if (!item) return;
		await commands.setWallpaper({ path: item.path }).then(
			(style) => chrome.notify(style === 'dark' ? t('magpie-photo-wallpaper-dark') : t('magpie-photo-wallpaper-light')),
			() => chrome.notify(t('magpie-photo-wallpaper-failed'))
		);
	}
</script>

<button type="button" class="icon-button" aria-label={t('magpie-photo-rotate-left')} disabled={!activePhoto.viewport} onclick={() => activePhoto.viewport?.rotate(-1)} {@attach tooltip(t('magpie-photo-rotate-left'))}>
	<RotateCcw size={17} />
</button>
<button type="button" class="icon-button" aria-label={t('magpie-photo-rotate-right')} disabled={!activePhoto.viewport} onclick={() => activePhoto.viewport?.rotate(1)} {@attach tooltip(t('magpie-photo-rotate-right'))}>
	<RotateCw size={17} />
</button>
<button
	type="button"
	class="icon-button"
	aria-label={t('magpie-photo-details')}
	aria-pressed={chrome.details}
	class:active={chrome.details}
	onclick={() => (chrome.details = !chrome.details)}
	{@attach tooltip(t('magpie-photo-details'))}
>
	<Info size={17} />
</button>
<MoreMenu>
	{#snippet children(close)}
		<MenuItem
			onclick={() => {
				close();
				slideshow.start();
			}}>{t('magpie-photo-slideshow')}</MenuItem
		>
		<MenuItem
			disabled={!activePhoto.source}
			onclick={() => {
				close();
				void copy();
			}}>{t('magpie-photo-copy')}</MenuItem
		>
		<MenuItem
			disabled={!canPrint()}
			onclick={() => {
				close();
				void printCurrent();
			}}>{t('magpie-print')}</MenuItem
		>
		<MenuItem
			disabled={!activePhoto.item}
			onclick={() => {
				close();
				void useAsWallpaper();
			}}>{t('magpie-photo-wallpaper')}</MenuItem
		>
		<MenuItem
			disabled={!activePhoto.viewport}
			onclick={() => {
				close();
				activePhoto.viewport?.flip();
			}}>{t('magpie-photo-flip')}</MenuItem
		>
	{/snippet}
</MoreMenu>

<style>
	.active {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
