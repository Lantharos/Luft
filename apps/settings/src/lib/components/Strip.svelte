<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="strip">{@render children()}</div>

<style>
	.strip {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 18px 28px;
		padding: 0 4px;
	}

	.strip > :global(*) {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.strip :global(.caption) {
		padding-left: 2px;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
