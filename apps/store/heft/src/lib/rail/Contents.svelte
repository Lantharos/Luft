<script lang="ts">
	import type { Heading } from '#lib/pdf/outline.js';

	let { headings, current, onjump }: { headings: Heading[]; current: number; onjump: (index: number) => void } = $props();

	let active = $derived(headings.findLastIndex((heading) => heading.page >= 0 && heading.page <= current));
</script>

<ol class="flex flex-col px-3 pt-2 pb-6">
	{#each headings as heading, index (index)}
		<li>
			<button
				type="button"
				class="heading"
				style:padding-left="{10 + heading.depth * 14}px"
				aria-current={index === active ? 'location' : undefined}
				disabled={heading.page < 0}
				onclick={() => onjump(heading.page)}
			>
				<span class="min-w-0 flex-1 truncate">{heading.title}</span>
				<span class="tabular-nums text-(--sidebar-text-muted)">{heading.page + 1}</span>
			</button>
		</li>
	{/each}
</ol>

<style>
	.heading {
		display: flex;
		width: 100%;
		min-height: 34px;
		align-items: center;
		gap: 8px;
		border-radius: 10px;
		padding-right: 10px;
		font-size: 13px;
		text-align: left;
		color: var(--sidebar-text);
	}

	.heading:hover:not(:disabled) {
		background: var(--sidebar-control);
	}

	.heading[aria-current] {
		background: var(--sidebar-active);
	}

	.heading:disabled {
		opacity: 0.5;
	}
</style>
