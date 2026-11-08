<script lang="ts">
	import { css } from '#lib/ink/color.js';
	import type { Pen } from '#lib/ink/builder.js';

	let { pen, size = 22 }: { pen: Pen; size?: number } = $props();

	let dot = $derived(Math.min(size, Math.max(6, pen.tool === 'highlighter' ? size * 0.8 : 6 + pen.width * 2.6)));
</script>

<span class="swatch grid place-items-center" style:width="{size}px" style:height="{size}px">
	{#if pen.tool === 'highlighter'}
		<span class="highlighter" style:width="{dot * 0.62}px" style:height="{dot}px" style:background={css(pen.color)}></span>
	{:else}
		<span class="rounded-full" style:width="{dot}px" style:height="{dot}px" style:background={css(pen.color)}></span>
	{/if}
</span>

<style>
	.highlighter {
		border-radius: 3px;
		opacity: 0.75;
		transform: rotate(18deg);
	}

	.rounded-full {
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 14%, transparent);
	}
</style>
