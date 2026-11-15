<script lang="ts">
	import type { PageMotion } from '@luft/ui';
	import { untrack, type Snippet } from 'svelte';

	interface Props {
		motion: PageMotion;
		order: number;
		children: Snippet;
	}

	let { motion, order, children }: Props = $props();

	untrack(() => motion.switchTo(order));
</script>

<div class="flex min-h-0 flex-1 flex-col" {@attach motion.page}>{@render children()}</div>
