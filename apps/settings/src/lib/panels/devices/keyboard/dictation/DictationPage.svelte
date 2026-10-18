<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import ModelRow from './ModelRow.svelte';
	import { install, onOverview, openHomepage, overview, type EngineChoice, type Model, type Overview } from './api';

	type Dictation = { enabled: boolean; language: string; engine: EngineChoice };

	let { onclose }: { onclose: () => void } = $props();

	const ENGINE_NAMES = { parakeet: 'Parakeet', whisper: 'Whisper' };
	const ENGINES: { value: EngineChoice; label: string }[] = [
		{ value: 'automatic', label: 'Automatic' },
		{ value: 'parakeet', label: 'Parakeet' },
		{ value: 'whisper', label: 'Whisper' }
	];

	const settings = useSettings<Dictation>('com.lantharos.kestrel.dictation', ['enabled', 'language', 'engine']);
	const inputSources = useSettings<{ sources: [string, string][] }>('org.gnome.desktop.input-sources', ['sources']);

	let info = $state<Overview | null>(null);
	let unavailable = $state(false);

	let enabled = $derived(settings.values.enabled ?? false);
	let needed = $derived(info?.models.filter((model) => info?.needed.includes(model.id)) ?? []);
	let downloaded = $derived(
		info?.models.filter((model) => (model.usage > 0 || model.download) && !(enabled && needed.includes(model))) ?? []
	);
	let languages = $derived([
		{ value: '', label: info && !settings.values.language ? `Automatic (${info.language.name})` : 'Automatic' },
		...(info?.languages.map((language) => ({ value: language.code, label: language.name })) ?? [])
	]);

	function describeEngine(current: Overview) {
		const name = ENGINE_NAMES[current.engine];
		return current.engine === 'whisper' ? `${name} listens for ${current.language.name}, using the graphics card` : `${name} listens for ${current.language.name}`;
	}

	async function refresh() {
		try {
			info = await overview();
			unavailable = false;
		} catch {
			unavailable = true;
		}
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
		description="Hold the Copilot key and talk to type what you say, in any app. Let go to finish, or press Escape to cancel. It all happens on this computer: your voice never leaves it and isn’t saved."
	>
		<Row title="Dictation" description={unavailable ? 'Dictation isn’t installed on this computer' : 'Hold the Copilot key to dictate'} disabled={unavailable}>
			<Switch label="Dictation" checked={enabled} disabled={unavailable} onchange={turnOn} />
		</Row>
		{#if enabled}
			{#each needed as model (model.id)}
				<ModelRow {model} />
			{/each}
		{/if}
	</Section>

	{#if info}
		{@const current = info}
		<Section title="Language">
			<Row title="Language" description="Automatic follows the keyboard layout you type with">
				<Select label="Language" options={languages} value={settings.values.language ?? ''} onchange={(code) => settings.set('language', code)} />
			</Row>
			<Row title="Speech recognizer" description={describeEngine(current)}>
				<Select label="Speech recognizer" options={ENGINES} value={settings.values.engine ?? 'automatic'} onchange={(engine) => settings.set('engine', engine)} />
			</Row>
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
