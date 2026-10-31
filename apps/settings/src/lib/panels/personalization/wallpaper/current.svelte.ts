import { fileUrl } from '@lantharos/sabine';
import { commands } from '#lib/bindings.js';
import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
import { uriToPath } from './api';

type Background = { 'picture-uri': string; 'picture-uri-dark': string };
type Wallpapers = { 'live-wallpaper': string; 'live-wallpaper-dark': string };

function wallpaperPath(scheme?: 'light' | 'dark') {
	const wallpapers = useSettings<Wallpapers>(KESTREL_SCHEMA, ['live-wallpaper', 'live-wallpaper-dark']);
	const background = useSettings<Background>('org.gnome.desktop.background', ['picture-uri', 'picture-uri-dark']);
	const desktop = useSettings<{ 'color-scheme': string }>('org.gnome.desktop.interface', ['color-scheme']);

	let dark = $derived(scheme ? scheme === 'dark' : desktop.values['color-scheme'] === 'prefer-dark');
	let path = $derived(
		uriToPath(
			(dark ? wallpapers.values['live-wallpaper-dark'] : wallpapers.values['live-wallpaper']) ||
				((dark ? background.values['picture-uri-dark'] : background.values['picture-uri']) ?? '')
		)
	);

	return {
		get path() {
			return path;
		}
	};
}

export function currentWallpaper(scheme?: 'light' | 'dark') {
	const wallpaper = wallpaperPath(scheme);
	const current = $state<{ url: string | null }>({ url: null });

	$effect(() => {
		const wanted = wallpaper.path;
		if (!wanted) {
			current.url = null;
			return;
		}
		void commands.appearanceThumbnail({ path: wanted }).then((thumb) => {
			if (wanted === wallpaper.path) current.url = fileUrl(thumb);
		});
	});

	return current;
}

export function wallpaperName() {
	const wallpaper = wallpaperPath();
	let name = $derived(
		wallpaper.path
			.split('/')
			.pop()!
			.replace(/\.[^.]+$/, '')
	);

	return {
		get name() {
			return name;
		}
	};
}
