<script lang="ts">
	import { t } from '@luft/i18n';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { IconButton, Row, Section } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import AddSourceDialog from './AddSourceDialog.svelte';
	import { inputMethods, keysInstalled, layouts as readLayouts, openKeys } from './api';
	import ShortcutButton from './shortcuts/ShortcutButton.svelte';
	import type { Binding, ShortcutStore } from './shortcuts/store.svelte';
	import { fromLayout, fromMethod, type Source } from './sources';

	type Setting = [string, string];

	interface Props {
		store: ShortcutStore;
		onrecord: (binding: Binding) => void;
	}

	let { store, onrecord }: Props = $props();

	const inputSources = useSettings<{ sources: Setting[] }>('org.gnome.desktop.input-sources', ['sources']);

	let available = $state.raw<Source[]>([]);
	let keys = $state(false);
	let adding = $state(false);

	let known = $derived(new Map(available.map((source) => [`${source.type}:${source.id}`, source])));
	let sources = $derived(inputSources.values.sources ?? []);
	let addable = $derived(available.filter((source) => !sources.some(([type, id]) => type === source.type && id === source.id)));
	let switcher = $derived(store.find('org.gnome.desktop.wm.keybindings', 'switch-input-source'));
	let firstLayout = $derived(sources.find(([type]) => type === 'xkb')?.[1] ?? 'us');

	function move(index: number, step: number) {
		const next = [...sources];
		[next[index], next[index + step]] = [next[index + step], next[index]];
		void inputSources.set('sources', next);
	}

	function remove(index: number) {
		void inputSources.set('sources', sources.filter((_, position) => position !== index));
	}

	function add(source: Source) {
		adding = false;
		void inputSources.set('sources', [...sources, [source.type, source.id]]);
	}

	async function refresh() {
		const [layouts, methods] = await Promise.all([readLayouts(), inputMethods().catch(() => [])]);
		available = [...layouts.map(fromLayout), ...methods.map(fromMethod)];
	}

	void refresh();
	void keysInstalled().then((installed) => (keys = installed));
</script>

<svelte:window onfocus={() => void refresh()} />

<Section title={t('settings-keyboard-sources')} description={t('settings-keyboard-sources-description')}>
	{#each sources as [type, id], index (`${type}:${id}`)}
		{@const source = known.get(`${type}:${id}`)}
		<Row title={source?.name ?? id}>
			{#if keys && source?.link}
				{@const link = source.link}
				<IconButton icon={Pencil} label={t('settings-keyboard-source-edit')} onclick={() => void openKeys(link)} />
			{/if}
			<IconButton icon={ArrowUp} label={t('settings-keyboard-source-up')} disabled={index === 0} onclick={() => move(index, -1)} />
			<IconButton icon={ArrowDown} label={t('settings-keyboard-source-down')} disabled={index === sources.length - 1} onclick={() => move(index, 1)} />
			<IconButton icon={X} label={t('settings-keyboard-source-remove')} disabled={sources.length === 1} onclick={() => remove(index)} />
		</Row>
	{/each}
	<div class="p-2">
		<button type="button" class="plain-button" onclick={() => (adding = true)}>
			<Plus size={16} />
			{t('settings-keyboard-add-source-button')}
		</button>
	</div>
</Section>

{#if keys}
	<Section title={t('settings-keyboard-own')}>
		<Row title={t('settings-keyboard-own-layout')} description={t('settings-keyboard-own-layout-description')} onclick={() => void openKeys(`kestrel-keys:layout/new?from=${encodeURIComponent(firstLayout)}`)} />
		<Row title={t('settings-keyboard-own-method')} description={t('settings-keyboard-own-method-description')} onclick={() => void openKeys('kestrel-keys:method/new')} />
		<Row title={t('settings-keyboard-own-open')} description={t('settings-keyboard-own-open-description')} onclick={() => void openKeys('kestrel-keys:')} />
	</Section>
{/if}

{#if switcher && sources.length > 1}
	<Section>
		<Row title={t('settings-keyboard-switch-source')}>
			<ShortcutButton accelerators={switcher.accelerators} label={switcher.name} onclick={() => onrecord(switcher)} />
		</Row>
	</Section>
{/if}

{#if adding}
	<AddSourceDialog sources={addable} onadd={add} onclose={() => (adding = false)} />
{/if}
