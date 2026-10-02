<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Summary } from '$lib/mail/list.svelte';
	import { BUNDLES, PRIMARY } from '$lib/mail/views';

	interface Props {
		summary: Summary;
		onopen: () => void;
	}

	let { summary, onopen }: Props = $props();

	let Icon = $derived([...PRIMARY, ...BUNDLES].find((view) => view.id === summary.view)?.icon);
	let description = $derived(
		summary.view === 'screener' ? `${summary.count} waiting` : `${summary.count} new`
	);
</script>

<button type="button" class="summary" onclick={onopen}>
	<span class="icon">
		{#if Icon}<Icon size={17} />{/if}
	</span>
	<div class="min-w-0 flex-1 text-left">
		<p class="truncate text-[14px] font-semibold text-[var(--text)]">{summary.label}<span class="ml-2 font-normal text-[var(--text-muted)]">{description}</span></p>
		<p class="truncate text-[12.5px] text-[var(--text-muted)]">{summary.names.join(', ')}</p>
	</div>
	<ChevronRight size={17} class="flex-none text-[var(--text-muted)]" />
</button>

<style>
	.summary {
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: 16px;
		padding: 0 14px 0 10px;
		transition: background-color 120ms var(--ease);
	}

	.summary:hover {
		background: var(--surface);
	}

	.icon {
		display: grid;
		height: 36px;
		width: 36px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--accent-soft);
		color: var(--accent);
	}
</style>
