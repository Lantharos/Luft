<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tooltip } from '@luft/ui';

	interface Props {
		title: string;
		hint?: string;
		note?: string;
		dimmed?: boolean;
		children: Snippet;
	}

	let { title, hint, note, dimmed = false, children }: Props = $props();
</script>

<div class="flex min-h-10 items-center gap-4 px-1" class:opacity-60={dimmed}>
	<div class="flex min-w-0 flex-1 flex-col gap-0.5">
		{#if hint}
			<span class="self-start text-[14px] font-medium" {@attach tooltip(hint)}>{title}</span>
		{:else}
			<span class="text-[14px] font-medium">{title}</span>
		{/if}
		{#if note}
			<span class="text-[12.5px] leading-snug text-[var(--text-muted)]">{note}</span>
		{/if}
	</div>
	{@render children()}
</div>
