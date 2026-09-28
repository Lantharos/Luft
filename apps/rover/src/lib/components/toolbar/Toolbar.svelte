<script lang="ts">
	import { Segmented, tooltip, WindowControls } from '@luft/ui';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { ViewState } from '$lib/file-manager/view/view-state.svelte';
	import type { ViewMode } from '$lib/types';
	import type { VcsState } from '$lib/vcs/state.svelte';
	import MoreMenu from './MoreMenu.svelte';
	import NewMenu from './NewMenu.svelte';
	import PathBar from './PathBar.svelte';
	import SortMenu from './SortMenu.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		view: ViewState;
		vcs: VcsState;
		chooser: boolean;
	}

	let { manager, drag, view, vcs, chooser }: Props = $props();

	const VIEW_MODES: { value: ViewMode; label: string; icon: IconName }[] = [
		{ value: 'list', label: 'List', icon: 'list' },
		{ value: 'grid', label: 'Grid', icon: 'grid' },
		{ value: 'columns', label: 'Columns', icon: 'columns-3' }
	];
	const MODE_ICONS = Object.fromEntries(VIEW_MODES.map((mode) => [mode.value, mode.icon])) as Record<ViewMode, IconName>;

	let browsing = $derived(manager.view === 'home');
</script>

<header class="toolbar drag-region">
	<div class="flex shrink-0 items-center gap-0.5">
		<button class="icon-button" type="button" aria-label="Back" disabled={!manager.tabs.canGoBack} onclick={manager.goBack} {@attach tooltip('Back')}>
			<Icon name="chevron-left" size={19} />
		</button>
		<button
			class="icon-button"
			type="button"
			aria-label="Forward"
			disabled={!manager.tabs.canGoForward}
			onclick={manager.goForward}
			{@attach tooltip('Forward')}
		>
			<Icon name="chevron-right" size={19} />
		</button>
		<button
			class="icon-button"
			type="button"
			aria-label="Parent folder"
			disabled={!browsing || manager.currentPath === '/'}
			onclick={manager.goUp}
			{@attach tooltip('Parent folder')}
		>
			<Icon name="arrow-up" size={17} />
		</button>
	</div>

	<PathBar {manager} {drag} {view} acceptsDrops={!chooser} />

	<div class="flex shrink-0 items-center gap-1" data-no-drag>
		{#if vcs.project && browsing}
			<button
				class={['vcs-chip', vcs.panelOpen && 'is-on']}
				type="button"
				onclick={() => (vcs.panelOpen = !vcs.panelOpen)}
				{@attach tooltip('Changes')}
			>
				<Icon name="git-branch" size={15} />
				<span class="truncate">{vcs.project.branchOrWorkspace ?? (vcs.project.kind === 'pig' ? 'Pig' : 'Git')}</span>
				{#if vcs.project.changedCount > 0}
					<span class="text-[var(--text-muted)]">{vcs.project.changedCount}</span>
				{/if}
			</button>
		{/if}
		{#if browsing}
			<Segmented options={VIEW_MODES} value={manager.viewMode} label="View" onchange={manager.setViewMode}>
				{#snippet item(option)}
					<Icon name={MODE_ICONS[option.value]} size={16} />
				{/snippet}
			</Segmented>
			<SortMenu {manager} />
			{#if !chooser}
				<NewMenu {manager} />
			{/if}
		{/if}
		<button
			class={['icon-button', view.detailsOpen && 'is-on']}
			type="button"
			aria-label="Details"
			aria-pressed={view.detailsOpen}
			onclick={view.toggleDetails}
			{@attach tooltip('Details')}
		>
			<Icon name="panel-right" size={17} />
		</button>
		<MoreMenu {manager} {view} {chooser} />
	</div>

	<WindowControls />
</header>
