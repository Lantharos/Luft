<script lang="ts">
	import Ellipsis from '@luft/symbols/icons/ellipsis';
	import Eye from '@luft/symbols/icons/eye';
	import EyeOff from '@luft/symbols/icons/eye-off';
	import Globe from '@luft/symbols/icons/globe';
	import LayoutGrid from '@luft/symbols/icons/layout-grid';
	import Minus from '@luft/symbols/icons/minus';
	import PanelRight from '@luft/symbols/icons/panel-right';
	import Plus from '@luft/symbols/icons/plus';
	import RefreshCw from '@luft/symbols/icons/refresh-cw';
	import SquarePen from '@luft/symbols/icons/square-pen';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import { dialogs } from '#lib/features/dialogs.svelte.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { GRID_SIZES, type ViewState } from '#lib/file-manager/view/view-state.svelte.js';
	import * as sidebar from '#lib/file-manager/places/sidebar.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import { shortcutLabel } from '#lib/utils/shortcuts.js';

	interface Props {
		manager: FileManager;
		view: ViewState;
		chooser: boolean;
	}

	let { manager, view, chooser }: Props = $props();

	let browsing = $derived(manager.view === 'home');
	let HiddenIcon = $derived(settings.value.showHidden ? Eye : EyeOff);
	let smallest = $derived(view.gridSize <= GRID_SIZES[0]);
	let largest = $derived(view.gridSize >= GRID_SIZES[GRID_SIZES.length - 1]);
	let missing = $derived(sidebar.missing(manager.userDirs));

	function run(action: () => unknown, close: () => void) {
		close();
		void action();
	}
</script>

{#snippet shortcut(keys: string)}
	<span class="text-[11.5px] text-[var(--text-muted)] tabular-nums">{keys}</span>
{/snippet}

<MenuButton label={t('rover-more')} class="icon-button" align="end" minWidth={236} {@attach tooltip(t('rover-more'))}>
	{#snippet trigger()}
		<Ellipsis size={18} />
	{/snippet}
	{#snippet children(close)}
		{#if browsing}
			<MenuItem checked={settings.value.showHidden} onclick={() => run(manager.toggleHidden, close)}>
				<HiddenIcon size={16} />
				<span class="flex-1">{t('rover-more-show-hidden')}</span>
				{@render shortcut(shortcutLabel(['ctrl'], 'H'))}
			</MenuItem>
		{/if}
		{#if manager.viewMode === 'grid' && browsing}
			<div class="flex min-h-[38px] items-center gap-2.5 px-2.5 text-[13px] text-[var(--text-soft)]">
				<LayoutGrid size={16} />
				<span class="flex-1">{t('rover-more-icon-size')}</span>
				<button class="icon-button" type="button" aria-label={t('rover-more-smaller-icons')} disabled={smallest} onclick={() => view.zoom(-1)}>
					<Minus size={15} />
				</button>
				<button class="icon-button" type="button" aria-label={t('rover-more-larger-icons')} disabled={largest} onclick={() => view.zoom(1)}>
					<Plus size={15} />
				</button>
			</div>
		{/if}
		<MenuItem checked={view.detailsOpen} onclick={() => run(view.toggleDetails, close)}>
			<PanelRight size={16} />
			<span class="flex-1">{t('rover-details')}</span>
			{@render shortcut(shortcutLabel(['alt'], 'P'))}
		</MenuItem>
		{#if missing.length > 0}
			<MenuSeparator />
			{#each missing as place (place)}
				{@const Icon = sidebar.placeArt(place, manager.userDirs).icon}
				<MenuItem onclick={() => run(() => sidebar.restore(place), close)}>
					<Icon size={16} />
					<span class="flex-1">{t('rover-more-show-place', { name: sidebar.placeLabel(place, manager.userDirs) })}</span>
				</MenuItem>
			{/each}
		{/if}
		<MenuSeparator />
		{#if !chooser}
			<MenuItem onclick={() => run(() => manager.openTab(), close)}>
				<Plus size={16} />
				<span class="flex-1">{t('rover-new-tab')}</span>
				{@render shortcut(shortcutLabel(['ctrl'], 'T'))}
			</MenuItem>
		{/if}
		{#if browsing}
			<MenuItem onclick={() => run(() => (view.editingPath = true), close)}>
				<SquarePen size={16} />
				<span class="flex-1">{t('rover-more-go-to-location')}</span>
				{@render shortcut(shortcutLabel(['ctrl'], 'L'))}
			</MenuItem>
		{/if}
		{#if !chooser}
			<MenuItem onclick={() => run(dialogs.connect, close)}>
				<Globe size={16} />
				<span class="flex-1">{t('rover-connect-to-server')}</span>
			</MenuItem>
		{/if}
		<MenuItem onclick={() => run(manager.refresh, close)}>
			<RefreshCw size={16} />
			<span class="flex-1">{t('rover-more-refresh')}</span>

			{@render shortcut('F5')}
		</MenuItem>
	{/snippet}
</MenuButton>
