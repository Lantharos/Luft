<script lang="ts">
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { IconButton, Row, Section } from '@luft/ui';
	import type { Category } from '../api';
	import { labels } from './accelerator';
	import ShortcutButton from './ShortcutButton.svelte';
	import type { Binding, ShortcutStore } from './store.svelte';

	interface Props {
		store: ShortcutStore;
		onrecord: (binding: Binding) => void;
		query: string;
	}

	const CATEGORIES: [Category, string][] = [
		['system', 'System'],
		['windows', 'Windows'],
		['workspaces', 'Workspaces'],
		['screenshots', 'Screenshots'],
		['media', 'Media']
	];
	const collator = new Intl.Collator(undefined, { numeric: true });

	let { store, onrecord, query }: Props = $props();

	let needle = $derived(query.trim().toLowerCase());

	let categories = $derived(
		CATEGORIES.map(([category, title]) => ({
			title,
			bindings: store.system
				.filter((binding) => binding.category === category && matches(binding, title))
				.sort((left, right) => collator.compare(left.name, right.name))
		})).filter((group) => group.bindings.length)
	);
	let apps = $derived(
		store.apps.filter((binding) => matches(binding, binding.appName)).sort((left, right) => collator.compare(left.appName, right.appName))
	);

	function matches(binding: Binding, ...extra: string[]) {
		return !needle || [binding.name, ...extra, ...binding.accelerators.flatMap(labels)].some((text) => text.toLowerCase().includes(needle));
	}
</script>

{#each categories as group (group.title)}
	<Section title={group.title}>
		{#each group.bindings as binding (binding.id)}
			<Row title={binding.name}>
				{#if binding.changed}
					<IconButton icon={RotateCcw} label="Reset to default" onclick={() => store.reset(binding)} />
				{/if}
				<ShortcutButton accelerators={binding.accelerators} label={binding.name} onclick={() => onrecord(binding)} />
			</Row>
		{/each}
	</Section>
{/each}

{#if apps.length}
	<Section title="App shortcuts" description="Ones apps asked for, which work even when the app isn’t in front">
		{#each apps as binding (binding.id)}
			<Row title={binding.name} description={binding.appName}>
				<ShortcutButton accelerators={binding.accelerators} label={binding.name} onclick={() => onrecord(binding)} />
			</Row>
		{/each}
	</Section>
{/if}

{#if needle && !categories.length && !apps.length}
	<p class="px-2 text-[14px] text-[var(--text-muted)]">No shortcuts match “{query.trim()}”</p>
{/if}
