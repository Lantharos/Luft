import Clock from '@luft/symbols/icons/clock';
import Trash from '@luft/symbols/icons/trash';
import { t } from '@luft/i18n';
import { basename } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { FileEntry, Place, SidebarEntry, UserDirs } from '#lib/bindings.js';
import { folderLooks } from '#lib/features/looks/looks.svelte.js';
import { settings } from '#lib/state/settings.svelte.js';
import { fileKind } from '#lib/utils/kinds.js';

export const PLACES: Place[] = ['home', 'recent', 'documents', 'downloads', 'music', 'pictures', 'videos', 'trash'];

export type SidebarRow = { key: string; entry: SidebarEntry; path: string | null; label: string };

export function isView(place: Place): place is 'recent' | 'trash' {
	return place === 'recent' || place === 'trash';
}

export function placePath(place: Place, dirs: UserDirs | null): string | null {
	if (!dirs || isView(place)) return null;
	if (place === 'home') return dirs.home;
	const path = dirs[place];
	return path && path !== dirs.home ? path : null;
}

export function placeLabel(place: Place, dirs: UserDirs | null) {
	if (place === 'home') return t('rover-place-home');
	if (place === 'recent') return t('rover-place-recent');
	if (place === 'trash') return t('rover-place-trash');
	return basename(placePath(place, dirs) ?? place);
}

export function placeArt(place: Place, dirs: UserDirs | null) {
	if (place === 'recent') return { icon: Clock };
	if (place === 'trash') return { icon: Trash };
	return folderLooks.art(placePath(place, dirs)!);
}

function keyOf(entry: SidebarEntry) {
	return entry.kind === 'place' ? entry.place : entry.path;
}

function available(place: Place, dirs: UserDirs | null) {
	return isView(place) || placePath(place, dirs) !== null;
}

export function rows(dirs: UserDirs | null): SidebarRow[] {
	return settings.value.sidebar.flatMap((entry): SidebarRow[] => {
		if (entry.kind === 'pinned') return [{ key: entry.path, entry, path: entry.path, label: entry.name }];
		if (!available(entry.place, dirs)) return [];
		return [{ key: entry.place, entry, path: placePath(entry.place, dirs), label: placeLabel(entry.place, dirs) }];
	});
}

function placeAt(path: string, dirs: UserDirs | null) {
	return PLACES.find((place) => placePath(place, dirs) === path) ?? null;
}

export function contains(path: string, dirs: UserDirs | null) {
	const place = placeAt(path, dirs);
	return settings.value.sidebar.some((entry) => (place ? entry.kind === 'place' && entry.place === place : entry.kind === 'pinned' && entry.path === path));
}

export function missing(dirs: UserDirs | null) {
	const present = new Set(settings.value.sidebar.map(keyOf));
	return PLACES.filter((place) => !present.has(place) && available(place, dirs));
}

function pinned(entry: FileEntry): SidebarEntry {
	return { kind: 'pinned', name: entry.name, path: entry.path, isDir: entry.isDir, icon: fileKind(entry) };
}

function insert(entries: SidebarEntry[], before: string | null) {
	settings.update((current) => {
		const present = new Set(current.sidebar.map(keyOf));
		const fresh = entries.filter((entry) => !present.has(keyOf(entry)));
		const sidebar = [...current.sidebar];
		const index = before ? sidebar.findIndex((entry) => keyOf(entry) === before) : -1;
		sidebar.splice(index === -1 ? sidebar.length : index, 0, ...fresh);
		return { ...current, sidebar };
	});
}

export async function add(paths: string[], known: FileEntry[], dirs: UserDirs | null) {
	const byPath = new Map(known.map((entry) => [entry.path, entry]));
	const entries = await Promise.all(
		paths.map(async (path): Promise<SidebarEntry | null> => {
			const place = placeAt(path, dirs);
			if (place) return { kind: 'place', place };
			const entry = byPath.get(path) ?? (await commands.getFileInfo({ path }).catch(() => null));
			return entry && pinned(entry);
		})
	);
	insert(entries.filter((entry) => entry !== null), null);
}

export function restore(place: Place) {
	const present = new Set(settings.value.sidebar.map(keyOf));
	const next = PLACES.slice(PLACES.indexOf(place) + 1).find((later) => present.has(later)) ?? null;
	insert([{ kind: 'place', place }], next);
}

export function remove(key: string) {
	settings.update((current) => ({ ...current, sidebar: current.sidebar.filter((entry) => keyOf(entry) !== key) }));
}

export function removePath(path: string, dirs: UserDirs | null) {
	remove(placeAt(path, dirs) ?? path);
}

export function move(key: string, before: string | null) {
	settings.update((current) => {
		const sidebar = [...current.sidebar];
		const from = sidebar.findIndex((entry) => keyOf(entry) === key);
		if (from === -1) return current;
		const [moved] = sidebar.splice(from, 1);
		const to = before ? sidebar.findIndex((entry) => keyOf(entry) === before) : -1;
		sidebar.splice(to === -1 ? sidebar.length : to, 0, moved);
		return { ...current, sidebar };
	});
}

export function opensFolder(entry: SidebarEntry) {
	return entry.kind === 'pinned' ? entry.isDir : !isView(entry.place);
}
