<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		value?: string;
		children: Snippet;
	}

	let { label, value, children }: Props = $props();
</script>

<div class="flex flex-col gap-1.5 text-[13px]">
	<span class="flex items-baseline justify-between gap-3">
		<span>{label}</span>
		{#if value}
			<span class="tabular-nums text-[var(--text-muted)]">{value}</span>
		{/if}
	</span>
	{@render children()}
</div>
