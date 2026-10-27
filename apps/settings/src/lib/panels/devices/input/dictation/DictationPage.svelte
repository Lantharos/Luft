<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Model, Overview } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import { canonical, labels } from '../shortcuts/keys/accelerator';
	import Keys from '../shortcuts/keys/Keys.svelte';
	import type { Binding, ShortcutStore } from '../shortcuts/store.svelte';
	import ModelRow from './ModelRow.svelte';
	import { openHomepage, type EngineChoice } from './api';

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
		{ value: 'chord', label: labels(SUPER_ALT).join(' + ') },
		{ value: 'custom', label: shortcut === 'custom' ? t('settings-dictation-shortcut-own') : t('settings-dictation-shortcut-another') },
		{ value: 'off', label: t('settings-dictation-shortcut-off') }
	]);
	let engines = $derived<{ value: EngineChoice; label: string }[]>([
		{ value: 'automatic', label: t('settings-dictation-engine-automatic') },
		{ value: 'parakeet', label: ENGINE_NAMES.parakeet },
		{ value: 'whisper', label: ENGINE_NAMES.whisper }
	]);
	let ways = $derived([
		...(shortcut === 'off' ? [] : accelerators.map((accelerator) => labels(accelerator).join('+'))),
		...(hardware.present?.copilotKey && (copilotKey.values.hold ?? true) ? [t('settings-dictation-copilot-key')] : [])
	]);
	let holdWith = $derived(new Intl.ListFormat(i18n.formats, { type: 'disjunction' }).format(ways));
	let usable = $derived(info?.engines ?? []);
	let spoken = $derived(info?.languages.find((language) => language.code === settings.values.language) ?? info?.language);
	let engine = $derived.by(() => {
		const chosen = settings.values.engine;
		return chosen && chosen !== 'automatic' && usable.includes(chosen) ? chosen : spoken?.engine;
	});
	let available = $derived(!spoken || usable.includes(spoken.engine));
	let model = $derived(info?.models.find((model) => model.id === info?.model));
	let downloaded = $derived(info?.models.filter((other) => other !== model && (other.usage > 0 || other.download)) ?? []);
	let languages = $derived([
		{
			value: '',
			label: info && !settings.values.language ? t('settings-dictation-language-automatic-current', { language: info.language.name }) : t('settings-dictation-language-automatic')
		},
		...(info?.languages
			.filter((language) => usable.includes(language.engine))
			.map((language) => ({ value: language.code, label: language.name })) ?? [])
	]);

	function describeEngine() {
		if (!engine || !spoken) return '';
		const args = { engine: ENGINE_NAMES[engine], language: spoken.name };
		return engine === 'whisper' ? t('settings-dictation-engine-graphics-card', args) : t('settings-dictation-engine-description', args);
	}

	async function refresh() {
		try {
			info = await commands.dictation();
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


	const stop = events.dictationChanged((next) => (info = next));
	onDestroy(stop);

	$effect(() => {
		void settings.values.enabled;
		void settings.values.language;
		void settings.values.engine;
		void inputSources.values.sources;
		void refresh();
	});
</script>

<SubPage title={t('settings-dictation-title')} back={t('settings-page-input')} {onclose}>
	<Section
		description={holdWith ? t('settings-dictation-description', { keys: holdWith }) : t('settings-dictation-description-no-shortcut')}
	>
		<Row
			title={t('settings-dictation-title')}
			description={unavailable
				? t('settings-dictation-not-installed')
				: holdWith
					? t('settings-dictation-hold', { keys: holdWith })
					: t('settings-dictation-needs-shortcut')}
			disabled={unavailable}
		>
			<Switch label={t('settings-dictation-title')} checked={enabled} disabled={unavailable} onchange={(on) => settings.set('enabled', on)} />
		</Row>
		{#if model && !unavailable}
			<ModelRow {model} />
		{/if}
	</Section>

	<Section>
		<Row title={t('settings-dictation-shortcut')} description={t('settings-dictation-shortcut-description')}>
			<Select label={t('settings-dictation-shortcut')} options={shortcutOptions} value={shortcut} disabled={!binding} onchange={pickShortcut} />
		</Row>
		{#if shortcut === 'custom' && binding}
			{@const own = binding}
			<Row title={t('settings-dictation-keys')}>
				<span class="flex items-center gap-3">
					<Keys {accelerators} />
					<button type="button" class="button" onclick={() => onrecord(own)}>{t('settings-dictation-change')}</button>
				</span>
			</Row>
		{/if}
	</Section>

	{#if info}
		{@const current = info}
		<Section title={t('settings-dictation-language')}>
			<Row
				title={t('settings-dictation-language')}
				description={available
					? t('settings-dictation-language-description')
					: t('settings-dictation-language-unavailable', { language: spoken?.name ?? '' })}
			>
				<Select label={t('settings-dictation-language')} options={languages} value={settings.values.language ?? ''} onchange={(code) => settings.set('language', code)} />
			</Row>
			{#if usable.length > 1}
				<Row title={t('settings-dictation-engine')} description={describeEngine()}>
					<Select label={t('settings-dictation-engine')} options={engines} value={settings.values.engine ?? 'automatic'} onchange={(engine) => settings.set('engine', engine)} />
				</Row>
			{/if}
		</Section>

		{#if downloaded.length}
			<Section title={t('settings-dictation-models')} description={t('settings-dictation-models-description')}>
				{#each downloaded as model (model.id)}
					<ModelRow {model} removable />
				{/each}
			</Section>
		{/if}

		<Section title={t('settings-dictation-credits')}>
			{#each current.models as model (model.id)}
				{@render credit(model)}
			{/each}
		</Section>
	{/if}
</SubPage>

{#snippet credit(model: Model)}
	<Row title={model.name} description={t('settings-dictation-credit', { credit: model.credit, licence: model.licence })}>
		<button type="button" class="button" onclick={() => openHomepage(model.homepage)}>{t('settings-dictation-learn-more')}</button>
	</Row>
{/snippet}
