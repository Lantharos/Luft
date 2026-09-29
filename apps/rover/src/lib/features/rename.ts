import type { FileEntry } from '$lib/types';

export type RenameMode = 'replace' | 'number' | 'case';
export type Casing = 'lower' | 'upper' | 'title' | 'sentence';

export interface RenameOptions {
	mode: RenameMode;
	find: string;
	replacement: string;
	matchCase: boolean;
	base: string;
	start: number;
	digits: number;
	casing: Casing;
}

export interface RenamePreview {
	entry: FileEntry;
	name: string;
	problem: string | null;
}

export function previewRenames(entries: FileEntry[], siblings: FileEntry[], options: RenameOptions): RenamePreview[] {
	const names = entries.map((entry, index) => {
		const [stem, extension] = splitName(entry);
		return transform(stem, index, options) + extension;
	});
	const renamed = new Set(entries.map((entry) => entry.path));
	const taken = new Set(siblings.filter((sibling) => !renamed.has(sibling.path)).map((sibling) => sibling.name));
	const counts = new Map<string, number>();
	for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1);
	return entries.map((entry, index) => {
		const name = names[index];
		return { entry, name, problem: problemFor(name, counts, taken) };
	});
}

function problemFor(name: string, counts: Map<string, number>, taken: Set<string>) {
	if (!name.trim() || name === '.' || name === '..') return 'Empty name';
	if (name.includes('/')) return 'Names can’t contain /';
	if ((counts.get(name) ?? 0) > 1) return 'Used more than once';
	if (taken.has(name)) return 'Already in this folder';
	return null;
}

function splitName(entry: FileEntry): [string, string] {
	const dot = entry.name.lastIndexOf('.');
	return entry.is_dir || dot <= 0 ? [entry.name, ''] : [entry.name.slice(0, dot), entry.name.slice(dot)];
}

function transform(stem: string, index: number, options: RenameOptions) {
	if (options.mode === 'replace') return replaceText(stem, options);
	if (options.mode === 'number') {
		const number = String(options.start + index).padStart(options.digits, '0');
		return options.base.trim() ? `${options.base.trimEnd()} ${number}` : number;
	}
	return changeCase(stem, options.casing);
}

function replaceText(stem: string, { find, replacement, matchCase }: RenameOptions) {
	if (!find) return stem;
	const pattern = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
	return stem.replace(pattern, () => replacement);
}

function changeCase(stem: string, casing: Casing) {
	if (casing === 'lower') return stem.toLocaleLowerCase();
	if (casing === 'upper') return stem.toLocaleUpperCase();
	const lowered = stem.toLocaleLowerCase();
	if (casing === 'sentence') return lowered.charAt(0).toLocaleUpperCase() + lowered.slice(1);
	return lowered.replace(/(^|[\s_\-.])(\p{L})/gu, (_, separator: string, letter: string) => separator + letter.toLocaleUpperCase());
}
