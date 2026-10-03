<script lang="ts">
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import Icon from '#lib/components/Icon.svelte';
	import { dialogs } from '#lib/features/dialogs.svelte.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { GRID_SIZES, type ViewState } from '#lib/file-manager/view/view-state.svelte.js';
	import { userFolders } from '#lib/file-manager/places/places.svelte.js';
	import { setPlaceHidden, settings } from '#lib/state/settings.svelte.js';

	interface Props {
		manager: FileManager;
		view: ViewState;
		chooser: boolean;
	}

	let { manager, view, chooser }: Props = $props();

	let browsing = $derived(manager.view === 'home');
	let smallest = $derived(view.gridSize <= GRID_SIZES[0]);
	let largest = $derived(view.gridSize >= GRID_SIZES[GRID_SIZES.length - 1]);
	let hiddenPlaces = $derived.by(() => {
		const hidden = new Set(settings.value.hiddenPlaces);
		const places = [{ path: manager.homePath, label: 'Home', icon: 'home' as const }, ...userFolders(manager.userDirs)];
		return places.filter((place) => hidden.has(place.path));
	});

	function run(action: () => unknown, close: () => void) {
		close();
		void action();
	}
</script>

{#snippet shortcut(keys: string)}
	<span class="menu-shortcut">{keys}</span>
{/snippet}

<MenuButton label="More" class="icon-button" align="end" minWidth={236} {@attach tooltip('More')}>
	{#snippet trigger()}
		<Icon name="more-horizontal" size={18} />
	{/snippet}
	{#snippet children(close)}
		{#if browsing}
			<MenuItem checked={settings.value.showHidden} onclick={() => run(manager.toggleHidden, close)}>
				<Icon name={settings.value.showHidden ? 'eye' : 'eye-off'} size={16} />
				<span class="flex-1">Show hidden files</span>
				{@render shortcut('Ctrl+H')}
			</MenuItem>
		{/if}
		{#if manager.viewMode === 'grid' && browsing}
			<div class="flex min-h-[38px] items-center gap-2.5 px-2.5 text-[13px] text-[var(--text-soft)]">
				<Icon name="grid" size={16} />
				<span class="flex-1">Icon size</span>
				<button class="icon-button" type="button" aria-label="Smaller icons" disabled={smallest} onclick={() => view.zoom(-1)}>
					<Icon name="minus" size={15} />
				</button>
				<button class="icon-button" type="button" aria-label="Larger icons" disabled={largest} onclick={() => view.zoom(1)}>
					<Icon name="plus" size={15} />
				</button>
			</div>
		{/if}
		<MenuItem checked={view.detailsOpen} onclick={() => run(view.toggleDetails, close)}>
			<Icon name="panel-right" size={16} />
			<span class="flex-1">Details</span>
			{@render shortcut('Alt+P')}
		</MenuItem>
		{#if hiddenPlaces.length > 0}
			<MenuSeparator />
			{#each hiddenPlaces as place (place.path)}
				<MenuItem onclick={() => run(() => setPlaceHidden(place.path, false), close)}>
					<Icon name={place.icon} size={16} />
					<span class="flex-1">Show {place.label} in sidebar</span>
				</MenuItem>
			{/each}
		{/if}
		<MenuSeparator />
		{#if !chooser}
			<MenuItem onclick={() => run(() => manager.openTab(), close)}>
				<Icon name="plus" size={16} />
				<span class="flex-1">New tab</span>
				{@render shortcut('Ctrl+T')}
			</MenuItem>
		{/if}
		{#if browsing}
			<MenuItem onclick={() => run(() => (view.editingPath = true), close)}>
				<Icon name="edit" size={16} />
				<span class="flex-1">Go to location</span>
				{@render shortcut('Ctrl+L')}
			</MenuItem>
		{/if}
		{#if !chooser}
			<MenuItem onclick={() => run(dialogs.connect, close)}>
				<Icon name="globe" size={16} />
				<span class="flex-1">Connect to server…</span>
			</MenuItem>
		{/if}
		<MenuItem onclick={() => run(manager.refresh, close)}>
			<Icon name="refresh" size={16} />
			<span class="flex-1">Refresh</span>
			{@render shortcut('F5')}
		</MenuItem>
	{/snippet}
</MenuButton>
