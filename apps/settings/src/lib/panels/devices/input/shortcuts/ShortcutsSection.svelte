<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { IconButton, Row, Section } from '@luft/ui';
	import type { Category } from './api';
	import { labels } from './keys/accelerator';
	import ShortcutButton from './keys/ShortcutButton.svelte';
	import type { Binding, ShortcutStore } from './store.svelte';

	interface Props {
		store: ShortcutStore;
		onrecord: (binding: Binding) => void;
		query: string;
	}

	const CATEGORIES: [Category, string][] = [
		['system', 'settings-shortcuts-category-system'],
		['windows', 'settings-shortcuts-category-windows'],
		['tiling', 'settings-shortcuts-category-tiling'],
		['workspaces', 'settings-shortcuts-category-workspaces'],
		['screenshots', 'settings-shortcuts-category-screenshots'],
		['media', 'settings-shortcuts-category-media']
	];

	let { store, onrecord, query }: Props = $props();

	let collator = $derived(new Intl.Collator(i18n.formats, { numeric: true }));
	let needle = $derived(query.trim().toLowerCase());

	let categories = $derived(
		CATEGORIES.map(([category, id]) => {
			const title = t(id);
			return {
				title,
				bindings: store.system
					.filter((binding) => binding.category === category && matches(binding, title))
					.sort((left, right) => collator.compare(left.name, right.name))
			};
		}).filter((group) => group.bindings.length)
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
					<IconButton icon={RotateCcw} label={t('settings-shortcuts-reset')} onclick={() => store.reset(binding)} />
				{/if}
				<ShortcutButton accelerators={binding.accelerators} label={binding.name} onclick={() => onrecord(binding)} />
			</Row>
		{/each}
	</Section>
{/each}

{#if apps.length}
	<Section title={t('settings-shortcuts-apps')} description={t('settings-shortcuts-apps-description')}>
		{#each apps as binding (binding.id)}
			<Row title={binding.name} description={binding.appName}>
				<ShortcutButton accelerators={binding.accelerators} label={binding.name} onclick={() => onrecord(binding)} />
			</Row>
		{/each}
	</Section>
{/if}

{#if needle && !categories.length && !apps.length}
	<p class="px-2 text-[14px] text-[var(--text-muted)]">{t('settings-shortcuts-no-match', { query: query.trim() })}</p>
{/if}
