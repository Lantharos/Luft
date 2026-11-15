<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { pageMotion } from './motion';

	interface Props {
		order: number;
		children: Snippet;
	}

	let { order, children }: Props = $props();

	const motion = pageMotion();
	untrack(() => motion.switchTo(order));
</script>

<div class="page" {@attach motion.page}>{@render children()}</div>

<style>
	.page {
		grid-area: 1 / 1;
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 28px;
	}
</style>
