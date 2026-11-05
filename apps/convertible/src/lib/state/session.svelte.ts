import { SvelteMap } from 'svelte/reactivity';
import { commands, type AppState, type Edits, type Family, type FileEntry, type NewItem, type Options, type Preferences, type Preset, type Target } from '#lib/bindings.js';
import { capabilities } from './capabilities.svelte';
import { defaultOptions, noEdits } from './defaults';
import { queue } from './queue.svelte';

export type View = 'convert' | 'edit' | 'queue';

export interface Pending {
	items: NewItem[];
	conflicts: string[];
}

const COMBINES: readonly string[] = ['pdf'];

class Session {
	files = $state.raw<FileEntry[]>([]);
	roots = $state.raw<string[]>([]);
	selected = $state<string | null>(null);
	view = $state<View>('convert');
	single = $state(false);
	choices = $state<Partial<Record<Family, string>>>({});
	options = $state<Record<Family, Options>>({
		image: defaultOptions(),
		video: defaultOptions(),
		audio: defaultOptions(),
		document: defaultOptions(),
		sheet: defaultOptions(),
		archive: defaultOptions(),
		font: defaultOptions()
	});
	overrides = new SvelteMap<string, string>();
	edits = new SvelteMap<string, Edits>();
	combine = $state(true);
	pack = $state<string | null>(null);
	preferences = $state<Preferences>({ folder: null, keepTimes: false });
	presets = $state.raw<Preset[]>([]);
	archiveTargets = $state.raw<Target[]>([]);
	pdfTarget = $state.raw<Target[]>([]);
	pending = $state.raw<Pending | null>(null);
	showUnsupported = $state(false);
	closing = $state(false);

	families = $derived([...new Set(this.files.flatMap((file) => (file.family ? [file.family] : [])))]);
	current = $derived(this.files.find((file) => file.path === this.selected) ?? this.files[0] ?? null);
	unknown = $derived(this.files.filter((file) => !file.format));
	jobs = $derived.by(() => {
		if (this.pack) return 1;
		const chosen = this.files.filter((file) => this.targetOf(file) !== null).length;
		const combined = this.#combined('pdf')?.length ?? 0;
		return combined ? chosen - combined + 1 : chosen;
	});

	start(state: AppState) {
		this.preferences = state.preferences;
		this.presets = state.presets;
		this.archiveTargets = state.archiveTargets;
		this.pdfTarget = state.pdfTarget;
		if (state.launchPaths.length) void this.open(state.launchPaths, true);
	}

	async open(paths: string[], fromFileManager = false) {
		if (!paths.length) return;
		const found = await commands.describeFiles({ paths });
		const known = new Set(this.files.map((file) => file.path));
		this.files = [...this.files, ...found.filter((file) => !known.has(file.path))];
		this.roots = [...new Set([...this.roots, ...paths])];
		this.single = fromFileManager && this.files.length === 1;
		this.selected ??= this.files[0]?.path ?? null;
		if (this.view === 'queue' && this.files.length) this.view = 'convert';
		void capabilities.load();
		return found;
	}

	clear() {
		this.files = [];
		this.roots = [];
		this.selected = null;
		this.overrides.clear();
		this.edits.clear();
		this.choices = {};
		this.pack = null;
		this.view = queue.items.length ? 'queue' : 'convert';
	}

	remove(path: string) {
		this.files = this.files.filter((file) => file.path !== path);
		this.roots = this.roots.filter((root) => root !== path);
		this.overrides.delete(path);
		this.edits.delete(path);
		if (this.selected === path) this.selected = this.files[0]?.path ?? null;
		if (!this.files.length) this.view = 'convert';
	}

	targetOf(file: FileEntry) {
		const override = this.overrides.get(file.path);
		if (override) return override;
		return file.family ? (this.choices[file.family] ?? null) : null;
	}

	optionsFor(family: Family) {
		return this.options[family];
	}

	editsFor(path: string) {
		return this.edits.get(path) ?? noEdits();
	}

	choose(family: Family, format: string) {
		this.pack = null;
		this.choices[family] = this.choices[family] === format ? undefined : format;
	}

	applyPreset(preset: Preset) {
		const family = this.files.find((file) => file.targets.some((target) => target.id === preset.format))?.family;
		if (!family) return;
		this.choices[family] = preset.format;
		this.options[family] = structuredClone(preset.options);
	}

	savePreset(name: string, family: Family) {
		const format = this.choices[family];
		if (!format) return;
		const preset: Preset = { name, format, options: $state.snapshot(this.optionsFor(family)) as Options };
		this.presets = [...this.presets.filter((item) => item.name !== name), preset];
		void commands.savePresets({ presets: this.presets });
	}

	deletePreset(name: string) {
		this.presets = this.presets.filter((item) => item.name !== name);
		void commands.savePresets({ presets: this.presets });
	}

	setPreferences(change: Partial<Preferences>) {
		Object.assign(this.preferences, change);
		void commands.savePreferences($state.snapshot(this.preferences));
	}

	#item(inputs: string[], format: string, family: Family, subfolder: string | null): NewItem {
		return {
			inputs,
			format,
			folder: this.preferences.folder,
			subfolder: this.preferences.folder ? subfolder : null,
			name: null,
			conflict: 'keepBoth',
			keepTimes: this.preferences.keepTimes,
			options: $state.snapshot(this.optionsFor(family)) as Options,
			edits: $state.snapshot(this.editsFor(inputs[0])) as Edits
		};
	}

	#combined(format: string) {
		const documents = this.files.filter((file) => this.targetOf(file) === format && (file.family === 'image' || file.format === 'pdf'));
		return COMBINES.includes(format) && this.combine && documents.length > 1 ? documents : null;
	}

	buildItems(): NewItem[] {
		if (this.pack) return [this.#item(this.roots, this.pack, 'archive', null)];
		const items: NewItem[] = [];
		const combined = this.#combined('pdf');
		if (combined) items.push({ ...this.#item(combined.map((file) => file.path), 'pdf', 'document', null) });
		for (const file of this.files) {
			const format = this.targetOf(file);
			if (!format || !file.family || combined?.includes(file)) continue;
			items.push(this.#item([file.path], format, file.family, file.subfolder));
		}
		return items;
	}

	async convert() {
		const items = this.buildItems();
		if (!items.length) return;
		const conflicts = await commands.outputConflicts({ items });
		if (conflicts.length) this.pending = { items, conflicts };
		else await this.submit(items);
	}

	async answerConflict(answer: 'keepBoth' | 'replace' | 'skip') {
		const pending = this.pending;
		this.pending = null;
		if (!pending) return;
		if (answer === 'keepBoth') return this.submit(pending.items);
		const conflicted = await Promise.all(pending.items.map(async (item) => (await commands.outputConflicts({ items: [item] })).length > 0));
		if (answer === 'replace') return this.submit(pending.items.map((item, index) => (conflicted[index] ? { ...item, conflict: 'replace' } : item)));
		await this.submit(pending.items.filter((_, index) => !conflicted[index]));
	}

	async submit(items: NewItem[]) {
		if (!items.length) return;
		await queue.add(items);
		this.view = 'queue';
	}
}

export const session = new Session();
