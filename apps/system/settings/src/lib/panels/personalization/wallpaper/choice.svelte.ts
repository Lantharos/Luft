import { t } from '@luft/i18n';
import { commands } from '#lib/bindings.js';
import type { Focus, Wallpaper } from '#lib/bindings.js';
import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
import { CENTER, pathToUri, uriToPath } from './api';

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

export function useWallpaperChoice() {
	const background = useSettings<Background>('org.gnome.desktop.background', ['picture-uri', 'picture-uri-dark', 'picture-options']);
	const kestrel = useSettings<Kestrel>(KESTREL_SCHEMA, ['live-wallpaper', 'live-wallpaper-dark', 'wallpaper-focus', 'wallpaper-focus-dark', 'wallpaper-focus-chosen']);
	const desktop = useSettings<{ 'color-scheme': string }>('org.gnome.desktop.interface', ['color-scheme']);

	let dark = $derived(desktop.values['color-scheme'] === 'prefer-dark');
	let pictureKey = $derived<'picture-uri' | 'picture-uri-dark'>(dark ? 'picture-uri-dark' : 'picture-uri');
	let liveKey = $derived<'live-wallpaper' | 'live-wallpaper-dark'>(dark ? 'live-wallpaper-dark' : 'live-wallpaper');
	let focusKey = $derived<'wallpaper-focus' | 'wallpaper-focus-dark'>(dark ? 'wallpaper-focus-dark' : 'wallpaper-focus');
	let live = $derived(kestrel.values[liveKey] ?? '');
	let currentUri = $derived(live || (background.values[pictureKey] ?? ''));
	let current = $derived(uriToPath(currentUri));
	let focus = $derived(kestrel.values[focusKey] ?? CENTER);
	let chosen = $derived(kestrel.values['wallpaper-focus-chosen'] ?? {});

	return {
		get dark() {
			return dark;
		},
		get current() {
			return current;
		},
		get currentWallpaper(): Wallpaper {
			return { path: current, name: t('settings-appearance-wallpaper-current'), live: !!live };
		},
		get focus() {
			return focus;
		},
		get fit() {
			return background.values['picture-options'] ?? 'zoom';
		},
		setFit: (fit: string) => background.set('picture-options', fit),
		focusOf(wallpaper: Wallpaper): Focus | undefined {
			return wallpaper.path === current ? focus : chosen[pathToUri(wallpaper.path)];
		},
		async choose(wallpaper: Wallpaper) {
			const uri = pathToUri(wallpaper.path);
			const position = chosen[uri] ?? (await commands.appearanceWallpaperFocus({ path: wallpaper.path }));
			if (wallpaper.live) {
				await kestrel.set(liveKey, uri);
			} else {
				await background.set(pictureKey, uri);
				await kestrel.set(liveKey, '');
			}
			await kestrel.set(focusKey, position);
		},
		async reposition(position: Focus) {
			await kestrel.set(focusKey, position);
			await kestrel.set('wallpaper-focus-chosen', { ...chosen, [currentUri]: position });
		}
	};
}

export type WallpaperChoice = ReturnType<typeof useWallpaperChoice>;
