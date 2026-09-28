<script lang="ts">
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import { Row, Section, Segmented, Select, Slider, Switch } from '@luft/ui';
	import { percent } from '$lib/format';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { chooseImage, wallpapers, type Wallpaper } from './api';
	import WallpaperTile from './WallpaperTile.svelte';

	type Interface = {
		'color-scheme': string;
		'text-scaling-factor': number;
		'enable-animations': boolean;
		'cursor-size': number;
	};
	type Background = {
		'picture-uri': string;
		'picture-uri-dark': string;
		'picture-options': string;
	};

	const FIT_OPTIONS = [
		{ value: 'zoom', label: 'Fill' },
		{ value: 'scaled', label: 'Fit' },
		{ value: 'centered', label: 'Center' },
		{ value: 'stretched', label: 'Stretch' },
		{ value: 'wallpaper', label: 'Tile' },
		{ value: 'spanned', label: 'Span displays' }
	];
	const CURSOR_SIZES = [
		{ value: 24, label: 'Default' },
		{ value: 32, label: 'Medium' },
		{ value: 48, label: 'Large' },
		{ value: 64, label: 'Larger' },
		{ value: 96, label: 'Largest' }
	];

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['color-scheme', 'text-scaling-factor', 'enable-animations', 'cursor-size']);
	const background = useSettings<Background>('org.gnome.desktop.background', ['picture-uri', 'picture-uri-dark', 'picture-options']);

	let found = $state<Wallpaper[]>([]);

	let current = $derived(uriToPath(background.values['picture-uri'] ?? ''));
	let available = $derived(
		current && !found.some((wallpaper) => isCurrent(wallpaper))
			? [{ path: current, darkPath: null, name: 'Current wallpaper' }, ...found]
			: found
	);
	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');

	function uriToPath(uri: string) {
		return uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri;
	}

	function pathToUri(path: string) {
		return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
	}

	function isCurrent(wallpaper: Wallpaper) {
		return wallpaper.path === current || wallpaper.darkPath === current;
	}

	async function setWallpaper(wallpaper: Wallpaper) {
		await background.set('picture-uri', pathToUri(wallpaper.path));
		await background.set('picture-uri-dark', pathToUri(wallpaper.darkPath ?? wallpaper.path));
	}

	async function addWallpaper() {
		const uri = await chooseImage();
		if (uri) await setWallpaper({ path: uriToPath(uri), darkPath: null, name: '' });
	}

	void wallpapers().then((list) => (found = list));
</script>

<Section title="Style">
	<Row title="Appearance" description="Apps that follow the system switch between light and dark with it">
		<Segmented
			label="Style"
			options={[
				{ value: 'light', label: 'Light' },
				{ value: 'dark', label: 'Dark' }
			]}
			value={dark ? 'dark' : 'light'}
			onchange={(style) => desktop.set('color-scheme', style === 'dark' ? 'prefer-dark' : 'default')}
		/>
	</Row>
	<Row title="Accent color" description="Picked from your wallpaper and used across the desktop and apps">
		<span class="h-6 w-6 rounded-full" style:background="var(--accent)"></span>
	</Row>
</Section>

<Section title="Wallpaper">
	<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-4">
		{#each available as wallpaper (wallpaper.path)}
			<WallpaperTile {wallpaper} selected={isCurrent(wallpaper)} onselect={() => setWallpaper(wallpaper)} />
		{/each}
		<button type="button" class="add-tile" onclick={addWallpaper}>
			<ImagePlus size={22} />
			<span>Add picture</span>
		</button>
	</div>
	<Row title="Fit" description="How pictures that don't match the display's shape are shown">
		<Select label="Fit" options={FIT_OPTIONS} value={background.values['picture-options'] ?? 'zoom'} onchange={(value) => background.set('picture-options', value)} />
	</Row>
</Section>

<Section title="Text and motion">
	<Row title="Text size" description="Makes text larger or smaller across apps">
		<span class="w-12 text-right tabular-nums">{percent(desktop.values['text-scaling-factor'] ?? 1)}</span>
		{#snippet below()}
			<Slider
				label="Text size"
				min={0.8}
				max={1.6}
				step={0.05}
				value={desktop.values['text-scaling-factor'] ?? 1}
				format={percent}
				onchange={(value) => desktop.set('text-scaling-factor', value)}
			/>
		{/snippet}
	</Row>
	<Row title="Animations" description="Windows, menus, and panels move instead of appearing instantly">
		<Switch label="Animations" checked={desktop.values['enable-animations'] ?? true} onchange={(on) => desktop.set('enable-animations', on)} />
	</Row>
	<Row title="Pointer size">
		<Select label="Pointer size" options={CURSOR_SIZES} value={desktop.values['cursor-size'] ?? 24} onchange={(size) => desktop.set('cursor-size', size)} />
	</Row>
</Section>

<style>
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
