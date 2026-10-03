<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import { draw, niceCeiling, peak, type Frame, type Line } from './draw';
	import { SLIDE_MS, slide } from './motion';

	interface Props {
		lines: Line[];
		max?: number;
		floor?: number;
		binary?: boolean;
		compact?: boolean;
		grid?: boolean;
		class?: ClassValue;
		onscale?: (max: number) => void;
	}

	let { lines, max, floor = 1, binary = false, compact = false, grid = !compact, class: className, onscale }: Props = $props();

	let canvas = $state<HTMLCanvasElement>();
	let width = $state(0);
	let height = $state(0);
	let shown = 0;
	let revision = -1;
	let tween = 0;

	const capacity = $derived(monitor.capacity);
	const step = $derived(width / Math.max(1, capacity - 1));
	const target = $derived(max ?? niceCeiling(peak(lines, capacity), floor, binary));
	const animated = $derived(!compact && settings.value.animateGraphs);

	$effect(() => onscale?.(target));

	$effect(() => {
		if (!canvas || width === 0 || height === 0) return;
		const next = monitor.revision;
		const advanced = next === revision + 1;
		revision = next;
		const frame: Frame = { width, height, step, capacity, max: shown || target, thickness: compact ? 1.25 : 1.75, inset: compact ? 2 : 3 };
		cancelAnimationFrame(tween);
		if (animated && advanced && shown && shown !== target) {
			scale(frame, shown, target);
		} else {
			shown = target;
			draw(canvas, lines, { ...frame, max: target });
		}
		if (animated && advanced) slide(canvas, step);
	});

	function scale(frame: Frame, from: number, to: number) {
		const started = performance.now();
		const target = canvas!;
		const run = (now: number) => {
			const progress = Math.min(1, (now - started) / SLIDE_MS);
			const eased = 1 - (1 - progress) ** 3;
			shown = from + (to - from) * eased;
			draw(target, lines, { ...frame, max: shown });
			if (progress < 1) tween = requestAnimationFrame(run);
		};
		tween = requestAnimationFrame(run);
	}
</script>

<div class={['graph', className]} bind:clientWidth={width} bind:clientHeight={height}>
	{#if grid}
		<span class="rule" style:top="25%"></span>
		<span class="rule" style:top="50%"></span>
		<span class="rule" style:top="75%"></span>
	{/if}
	<canvas bind:this={canvas} style:width="{width + step}px" style:height="{height}px" style:transform="translateX({-step}px)"></canvas>
</div>

<style>
	.graph {
		position: relative;
		overflow: hidden;
		contain: strict;
	}

	canvas {
		position: absolute;
		top: 0;
		left: 0;
	}

	.rule {
		position: absolute;
		right: 0;
		left: 0;
		height: 1px;
		background: var(--hairline);
	}
</style>
