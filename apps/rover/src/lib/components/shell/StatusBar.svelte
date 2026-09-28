<script lang="ts">
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { formatBytes, plural } from '$lib/utils/format';
	import { projectSummary } from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		manager: FileManager;
		vcs: VcsState;
	}

	let { manager, vcs }: Props = $props();

	let count = $derived(manager.view === 'trash' ? manager.trash.items.length : manager.displayEntries.length);
	let selectedSize = $derived(
		manager.selection.size === 0 ? 0 : manager.selectedEntries.reduce((total, entry) => total + (entry.is_dir ? 0 : entry.size), 0)
	);
	let summary = $derived.by(() => {
		if (manager.selection.size === 0) return plural(count, 'item');
		const selected = `${manager.selection.size} of ${plural(count, 'item')} selected`;
		return selectedSize > 0 ? `${selected} · ${formatBytes(selectedSize)}` : selected;
	});
	let drive = $derived(manager.view === 'home' ? manager.drives.holding(manager.currentPath) : undefined);
	let status = $derived.by(() => {
		if (vcs.busy === 'sync') return 'Syncing…';
		if (vcs.busy === 'save') return vcs.project?.kind === 'pig' ? 'Saving…' : 'Committing…';
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
			{#if drive}
				<span class="shrink-0">{formatBytes(drive.available_space)} free</span>
			{/if}
		{/if}
	</span>
</footer>
