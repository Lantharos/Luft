<script lang="ts">
	import { bytes, Segmented, Select, VirtualScroller } from '@luft/ui';
	import type { InstalledApp, Source } from '#lib/bindings.js';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import InstalledRow from './InstalledRow.svelte';

	type Filter = 'all' | 'apps' | 'tool' | 'system' | 'extension';
	type Format = 'any' | 'store' | 'flatpak' | 'appImage' | 'debian';

	const APPS: Source[] = ['flatpak', 'appImage', 'debian', 'sabine'];
	const FORMATS: { value: Format; label: string }[] = [
		{ value: 'any', label: 'Every kind' },
		{ value: 'store', label: 'From schelf.store' },
		{ value: 'flatpak', label: 'Flatpak' },
		{ value: 'appImage', label: 'AppImage' },
		{ value: 'debian', label: '.deb' }
	];

	const LAYOUT = { itemHeight: 64, gap: 2, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	const EMPTY: Partial<Record<Filter, string>> = {
		tool: 'Command-line tools you install from search show up here.',
		system: 'Drivers and services you add to the system show up here. Search for one, or open its file.'
	};

	const NOUNS: Partial<Record<Filter, [string, string]>> = { tool: ['tool', 'tools'], system: ['add-on', 'add-ons'], extension: ['extension', 'extensions'] };

	let filter = $state<Filter>('all');
	let format = $state<Format>('any');
	let removing = $state<InstalledApp | null>(null);

	const apps = $derived(library.installed.filter((app) => APPS.includes(app.source)));
	const formats = $derived(FORMATS.filter(({ value }) => value === 'any' || apps.some((app) => made(app) === value)));
	const shown = $derived.by(() => {
		if (filter === 'all') return library.installed;
		if (filter !== 'apps') return library.installed.filter((app) => app.source === filter);
		return format === 'any' ? apps : apps.filter((app) => made(app) === format);
	});

	function made(app: InstalledApp): Format {
		return app.listing || app.source === 'sabine' ? 'store' : (app.source as Format);
	}
	const total = $derived(shown.reduce((sum, app) => sum + app.size, 0));
	const noun = $derived((NOUNS[filter] ?? ['app', 'apps'])[shown.length === 1 ? 0 : 1]);

</script>

<VirtualScroller class="soft-scroll h-full" items={shown} key={(app) => app.key} layout={LAYOUT}>
	{#snippet header()}
		<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-[var(--content)] px-8 pb-3">
			<Segmented
				label="Show"
				value={filter}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'apps', label: 'Apps' },
					{ value: 'tool', label: 'Command-line tools' },
					{ value: 'system', label: 'System add-ons' },
					...(library.installed.some((app) => app.source === 'extension') ? [{ value: 'extension' as const, label: 'Extensions' }] : [])
				]}
				onchange={(value) => {
					filter = value;
					format = 'any';
				}}
			/>
			<div class="ml-auto flex items-center gap-3">
				{#if library.loaded}
					<span class="whitespace-nowrap text-[13px] text-[var(--text-muted)]">{shown.length} {noun}{total ? ` · ${bytes(total)}` : ''}</span>
				{/if}
				{#if filter === 'apps' && formats.length > 2}
					<Select label="Kind of app" options={formats} value={format} onchange={(value) => (format = value)} />
				{/if}
				{#if filter === 'system'}
					<button type="button" class="button" onclick={() => navigation.push({ page: 'sources' })}>Software sources</button>
				{/if}
			</div>
		</div>
		{#if library.loaded && !shown.length}
			<p class="px-8 pt-16 text-center text-[14px] text-[var(--text-muted)]">
				{EMPTY[filter] ?? 'No apps here yet.'}
			</p>
		{/if}
	{/snippet}
	{#snippet children(app)}
		<InstalledRow {app} onremove={(app) => (removing = app)} />
	{/snippet}
</VirtualScroller>

{#if removing}
	<RemoveDialog app={removing} onclose={() => (removing = null)} />
{/if}
