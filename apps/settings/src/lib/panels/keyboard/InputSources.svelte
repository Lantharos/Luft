<script lang="ts">
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

<Section title="Input sources" description="The first one is used by default. Switch between them while you type.">
	{#each sources as [type, id], index (`${type}:${id}`)}
		{@const source = known.get(`${type}:${id}`)}
		<Row title={source?.name ?? id}>
			{#if keys && source?.link}
				{@const link = source.link}
				<IconButton icon={Pencil} label="Edit in Keys" onclick={() => void openKeys(link)} />
			{/if}
			<IconButton icon={ArrowUp} label="Move up" disabled={index === 0} onclick={() => move(index, -1)} />
			<IconButton icon={ArrowDown} label="Move down" disabled={index === sources.length - 1} onclick={() => move(index, 1)} />
			<IconButton icon={X} label="Remove" disabled={sources.length === 1} onclick={() => remove(index)} />
		</Row>
	{/each}
	<div class="p-2">
		<button type="button" class="plain-button" onclick={() => (adding = true)}>
			<Plus size={16} />
			Add input source
		</button>
	</div>
</Section>

{#if keys}
	<Section title="Your own layouts and input methods">
		<Row title="Make a layout" description="Start from a layout and change what its keys type" onclick={() => void openKeys(`kestrel-keys:layout/new?from=${encodeURIComponent(firstLayout)}`)} />
		<Row title="Make an input method" description="Turn what you type into accents, other scripts or words to choose from" onclick={() => void openKeys('kestrel-keys:method/new')} />
		<Row title="Open Keys" description="Edit the layouts and input methods you've made" onclick={() => void openKeys('kestrel-keys:')} />
	</Section>
{/if}

{#if switcher && sources.length > 1}
	<Section>
		<Row title="Switch input source">
			<ShortcutButton accelerators={switcher.accelerators} label={switcher.name} onclick={() => onrecord(switcher)} />
		</Row>
	</Section>
{/if}

{#if adding}
	<AddSourceDialog sources={addable} onadd={add} onclose={() => (adding = false)} />
{/if}
