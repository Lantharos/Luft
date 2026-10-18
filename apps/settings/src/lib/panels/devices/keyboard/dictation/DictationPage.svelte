<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import { canonical, labels } from '../shortcuts/accelerator';
	import Keys from '../shortcuts/Keys.svelte';
	import type { Binding, ShortcutStore } from '../shortcuts/store.svelte';
	import ModelRow from './ModelRow.svelte';
	import { install, onOverview, openHomepage, overview, type EngineChoice, type Model, type Overview } from './api';

	type Dictation = { enabled: boolean; language: string; engine: EngineChoice };
	type ShortcutChoice = 'chord' | 'custom' | 'off';

	interface Props {
		store: ShortcutStore;
		onrecord: (binding: Binding) => void;
		onclose: () => void;
	}

	let { store, onrecord, onclose }: Props = $props();

	const SUPER_ALT = '<Super><Alt>';

	const ENGINE_NAMES = { parakeet: 'Parakeet', whisper: 'Whisper' };
	const ENGINES: { value: EngineChoice; label: string }[] = [
		{ value: 'automatic', label: 'Automatic' },
		{ value: 'parakeet', label: 'Parakeet' },
		{ value: 'whisper', label: 'Whisper' }
	];

	const settings = useSettings<Dictation>('com.lantharos.kestrel.dictation', ['enabled', 'language', 'engine']);
	const inputSources = useSettings<{ sources: [string, string][] }>('org.gnome.desktop.input-sources', ['sources']);
	const copilotKey = useSettings<{ hold: boolean }>('com.lantharos.kestrel.copilot-key', ['hold']);

	let info = $state<Overview | null>(null);
	let unavailable = $state(false);

	let enabled = $derived(settings.values.enabled ?? false);
	let binding = $derived(store.find('com.lantharos.kestrel.keybindings', 'dictate'));
	let accelerators = $derived(binding?.accelerators ?? []);
	let shortcut = $derived<ShortcutChoice>(
		!accelerators.length ? 'off' : accelerators.length === 1 && canonical(accelerators[0]) === canonical(SUPER_ALT) ? 'chord' : 'custom'
	);
	let shortcutOptions = $derived<{ value: ShortcutChoice; label: string }[]>([
		{ value: 'chord', label: 'Super + Alt' },
		{ value: 'custom', label: shortcut === 'custom' ? 'My own shortcut' : 'Another shortcut…' },
		{ value: 'off', label: 'Off' }
	]);
	let ways = $derived(
		[
			shortcut === 'off' ? null : accelerators.map((accelerator) => labels(accelerator).join('+')).join(' or '),
			hardware.present?.copilotKey && (copilotKey.values.hold ?? true) ? 'the Copilot key' : null
		].filter(Boolean)
	);
	let holdWith = $derived(ways.join(' or '));
	let usable = $derived(info?.engines ?? []);
	let spoken = $derived(info?.languages.find((language) => language.code === settings.values.language) ?? info?.language);
	let engine = $derived.by(() => {
		const chosen = settings.values.engine;
		return chosen && chosen !== 'automatic' && usable.includes(chosen) ? chosen : spoken?.engine;
	});
	let available = $derived(!spoken || usable.includes(spoken.engine));
	let needed = $derived(info?.models.filter((model) => info?.needed.includes(model.id)) ?? []);
	let downloaded = $derived(
		info?.models.filter((model) => (model.usage > 0 || model.download) && !(enabled && needed.includes(model))) ?? []
	);
	let languages = $derived([
		{ value: '', label: info && !settings.values.language ? `Automatic (${info.language.name})` : 'Automatic' },
		...(info?.languages
			.filter((language) => usable.includes(language.engine))
			.map((language) => ({ value: language.code, label: language.name })) ?? [])
	]);

	function describeEngine() {
		if (!engine || !spoken) return '';
		const name = ENGINE_NAMES[engine];
		return engine === 'whisper' ? `${name} recognizes ${spoken.name} on the graphics card` : `${name} recognizes ${spoken.name}`;
	}

	async function refresh() {
		try {
			info = await overview();
			unavailable = false;
		} catch {
			unavailable = true;
		}
	}

	async function pickShortcut(choice: ShortcutChoice) {
		if (!binding) return;
		if (choice === 'custom') onrecord(binding);
		else await store.assign(binding, choice === 'chord' ? [SUPER_ALT] : []);
	}

	async function turnOn(on: boolean) {
		await settings.set('enabled', on);
		if (on) for (const model of needed) await install(model.id);
	}

	const stop = onOverview((next) => (info = next));
	onDestroy(stop);

	$effect(() => {
		void settings.values.language;
		void settings.values.engine;
		void inputSources.values.sources;
		void refresh();
	});
</script>

<SubPage title="Dictation" back="Keyboard" {onclose}>
	<Section
		description={holdWith
			? `Hold ${holdWith} and talk to type what you say, in any app. Let go to finish, or press Escape to cancel. It all happens on this computer: your voice never leaves it and isn’t saved.`
			: 'Choose a shortcut below to dictate. It all happens on this computer: your voice never leaves it and isn’t saved.'}
	>
		<Row
			title="Dictation"
			description={unavailable ? 'Dictation isn’t installed on this computer' : holdWith ? `Hold ${holdWith} to dictate` : 'Off until it has a shortcut'}
			disabled={unavailable}
		>
			<Switch label="Dictation" checked={enabled} disabled={unavailable} onchange={turnOn} />
		</Row>
		{#if enabled}
			{#each needed as model (model.id)}
				<ModelRow {model} />
			{/each}
		{/if}
	</Section>

	<Section>
		<Row title="Shortcut" description="Hold it to talk, or press it to listen until you press it again or stop talking">
			<Select label="Shortcut" options={shortcutOptions} value={shortcut} disabled={!binding} onchange={pickShortcut} />
		</Row>
		{#if shortcut === 'custom' && binding}
			{@const own = binding}
			<Row title="Keys">
				<span class="flex items-center gap-3">
					<Keys {accelerators} />
					<button type="button" class="button" onclick={() => onrecord(own)}>Change</button>
				</span>
			</Row>
		{/if}
	</Section>

	{#if info}
		{@const current = info}
		<Section title="Language">
			<Row
				title="Language"
				description={available ? 'Automatic follows the keyboard layout you type with' : `${spoken?.name} isn’t available on this computer`}
			>
				<Select label="Language" options={languages} value={settings.values.language ?? ''} onchange={(code) => settings.set('language', code)} />
			</Row>
			{#if usable.length > 1}
				<Row title="Speech recognizer" description={describeEngine()}>
					<Select label="Speech recognizer" options={ENGINES} value={settings.values.engine ?? 'automatic'} onchange={(engine) => settings.set('engine', engine)} />
				</Row>
			{/if}
		</Section>

		{#if downloaded.length}
			<Section title="Speech models" description="Models are downloaded once and kept on this computer.">
				{#each downloaded as model (model.id)}
					<ModelRow {model} removable />
				{/each}
			</Section>
		{/if}

		<Section title="Credits">
			{#each current.models as model (model.id)}
				{@render credit(model)}
			{/each}
		</Section>
	{/if}
</SubPage>

{#snippet credit(model: Model)}
	<Row title={model.name} description="{model.credit}. Licensed under {model.licence}.">
		<button type="button" class="button" onclick={() => openHomepage(model.homepage)}>Learn more</button>
	</Row>
{/snippet}
