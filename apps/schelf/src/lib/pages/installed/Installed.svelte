<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { bytes, Segmented, VirtualScroller } from '@luft/ui';
	import { commands, type InstalledApp, type Source } from '#lib/bindings.js';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { fedora } from '#lib/fedora/fedora.svelte.js';
	import { SLOW } from '#lib/bridge/index.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import InstalledRow from './InstalledRow.svelte';

	type Filter = 'all' | Source;

	const LAYOUT = { itemHeight: 64, gap: 2, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	const EMPTY: Partial<Record<Filter, string>> = {
		appImage: 'AppImages you add show up here, with a place in your app menu.',
		debian: 'Apps you install from .deb files show up here.',
		tool: 'Command-line tools you install from search show up here.',
		system: 'Packages you add to the system, such as services, show up here. Add one in Tern with schelf install --system, or open a package file.'
	};

	const NOUNS: Partial<Record<Filter, [string, string]>> = { tool: ['tool', 'tools'], system: ['package', 'packages'] };

	let filter = $state<Filter>('all');
	let removing = $state<InstalledApp | null>(null);

	const shown = $derived(filter === 'all' ? library.installed : library.installed.filter((app) => app.source === filter));
	const total = $derived(shown.reduce((sum, app) => sum + app.size, 0));
	const noun = $derived((NOUNS[filter] ?? ['app', 'apps'])[shown.length === 1 ? 0 : 1]);

	async function addAppImage() {
		const path = await commands.filesChooseAppimage(SLOW);
		if (path) navigation.push({ page: 'file', path });
	}

</script>

<VirtualScroller class="soft-scroll h-full" items={shown} key={(app) => app.key} layout={LAYOUT}>
	{#snippet header()}
		<div class="flex items-center justify-between gap-4 bg-[var(--content)] px-8 pb-3">
			<Segmented
				label="Show"
				value={filter}
				options={[
					{ value: 'all', label: 'All' },
					{ value: 'flatpak', label: 'Flatpak' },
					...(fedora.available ? [{ value: 'package' as const, label: 'System' }] : [{ value: 'tool' as const, label: 'Tools' }, { value: 'system' as const, label: 'System' }]),
					{ value: 'appImage', label: 'AppImage' },
					...(library.installed.some((app) => app.source === 'debian') ? [{ value: 'debian' as const, label: '.deb' }] : [])
				]}
				onchange={(value) => (filter = value)}
			/>
			<div class="flex items-center gap-3">
				{#if library.loaded}
					<span class="text-[13px] text-[var(--text-muted)]">{shown.length} {noun}{total ? ` · ${bytes(total)}` : ''}</span>
				{/if}
				{#if filter === 'system'}
					<button type="button" class="button" onclick={() => navigation.push({ page: 'sources' })}>Software sources</button>
				{:else}
					<button type="button" class="button" onclick={addAppImage}><Plus size={16} />Add AppImage</button>
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
