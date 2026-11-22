<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { PageMotion, providePageMotion } from './motion';

	interface Props {
		page: unknown;
		order?: number;
		depth?: number;
		scrolls?: boolean;
		class?: ClassValue;
		children: Snippet;
	}

	let { page, order = 0, depth = 0, scrolls = true, class: className, children }: Props = $props();

	const motion = providePageMotion(new PageMotion());

	$effect.pre(() => {
		void page;
		untrack(() => motion.arrive({ order, depth }));
	});
</script>

{#snippet current()}
	{#key page}
		<div class={['page-stage-page', className]} {@attach motion.page}>{@render children()}</div>
	{/key}
{/snippet}

<div class="page-stage">
	<div class="page-stage-ghosts" {@attach motion.layer}></div>
	{#if scrolls}
		<div class="page-stage-scroller" {@attach motion.scroller}>{@render current()}</div>
	{:else}
		{@render current()}
	{/if}
</div>
