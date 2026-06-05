<script lang="ts">
	import { formatBytes } from '$lib/utils';
	import { projectSummary } from '$lib/vcs/format';
	import type { VcsBusyState, VcsProject } from '$lib/vcs/types';

	interface Props {
		itemCount: number;
		selectedCount: number;
		selectedSize: number;
		vcsProject?: VcsProject | null;
		vcsBusy?: VcsBusyState;
		vcsMessage?: string | null;
		vcsError?: string | null;
	}

	let {
		itemCount,
		selectedCount,
		selectedSize,
		vcsProject = null,
		vcsBusy = null,
		vcsMessage = null,
		vcsError = null
	}: Props = $props();

	let leftText = $derived.by(() => {
		const count = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
		return vcsProject ? `${count} · ${projectSummary(vcsProject)}` : count;
	});
</script>

<footer
	class="flex h-8 shrink-0 items-center justify-between gap-3 bg-[var(--content)] px-5 text-[12px] text-[var(--text-muted)] shadow-[0_-1px_0_var(--hairline)]"
>
	<span class="min-w-0 truncate">{leftText}</span>
	<span>
		{#if vcsBusy === 'sync'}
			Syncing...
		{:else if vcsBusy === 'save'}
			{vcsProject?.kind === 'pig' ? 'Saving...' : 'Committing...'}
		{:else if vcsError}
			Version control needs attention
		{:else if vcsMessage}
			{vcsMessage}
		{:else if selectedCount > 0}
			{selectedCount} selected{selectedSize > 0 ? ` (${formatBytes(selectedSize)})` : ''}
		{:else}
			Ready
		{/if}
	</span>
</footer>
