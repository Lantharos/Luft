<script lang="ts">
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import { formatBytes, plural } from '$lib/utils/format';
	import { projectSummary } from '$lib/vcs/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		manager: FileManager;
		vcs: VcsState;
	}

	let { manager, vcs }: Props = $props();

	let itemCount = $derived.by(() => {
		if (manager.view === 'trash') return manager.trash.items.length;
		if (manager.view === 'drives') return manager.drives.list.length;
		if (manager.view === 'favorites') return settings.value.favorites.length;
		return manager.displayEntries.length;
	});

	let summary = $derived(
		vcs.project ? `${plural(itemCount, 'item')} · ${projectSummary(vcs.project)}` : plural(itemCount, 'item')
	);

	let status = $derived.by(() => {
		if (vcs.busy === 'sync') return 'Syncing...';
		if (vcs.busy === 'save') return vcs.project?.kind === 'pig' ? 'Saving...' : 'Committing...';
		if (vcs.error) return 'Version control needs attention';
		if (vcs.lastResult) return vcs.lastResult;
		if (manager.selection.size === 0) return 'Ready';
		const size = manager.selectedEntries.reduce((total, entry) => total + (entry.is_dir ? 0 : entry.size), 0);
		return `${manager.selection.size} selected${size > 0 ? ` (${formatBytes(size)})` : ''}`;
	});
</script>

<footer
	class="flex h-8 shrink-0 items-center justify-between gap-3 bg-[var(--content)] px-5 text-[12px] text-[var(--text-muted)] shadow-[0_-1px_0_var(--hairline)]"
>
	<span class="min-w-0 truncate">{summary}</span>
	{#if manager.notice}
		<span class="min-w-0 truncate text-[var(--danger)]" role="status">{manager.notice}</span>
	{:else}
		<span class="shrink-0">{status}</span>
	{/if}
</footer>
