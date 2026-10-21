<script lang="ts">
	import { bytes, plural } from '@luft/ui';
	import { describe } from '#lib/features/cloud.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import { projectSummary } from '#lib/vcs/format.js';
	import type { VcsState } from '#lib/vcs/state.svelte.js';

	interface Props {
		manager: FileManager;
		vcs: VcsState;
	}

	let { manager, vcs }: Props = $props();

	let count = $derived(manager.view === 'trash' ? manager.trash.items.length : manager.displayEntries.length);
	let selectedSize = $derived(
		manager.selection.size === 0 ? 0 : manager.selectedEntries.reduce((total, entry) => total + (entry.isDir ? 0 : entry.size), 0)
	);
	let summary = $derived.by(() => {
		if (manager.selection.size === 0) return plural(count, 'item');
		const selected = `${manager.selection.size} of ${plural(count, 'item')} selected`;
		return selectedSize > 0 ? `${selected} · ${bytes(selectedSize)}` : selected;
	});
	let cloudDrive = $derived(manager.view === 'home' ? manager.cloud.holding(manager.currentPath) : undefined);
	let drive = $derived(manager.view === 'home' && !cloudDrive ? manager.drives.holding(manager.currentPath) : undefined);
	let status = $derived.by(() => {
		if (vcs.busy === 'sync') return 'Syncing…';
		if (vcs.busy === 'save') return 'Committing…';
		if (vcs.error) return 'Version control needs attention';
		return vcs.lastResult ?? (vcs.project ? projectSummary(vcs.project) : null);
	});
</script>

<footer class="status-bar">
	<span class="min-w-0 truncate">{summary}</span>
	<span class="flex min-w-0 items-center gap-3">
		{#if manager.notice}
			<span class="truncate text-[var(--danger)]" role="status">{manager.notice}</span>
		{:else}
			{#if status}
				<span class="truncate">{status}</span>
			{/if}
			{#if cloudDrive}
				<span class="truncate">{describe(cloudDrive)}</span>
			{:else if drive}
				<span class="shrink-0">{bytes(drive.availableSpace)} free</span>
			{/if}
		{/if}
	</span>
</footer>

<style>
	.status-bar {
		display: flex;
		height: 30px;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-inline: 18px;
		color: var(--text-muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		box-shadow: 0 -1px 0 var(--hairline);
	}
</style>
