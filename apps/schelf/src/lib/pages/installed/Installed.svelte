<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { Segmented, VirtualScroller } from '@luft/ui';
	import type { InstalledApp, Source } from '#lib/bridge/types.js';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { bytes } from '#lib/format.js';
	import { backend } from '#lib/state/backend.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import InstalledRow from './InstalledRow.svelte';

	type Filter = 'all' | Source;

	const LAYOUT = { itemHeight: 64, gap: 2, padding: { top: 4, left: 28, right: 28, bottom: 40 } };

	let filter = $state<Filter>('all');
	let removing = $state<InstalledApp | null>(null);

	const shown = $derived(filter === 'all' ? library.installed : library.installed.filter((app) => app.source === filter));
	const total = $derived(shown.reduce((sum, app) => sum + app.size, 0));

	async function addAppImage() {
		const path = await backend().chooseAppImage();
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
					{ value: 'package', label: 'System' },
					{ value: 'appImage', label: 'AppImage' }
				]}
				onchange={(value) => (filter = value)}
			/>
			<div class="flex items-center gap-3">
				{#if library.loaded}
					<span class="text-[13px] text-[var(--text-muted)]">{shown.length} {shown.length === 1 ? 'app' : 'apps'} · {bytes(total)}</span>
				{/if}
				<button type="button" class="button" onclick={addAppImage}><Plus size={16} />Add AppImage</button>
			</div>
		</div>
		{#if library.loaded && !shown.length}
			<p class="px-8 pt-16 text-center text-[14px] text-[var(--text-muted)]">
				{filter === 'appImage' ? 'AppImages you add show up here, with a place in your app menu.' : 'No apps here yet.'}
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
