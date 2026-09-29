<script lang="ts">
	import { onDestroy } from 'svelte';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import { Row, Section, Select } from '@luft/ui';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { addWallpapers, onWallpapersChanged, openFolder, wallpapers, type Wallpaper } from './api';
	import LiveWallpaperOnBattery from './LiveWallpaperOnBattery.svelte';
	import WallpaperTile from './WallpaperTile.svelte';

	type Background = {
		'picture-uri': string;
		'picture-uri-dark': string;
		'picture-options': string;
	};
	type Kestrel = {
		'live-wallpaper': string;
		'live-wallpaper-dark': string;
	};

	const FIT_OPTIONS = [
		{ value: 'zoom', label: 'Fill' },
		{ value: 'scaled', label: 'Fit' },
		{ value: 'centered', label: 'Center' },
		{ value: 'stretched', label: 'Stretch' },
		{ value: 'wallpaper', label: 'Tile' },
		{ value: 'spanned', label: 'Span displays' }
	];

	const background = useSettings<Background>('org.gnome.desktop.background', ['picture-uri', 'picture-uri-dark', 'picture-options']);
	const kestrel = useSettings<Kestrel>('com.lantharos.kestrel', ['live-wallpaper', 'live-wallpaper-dark']);
	const desktop = useSettings<{ 'color-scheme': string }>('org.gnome.desktop.interface', ['color-scheme']);

	let found = $state<Wallpaper[] | null>(null);

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let pictureKey = $derived<'picture-uri' | 'picture-uri-dark'>(dark ? 'picture-uri-dark' : 'picture-uri');
	let liveKey = $derived<keyof Kestrel>(dark ? 'live-wallpaper-dark' : 'live-wallpaper');
	let live = $derived(kestrel.values[liveKey] ?? '');
	let current = $derived(uriToPath(live || (background.values[pictureKey] ?? '')));
	let available = $derived(
		current && found && !found.some((wallpaper) => wallpaper.path === current)
			? [{ path: current, name: 'Current wallpaper', live: !!live }, ...found]
			: (found ?? [])
	);

	function uriToPath(uri: string) {
		return uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri;
	}

	function pathToUri(path: string) {
		return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
	}

	async function choose(wallpaper: Wallpaper) {
		const uri = pathToUri(wallpaper.path);
		if (wallpaper.live) {
			await kestrel.set(liveKey, uri);
			return;
		}
		await background.set(pictureKey, uri);
		await kestrel.set(liveKey, '');
	}

	void wallpapers().then((list) => (found = list));
	onDestroy(onWallpapersChanged((list) => (found = list)));
</script>

<Section title="Wallpaper" description={dark ? 'Shown while the dark style is on' : 'Shown while the light style is on'}>
	{#if found?.length === 0}
		<p class="empty">Images and videos in the Wallpapers folder in your Pictures show up here.</p>
	{/if}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-4">
		{#each available as wallpaper (wallpaper.path)}
			<WallpaperTile {wallpaper} selected={wallpaper.path === current} onselect={() => choose(wallpaper)} />
		{/each}
		<button type="button" class="add-tile" onclick={addWallpapers}>
			<ImagePlus size={22} />
			<span>Add wallpapers</span>
		</button>
	</div>
	<Row title="Wallpapers folder" description="Pictures › Wallpapers" icon={FolderOpen} onclick={openFolder} />
	<Row title="Fit" description="How wallpapers that don't match the display's shape are shown">
		<Select label="Fit" options={FIT_OPTIONS} value={background.values['picture-options'] ?? 'zoom'} onchange={(value) => background.set('picture-options', value)} />
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
		aspect-ratio: 16 / 10;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border-radius: 14px;
		background: var(--control);
		font-size: 13px;
		color: var(--text-soft);
		transition: background-color 160ms var(--ease), transform 180ms var(--ease);
	}

	.add-tile:hover {
		background: var(--control-hover);
		transform: scale(1.02);
	}
</style>
