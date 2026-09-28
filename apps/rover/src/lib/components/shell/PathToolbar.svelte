<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import PathBar from '$lib/components/shell/PathBar.svelte';
	import SortMenu from '$lib/components/shell/SortMenu.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { ViewMode } from '$lib/types';
	import { projectSummary } from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		vcs: VcsState;
		chooserMode: boolean;
	}

	let { manager, drag, vcs, chooserMode }: Props = $props();

	const VIEW_MODES: { value: ViewMode; label: string; icon: 'list' | 'grid' | 'columns' }[] = [
		{ value: 'list', label: 'List', icon: 'list' },
		{ value: 'grid', label: 'Grid', icon: 'grid' },
		{ value: 'columns', label: 'Table', icon: 'columns' }
	];

	let nothingSelected = $derived(manager.selection.size === 0);

	function navButton(disabled: boolean) {
		return [
			'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition-[background-color,color,transform,opacity] duration-150',
			disabled ? 'opacity-35' : 'hover:bg-[var(--surface-soft)] hover:text-[var(--text)] active:scale-[0.96]'
		];
	}
</script>

<div class="flex shrink-0 flex-col gap-2 px-5 pb-3" data-no-drag>
	<div class="flex min-h-10 items-center gap-2">
		<button class={navButton(!manager.tabs.canGoBack)} type="button" aria-label="Back" disabled={!manager.tabs.canGoBack} onclick={manager.goBack}>
			<Icon name="arrow-left" size={18} />
		</button>
		<button
			class={navButton(!manager.tabs.canGoForward)}
			type="button"
			aria-label="Forward"
			disabled={!manager.tabs.canGoForward}
			onclick={manager.goForward}
		>
			<Icon name="arrow-right" size={18} />
		</button>
		<button class={navButton(false)} type="button" aria-label="Parent folder" onclick={manager.goUp}>
			<Icon name="chevron-up" size={18} />
		</button>
		<PathBar {manager} {drag} acceptsDrops={!chooserMode} />
	</div>

	<div class="flex min-h-10 items-center justify-between gap-3">
		<div class="flex min-w-0 items-center gap-1">
			{#if !chooserMode}
				<button class="command-button" type="button" onclick={() => manager.startCreate('folder')}>
					<Icon name="folder-plus" size={16} />
					<span>New folder</span>
				</button>
				<button class="tool-button" type="button" aria-label="New file" onclick={() => manager.startCreate('file')}>
					<Icon name="file-plus" size={16} />
				</button>
				<div class="mx-1 h-5 w-px bg-[var(--hairline)]"></div>
				<button class="tool-button" type="button" aria-label="Cut" disabled={nothingSelected} onclick={manager.actions.cut}>
					<Icon name="scissors" size={16} />
				</button>
				<button class="tool-button" type="button" aria-label="Copy" disabled={nothingSelected} onclick={manager.actions.copy}>
					<Icon name="copy" size={16} />
				</button>
				<button
					class="tool-button"
					type="button"
					aria-label="Paste"
					disabled={manager.clipboard.items.length === 0}
					onclick={manager.actions.paste}
				>
					<Icon name="clipboard" size={16} />
				</button>
				<button
					class="tool-button"
					type="button"
					aria-label="Move to trash"
					disabled={nothingSelected}
					onclick={manager.actions.trashSelected}
				>
					<Icon name="trash-2" size={16} />
				</button>
				<button
					class={['tool-button', settings.value.showHidden && 'bg-[var(--sidebar-active)] text-[var(--text)]']}
					type="button"
					aria-pressed={settings.value.showHidden}
					aria-label={settings.value.showHidden ? 'Hide hidden files' : 'Show hidden files'}
					onclick={manager.toggleHidden}
				>
					<Icon name={settings.value.showHidden ? 'eye' : 'eye-off'} size={16} />
				</button>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-1">
			{#if vcs.project}
				<button class="command-button max-w-[280px]" type="button" onclick={() => (vcs.panelOpen = !vcs.panelOpen)}>
					<Icon name="code" size={16} />
					<span class="truncate">{projectSummary(vcs.project)}</span>
				</button>
			{/if}

			<SortMenu sortBy={settings.value.sortBy} sortAsc={settings.value.sortAsc} onSort={manager.setSortBy} />

			<div class="flex rounded-full bg-[var(--control)] p-1 shadow-[inset_0_1px_0_var(--hairline)]">
				{#each VIEW_MODES as mode (mode.value)}
					<button
						class={[
							'grid h-8 w-8 place-items-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-[0.96]',
							manager.viewMode === mode.value
								? 'bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_2px_var(--shadow-faint)]'
								: 'text-[var(--text-muted)] hover:text-[var(--text)]'
						]}
						type="button"
						aria-label={mode.label}
						aria-pressed={manager.viewMode === mode.value}
						onclick={() => manager.setViewMode(mode.value)}
					>
						<Icon name={mode.icon} size={16} />
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
