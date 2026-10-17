<script lang="ts">
	import { onDestroy } from 'svelte';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import { Row, Section, Select } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { addWallpapers, CENTER, onWallpapersChanged, openFolder, pathToUri, uriToPath, wallpaperFocus, wallpapers, type Focus, type Wallpaper } from './api';
	import LiveWallpaperOnBattery from './LiveWallpaperOnBattery.svelte';
	import { useScreenShape } from './screen.svelte.js';
	import WallpaperPreview from './WallpaperPreview.svelte';
	import WallpaperTile from './WallpaperTile.svelte';

	type Background = {
		'picture-uri': string;
		'picture-uri-dark': string;
		'picture-options': string;
	};
	type Kestrel = {
		'live-wallpaper': string;
		'live-wallpaper-dark': string;
		'wallpaper-focus': Focus;
		'wallpaper-focus-dark': Focus;
		'wallpaper-focus-chosen': Record<string, Focus>;
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
	const kestrel = useSettings<Kestrel>('com.lantharos.kestrel', ['live-wallpaper', 'live-wallpaper-dark', 'wallpaper-focus', 'wallpaper-focus-dark', 'wallpaper-focus-chosen']);
	const screen = useScreenShape();
	const desktop = useSettings<{ 'color-scheme': string }>('org.gnome.desktop.interface', ['color-scheme']);

	let found = $state<Wallpaper[] | null>(null);

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let pictureKey = $derived<'picture-uri' | 'picture-uri-dark'>(dark ? 'picture-uri-dark' : 'picture-uri');
	let liveKey = $derived<'live-wallpaper' | 'live-wallpaper-dark'>(dark ? 'live-wallpaper-dark' : 'live-wallpaper');
	let focusKey = $derived<'wallpaper-focus' | 'wallpaper-focus-dark'>(dark ? 'wallpaper-focus-dark' : 'wallpaper-focus');
	let live = $derived(kestrel.values[liveKey] ?? '');
	let currentUri = $derived(live || (background.values[pictureKey] ?? ''));
	let current = $derived(uriToPath(currentUri));
	let focus = $derived(kestrel.values[focusKey] ?? CENTER);
	let chosen = $derived(kestrel.values['wallpaper-focus-chosen'] ?? {});
	let fill = $derived((background.values['picture-options'] ?? 'zoom') === 'zoom');
	let available = $derived(
		current && found && !found.some((wallpaper) => wallpaper.path === current)
			? [{ path: current, name: 'Current wallpaper', live: !!live }, ...found]
			: (found ?? [])
	);

	async function choose(wallpaper: Wallpaper) {
		const uri = pathToUri(wallpaper.path);
		const position = chosen[uri] ?? (await wallpaperFocus(wallpaper.path));
		if (wallpaper.live) {
			await kestrel.set(liveKey, uri);
		} else {
			await background.set(pictureKey, uri);
			await kestrel.set(liveKey, '');
		}
		await kestrel.set(focusKey, position);
	}

	async function reposition(position: Focus) {
		await kestrel.set(focusKey, position);
		await kestrel.set('wallpaper-focus-chosen', { ...chosen, [currentUri]: position });
	}

	function tileFocus(wallpaper: Wallpaper) {
		return wallpaper.path === current ? focus : chosen[pathToUri(wallpaper.path)];
	}

	void wallpapers().then((list) => (found = list));
	onDestroy(onWallpapersChanged((list) => (found = list)));
</script>

<Section title="Wallpaper" description={dark ? 'Shown while the dark style is on' : 'Shown while the light style is on'}>
	{#if current}
		<div class="px-4 pt-4">
			<WallpaperPreview path={current} {focus} {fill} shape={screen.aspect} onchange={reposition} />
		</div>
	{/if}
	{#if found?.length === 0}
		<p class="empty">Images and videos in the Wallpapers folder in your Pictures show up here.</p>
	{/if}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(var(--tile),1fr))] gap-3 p-4" style:--tile="{Math.round(120 * Math.sqrt(screen.aspect))}px">
		{#each available as wallpaper (wallpaper.path)}
			<WallpaperTile {wallpaper} selected={wallpaper.path === current} focus={tileFocus(wallpaper)} shape={screen.aspect} onselect={() => choose(wallpaper)} />
		{/each}
		<button type="button" class="add-tile" style:aspect-ratio={screen.aspect} onclick={addWallpapers}>
			<ImagePlus size={22} />
			<span>Add wallpapers</span>
		</button>
	</div>
	<Row title="Wallpapers folder" description="Pictures › Wallpapers" icon={FolderOpen} onclick={openFolder} />
	<Row title="Fit" description="For wallpapers that don’t match the display’s shape">
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
