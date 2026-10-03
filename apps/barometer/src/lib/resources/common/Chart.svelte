<script lang="ts">
	import type { Line } from '#lib/graph/draw.js';
	import Graph from '#lib/graph/Graph.svelte';

	interface Legend {
		label: string;
		value: string;
		tone?: 'accent' | 'soft';
	}

	interface Props {
		title: string;
		lines: Line[];
		legend?: Legend[];
		max?: number;
		floor?: number;
		binary?: boolean;
		scale?: (max: number) => string;
		tall?: boolean;
	}

	let { title, lines, legend = [], max, floor, binary = false, scale, tall = false }: Props = $props();

	let top = $state(0);
</script>

<section class="flex min-w-0 flex-col gap-2.5">
	<div class="flex items-baseline justify-between gap-4 px-1">
		<h2 class="truncate text-[13px] font-medium text-[var(--text-soft)]">{title}</h2>
		<div class="flex items-baseline gap-4">
			{#each legend as item (item.label)}
				<span class="legend">
					<span class={['swatch', item.tone ?? 'accent']}></span>
					<span class="text-[var(--text-muted)]">{item.label}</span>
					<span class="value">{item.value}</span>
				</span>
			{/each}
		</div>
	</div>
	<div class="plot" class:tall>
		<Graph class="h-full w-full" {lines} {max} {floor} {binary} onscale={(value) => (top = value)} />
		{#if scale}
			<span class="scale">{scale(max ?? top)}</span>
		{/if}
	</div>
</section>

<style>
	.plot {
		position: relative;
		height: 132px;
		overflow: hidden;
		border-radius: var(--radius-group);
		background: var(--surface);
	}

	.plot.tall {
		height: 200px;
	}

	.scale {
		position: absolute;
		top: 8px;
		right: 12px;
		font-size: 11px;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.legend {
		display: inline-flex;
		align-items: baseline;
		gap: 6px;
		font-size: 12.5px;
	}

	.value {
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}

	.swatch {
		height: 8px;
		width: 8px;
		align-self: center;
		border-radius: var(--radius-pill);
		background: var(--accent);
	}

	.swatch.soft {
		background: var(--text-soft);
	}
</style>
