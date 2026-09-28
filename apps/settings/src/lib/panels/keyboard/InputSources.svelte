<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { IconButton, Row, Section } from '@luft/ui';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import AddSourceDialog from './AddSourceDialog.svelte';
	import { layouts as readLayouts, type Layout } from './api';
	import ShortcutButton from './shortcuts/ShortcutButton.svelte';
	import type { Binding, ShortcutStore } from './shortcuts/store.svelte';

	type Source = [string, string];

	interface Props {
		store: ShortcutStore;
		onrecord: (binding: Binding) => void;
	}

	let { store, onrecord }: Props = $props();

	const inputSources = useSettings<{ sources: Source[] }>('org.gnome.desktop.input-sources', ['sources']);

	let layouts = $state.raw<Layout[]>([]);
	let adding = $state(false);

	let names = $derived(new Map(layouts.map((layout) => [layout.id, layout.name])));
	let sources = $derived(inputSources.values.sources ?? []);
	let switcher = $derived(store.find('org.gnome.desktop.wm.keybindings', 'switch-input-source'));

	function move(index: number, step: number) {
		const next = [...sources];
		[next[index], next[index + step]] = [next[index + step], next[index]];
		void inputSources.set('sources', next);
	}

	function remove(index: number) {
		void inputSources.set('sources', sources.filter((_, position) => position !== index));
	}

	function add(layout: Layout) {
		adding = false;
		void inputSources.set('sources', [...sources, ['xkb', layout.id]]);
	}

	void readLayouts().then((list) => (layouts = list));
</script>

<Section title="Input sources" description="The first one is used by default. Switch between them while you type.">
	{#each sources as [type, id], index (`${type}:${id}`)}
		<Row title={(type === 'xkb' && names.get(id)) || id}>
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

{#if switcher && sources.length > 1}
	<Section>
		<Row title="Switch input source">
			<ShortcutButton accelerators={switcher.accelerators} label={switcher.name} onclick={() => onrecord(switcher)} />
		</Row>
	</Section>
{/if}

{#if adding}
	<AddSourceDialog {layouts} added={sources.filter(([type]) => type === 'xkb').map(([, id]) => id)} onadd={add} onclose={() => (adding = false)} />
{/if}
