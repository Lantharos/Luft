<script lang="ts">
	import type { Paper } from '#lib/library/model.js';
	import { LOOKS, ruling } from './templates';

	let { paper, width, height, id }: { paper: Paper; width: number; height: number; id: string } = $props();

	let look = $derived(LOOKS[paper.color]);
	let rules = $derived(ruling(paper, width, height));
</script>

<svg class="absolute inset-0 size-full" viewBox="0 0 {width} {height}" preserveAspectRatio="none" aria-hidden="true">
	<rect {width} {height} fill={look.background} />
	{#if rules.dots}
		<defs>
			<pattern id="dots-{id}" width={rules.dots.spacing} height={rules.dots.spacing} x={rules.dots.offset} y={rules.dots.offset} patternUnits="userSpaceOnUse">
				<circle cx={rules.dots.spacing / 2} cy={rules.dots.spacing / 2} r="0.95" fill={look.line} />
			</pattern>
		</defs>
		<rect {width} {height} fill="url(#dots-{id})" />
	{/if}
	{#if rules.lines}
		<path d={rules.lines} stroke={look.line} stroke-width="1" vector-effect="non-scaling-stroke" fill="none" />
	{/if}
	{#if rules.accents}
		<path d={rules.accents} stroke={paper.template === 'lined' ? look.accent : look.line} stroke-width="1.4" vector-effect="non-scaling-stroke" fill="none" />
	{/if}
</svg>
