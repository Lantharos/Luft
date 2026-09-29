<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<aside class="side-panel" aria-label={label}>
	{@render children()}
</aside>

<style>
	.side-panel {
		display: flex;
		width: 232px;
		flex: none;
		flex-direction: column;
		background: var(--sidebar-solid);
		color: var(--sidebar-text);
		padding-top: 8px;
	}
</style>
