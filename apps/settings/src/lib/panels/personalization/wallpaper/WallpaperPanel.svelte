<script lang="ts">
	import { t } from '@luft/i18n';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import { Row, Section, Select } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { openFolder } from './api';
	import type { WallpaperChoice } from './choice.svelte';
	import GroupRow from './grid/GroupRow.svelte';
	import WallpaperGrid from './grid/WallpaperGrid.svelte';
	import LiveWallpaperOnBattery from './LiveWallpaperOnBattery.svelte';
	import { wallpaperLibrary } from './library.svelte';
	import WallpaperPreview from './WallpaperPreview.svelte';

	interface Props {
		choice: WallpaperChoice;
		shape: number;
		onopen: (group: string) => void;
	}

	let { choice, shape, onopen }: Props = $props();

	let fitOptions = $derived([
		{ value: 'zoom', label: t('settings-appearance-wallpaper-fill') },
		{ value: 'scaled', label: t('settings-appearance-wallpaper-fit') },
		{ value: 'centered', label: t('settings-appearance-wallpaper-center') },
		{ value: 'stretched', label: t('settings-appearance-wallpaper-stretch') },
		{ value: 'wallpaper', label: t('settings-appearance-wallpaper-tile') },
		{ value: 'spanned', label: t('settings-appearance-wallpaper-span') }
	]);

	let available = $derived(
		choice.current && wallpaperLibrary.loaded && !wallpaperLibrary.includes(choice.current) ? [choice.currentWallpaper, ...wallpaperLibrary.loose] : wallpaperLibrary.loose
	);
</script>

<Section description={choice.dark ? t('settings-appearance-wallpaper-dark-description') : t('settings-appearance-wallpaper-light-description')}>
	{#if choice.current}
		<div class="px-4 pt-4">
			<WallpaperPreview path={choice.current} focus={choice.focus} fill={choice.fit === 'zoom'} {shape} onchange={choice.reposition} />
		</div>
	{/if}
	{#if wallpaperLibrary.empty}
		<p class="empty">{t('settings-appearance-wallpaper-empty')}</p>
	{/if}
	<WallpaperGrid wallpapers={available} {choice} {shape}>
		<button type="button" class="add-tile" style:aspect-ratio={shape} onclick={() => commands.appearanceAddWallpapers()}>
			<ImagePlus size={22} />
			<span>{t('settings-appearance-wallpaper-add')}</span>
		</button>
	</WallpaperGrid>
</Section>

{#if wallpaperLibrary.groups.length}
	<Section>
		{#each wallpaperLibrary.groups as group (group.id)}
			<GroupRow {group} current={choice.current} {shape} onopen={() => onopen(group.id)} />
		{/each}
	</Section>
{/if}

<Section>
	<Row title={t('settings-appearance-wallpaper-folder')} description={t('settings-appearance-wallpaper-folder-description')} icon={FolderOpen} onclick={openFolder} />
	<Row title={t('settings-appearance-wallpaper-fit-title')} description={t('settings-appearance-wallpaper-fit-description')}>
		<Select label={t('settings-appearance-wallpaper-fit-title')} options={fitOptions} value={choice.fit} onchange={choice.setFit} />
	</Row>
	<LiveWallpaperOnBattery />
</Section>

<style>
	.empty {
		padding: 16px 16px 0;
		font-size: 13px;
		line-height: 1.45;
		color: var(--text-muted);
	}

	.add-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border-radius: 14px;
		background: var(--control);
		font-size: 13px;
		color: var(--text-soft);
		transition: background-color var(--motion-tap) var(--ease-decelerate), transform var(--motion-tap) var(--ease-decelerate);
	}

	.add-tile:hover {
		background: var(--control-hover);
	}

	.add-tile:active {
		transform: scale(0.98);
	}
</style>
