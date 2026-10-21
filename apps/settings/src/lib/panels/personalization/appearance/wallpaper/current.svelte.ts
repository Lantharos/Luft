import { fileUrl } from '@lantharos/sabine';
import { useSettings } from '#lib/state/gsettings.svelte.js';
import { thumbnail, uriToPath } from './api';

type Background = { 'picture-uri': string; 'picture-uri-dark': string };
type Wallpapers = { 'live-wallpaper': string; 'live-wallpaper-dark': string };

export function currentWallpaper() {
	const wallpapers = useSettings<Wallpapers>('com.lantharos.kestrel', ['live-wallpaper', 'live-wallpaper-dark']);
	const background = useSettings<Background>('org.gnome.desktop.background', ['picture-uri', 'picture-uri-dark']);
	const desktop = useSettings<{ 'color-scheme': string }>('org.gnome.desktop.interface', ['color-scheme']);
	const current = $state<{ url: string | null }>({ url: null });

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let path = $derived(
		uriToPath(
			(dark ? wallpapers.values['live-wallpaper-dark'] : wallpapers.values['live-wallpaper']) ||
				((dark ? background.values['picture-uri-dark'] : background.values['picture-uri']) ?? '')
		)
	);

	$effect(() => {
		const wanted = path;
		if (!wanted) {
			current.url = null;
			return;
		}
		void thumbnail(wanted).then((thumb) => {
			if (wanted === path) current.url = fileUrl(thumb);
		});
	});

	return current;
}
