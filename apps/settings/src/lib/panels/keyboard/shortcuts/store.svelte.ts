import { onDestroy, untrack } from 'svelte';
import { SettingsGroup, schemaInstalled } from '$lib/state/gsettings.svelte';
import { appNames, resetSetting, shortcutEntries, writeSetting, type Category, type ShortcutEntry } from '../api';
import { canonical, sameAccelerators } from './accelerator';

const MEDIA_KEYS = 'com.lantharos.kestrel.media-keys';
const CUSTOM_SCHEMA = 'com.lantharos.kestrel.custom-keybinding';
const CUSTOM_ROOT = '/com/lantharos/kestrel/media-keys/custom-keybindings/';
const CUSTOM_KEYS = ['name', 'command', 'binding'] as const;
const KESTREL = 'com.lantharos.kestrel';

type Accelerators = Record<string, string[]>;
type Registered = Record<string, Record<string, { description: string; shortcuts: string[] }>>;

export type Custom = { name: string; command: string; binding: string };

interface Base {
	id: string;
	name: string;
	accelerators: string[];
}

export type SystemBinding = Base & { kind: 'system'; schema: string; key: string; category: Category; defaults: string[]; changed: boolean };
export type AppBinding = Base & { kind: 'app'; app: string; appName: string; shortcut: string };
export type CustomBinding = Base & { kind: 'custom'; path: string; command: string };
export type Binding = SystemBinding | AppBinding | CustomBinding;

export class ShortcutStore {
	entries = $state.raw<ShortcutEntry[]>([]);
	groups = $state.raw<Record<string, SettingsGroup<Accelerators>>>({});
	customs = $state.raw<Record<string, SettingsGroup<Custom>>>({});
	registry = $state.raw<SettingsGroup<{ 'global-shortcuts': string }> | null>(null);
	names = $state.raw<Record<string, string>>({});

	private media = new SettingsGroup<{ 'custom-keybindings': string[] }>(MEDIA_KEYS, ['custom-keybindings']);

	customPaths = $derived(this.media.values['custom-keybindings'] ?? []);
	registered = $derived<Registered>(JSON.parse(this.registry?.values['global-shortcuts'] ?? '{}'));
	appIds = $derived(Object.keys(this.registered).sort().join(' '));

	system = $derived<SystemBinding[]>(
		this.entries.map((entry) => {
			const accelerators = (this.groups[entry.schema]?.values[entry.key] ?? []).filter(Boolean);
			return {
				kind: 'system',
				id: `${entry.schema}/${entry.key}`,
				name: entry.name,
				accelerators,
				schema: entry.schema,
				key: entry.key,
				category: entry.category,
				defaults: entry.defaults,
				changed: !sameAccelerators(accelerators, entry.defaults.filter(Boolean))
			};
		})
	);

	apps = $derived<AppBinding[]>(
		Object.entries(this.registered).flatMap(([app, shortcuts]) =>
			Object.entries(shortcuts).map(([shortcut, { description, shortcuts: accelerators }]) => ({
				kind: 'app' as const,
				id: `${app}/${shortcut}`,
				name: description,
				accelerators,
				app,
				appName: this.names[app] ?? app,
				shortcut
			}))
		)
	);

	custom = $derived<CustomBinding[]>(
		this.customPaths.flatMap((path) => {
			const values = this.customs[path]?.values;
			if (!values) return [];
			return [
				{
					kind: 'custom' as const,
					id: path,
					name: values.name ?? '',
					accelerators: values.binding ? [values.binding] : [],
					path,
					command: values.command ?? ''
				}
			];
		})
	);

	all = $derived<Binding[]>([...this.system, ...this.apps, ...this.custom]);

	constructor() {
		void this.load();
		$effect(() => {
			const paths = this.customPaths;
			untrack(() => this.syncCustom(paths));
		});
		$effect(() => {
			if (this.appIds) void appNames(this.appIds.split(' ')).then((names) => (this.names = names));
		});
		onDestroy(() => this.destroy());
	}

	private async load() {
		const entries = await shortcutEntries();
		const schemas = [...new Set(entries.map((entry) => entry.schema))];
		this.groups = Object.fromEntries(
			schemas.map((schema) => [
				schema,
				new SettingsGroup<Accelerators>(schema, entries.filter((entry) => entry.schema === schema).map((entry) => entry.key))
			])
		);
		this.entries = entries;
		if (await schemaInstalled(KESTREL)) this.registry = new SettingsGroup(KESTREL, ['global-shortcuts']);
	}

	private syncCustom(paths: string[]) {
		const next: Record<string, SettingsGroup<Custom>> = {};
		for (const path of paths) next[path] = this.customs[path] ?? new SettingsGroup<Custom>(CUSTOM_SCHEMA, [...CUSTOM_KEYS], path);
		for (const [path, group] of Object.entries(this.customs)) if (!(path in next)) group.destroy();
		this.customs = next;
	}

	find(schema: string, key: string) {
		return this.system.find((binding) => binding.schema === schema && binding.key === key);
	}

	conflict(accelerator: string, binding: Binding) {
		const wanted = canonical(accelerator);
		return this.all.find((other) => other.id !== binding.id && other.accelerators.some((existing) => canonical(existing) === wanted));
	}

	async assign(binding: Binding, accelerators: string[]) {
		if (binding.kind === 'system') return this.groups[binding.schema].set(binding.key, accelerators);
		if (binding.kind === 'custom') return this.customs[binding.path].set('binding', accelerators[0] ?? '');
		const shortcuts = this.registered[binding.app];
		const next: Registered = {
			...this.registered,
			[binding.app]: { ...shortcuts, [binding.shortcut]: { ...shortcuts[binding.shortcut], shortcuts: accelerators } }
		};
		await this.registry!.set('global-shortcuts', JSON.stringify(next));
	}

	async release(accelerator: string, binding: Binding) {
		const wanted = canonical(accelerator);
		await this.assign(binding, binding.accelerators.filter((existing) => canonical(existing) !== wanted));
	}

	async reset(binding: SystemBinding) {
		await this.groups[binding.schema].reset(binding.key);
	}

	async addCustom(values: Custom) {
		let index = 0;
		while (this.customPaths.includes(`${CUSTOM_ROOT}custom${index}/`)) index += 1;
		const path = `${CUSTOM_ROOT}custom${index}/`;
		for (const key of CUSTOM_KEYS) await writeSetting({ schema: CUSTOM_SCHEMA, path }, key, values[key]);
		await this.media.set('custom-keybindings', [...this.customPaths, path]);
	}

	async updateCustom(binding: CustomBinding, values: Custom) {
		const group = this.customs[binding.path];
		for (const key of CUSTOM_KEYS) if (group.values[key] !== values[key]) await group.set(key, values[key]);
	}

	async removeCustom(binding: CustomBinding) {
		await this.media.set('custom-keybindings', this.customPaths.filter((path) => path !== binding.path));
		for (const key of CUSTOM_KEYS) await resetSetting({ schema: CUSTOM_SCHEMA, path: binding.path }, key);
	}

	private destroy() {
		for (const group of [...Object.values(this.groups), ...Object.values(this.customs), this.media, this.registry]) group?.destroy();
	}
}
