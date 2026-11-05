<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="stage">{@render children()}</div>

<style>
	.stage {
		position: relative;
		overflow: hidden;
		aspect-ratio: 5 / 2;
		border-radius: 18px;
		background: var(--control);
	}
</style>
