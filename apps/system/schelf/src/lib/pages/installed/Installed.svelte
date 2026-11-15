<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Segmented, Select, VirtualScroller } from '@luft/ui';
	import type { InstalledApp, Source } from '#lib/bindings.js';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import InstalledRow from './InstalledRow.svelte';

	type Filter = 'apps' | 'tool' | 'system' | 'extension';
	type Format = 'any' | 'store' | 'flatpak' | 'appImage' | 'debian';

	const APPS: Source[] = ['flatpak', 'appImage', 'debian', 'sabine'];
	const TOOLS: Source[] = ['tool', 'storeTool'];
	const kinds: { value: Format; label: string }[] = $derived([
		{ value: 'any', label: t('installed-kind-any') },
		{ value: 'store', label: t('installed-kind-store') },
		{ value: 'flatpak', label: 'Flatpak' },
		{ value: 'appImage', label: 'AppImage' },
		{ value: 'debian', label: '.deb' }
	]);

	const LAYOUT = { itemHeight: 64, gap: 2, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	const EMPTY: Partial<Record<Filter, string>> = {
		tool: 'installed-empty-tools',
		system: 'installed-empty-system'
	};

	const COUNTS: Record<Filter, [string, string]> = {
		apps: ['installed-count-apps', 'installed-count-apps-size'],
		tool: ['installed-count-tools', 'installed-count-tools-size'],
		system: ['installed-count-system', 'installed-count-system-size'],
		extension: ['installed-count-extensions', 'installed-count-extensions-size']
	};

	let filter = $state<Filter>('apps');
	let format = $state<Format>('any');
	let removing = $state<InstalledApp | null>(null);

	const apps = $derived(library.installed.filter((app) => APPS.includes(app.source)));
	const formats = $derived(kinds.filter(({ value }) => value === 'any' || apps.some((app) => made(app) === value)));
	const shown = $derived.by(() => {
		if (filter === 'tool') return library.installed.filter((app) => TOOLS.includes(app.source));
		if (filter !== 'apps') return library.installed.filter((app) => app.source === filter);
		return format === 'any' ? apps : apps.filter((app) => made(app) === format);
	});

	function made(app: InstalledApp): Format {
		return app.listing || app.source === 'sabine' ? 'store' : (app.source as Format);
	}
	const total = $derived(shown.reduce((sum, app) => sum + app.size, 0));
	const count = $derived.by(() => {
		const [plain, sized] = COUNTS[filter];
		return total ? t(sized, { count: shown.length, size: bytes(total) }) : t(plain, { count: shown.length });
	});

</script>

<VirtualScroller class="soft-scroll h-full" items={shown} key={(app) => app.key} layout={LAYOUT}>
	{#snippet header()}
		<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-[var(--content)] px-8 pb-3">
			<Segmented
				label={t('installed-show')}
				value={filter}
				options={[
					{ value: 'apps', label: t('installed-apps') },
					{ value: 'tool', label: t('installed-tools') },
					{ value: 'system', label: t('installed-system') },
					...(library.installed.some((app) => app.source === 'extension') ? [{ value: 'extension' as const, label: t('installed-extensions') }] : [])
				]}
				onchange={(value) => {
					filter = value;
					format = 'any';
				}}
			/>
			<div class="ml-auto flex items-center gap-3">
				{#if library.loaded}
					<span class="whitespace-nowrap text-[13px] text-[var(--text-muted)]">{count}</span>
				{/if}
				{#if filter === 'apps' && formats.length > 2}
					<Select label={t('installed-kind')} options={formats} value={format} onchange={(value) => (format = value)} />
				{/if}
				{#if filter === 'system'}
					<button type="button" class="button" onclick={() => navigation.push({ page: 'sources' })}>{t('installed-sources')}</button>
				{/if}
			</div>
		</div>
		{#if library.loaded && !shown.length}
			<p class="px-8 pt-16 text-center text-[14px] text-[var(--text-muted)]">
				{t(EMPTY[filter] ?? 'installed-empty')}
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
