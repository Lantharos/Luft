<script lang="ts">
	import { apply } from '#lib/gpu/matrix.js';
	import { arrowHead, type ShapeSpec } from '#lib/raster/shapes.js';
	import type { Viewport } from '#lib/viewport/viewport.svelte.js';
	import type { Overlay } from './overlay';

	interface Props {
		viewport: Viewport;
		overlay: Overlay | null;
		shape: ShapeSpec | null;
		cursor: { x: number; y: number; radius: number } | null;
		width: number;
		height: number;
	}

	let { viewport, overlay, shape, cursor, width, height }: Props = $props();

	let view = $derived(`matrix(${viewport.scale} 0 0 ${viewport.scale} ${viewport.x} ${viewport.y})`);

	function corners(entry: Extract<Overlay, { kind: 'transform' }>) {
		const { x, y, width: w, height: h, matrix } = entry;
		return [apply(matrix, x, y), apply(matrix, x + w, y), apply(matrix, x + w, y + h), apply(matrix, x, y + h)].map(([px, py]) => viewport.toScreen(px, py));
	}

	function screenRect(rect: { x: number; y: number; width: number; height: number }) {
		const [x, y] = viewport.toScreen(rect.x, rect.y);
		return { x, y, width: rect.width * viewport.scale, height: rect.height * viewport.scale };
	}
</script>

<svg class="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
	{#if overlay?.kind === 'marquee'}
		{@const rect = screenRect(overlay.rect)}
		{#if overlay.shape === 'ellipse'}
			<ellipse class="ants" cx={rect.x + rect.width / 2} cy={rect.y + rect.height / 2} rx={rect.width / 2} ry={rect.height / 2} />
		{:else}
			<rect class="ants" {...rect} />
		{/if}
	{:else if overlay?.kind === 'lasso'}
		<g transform={view}>
			<polyline class="ants" points={overlay.points.join(' ')} vector-effect="non-scaling-stroke" />
		</g>
	{:else if overlay?.kind === 'line'}
		{@const [x1, y1] = viewport.toScreen(...overlay.from)}
		{@const [x2, y2] = viewport.toScreen(...overlay.to)}
		<line class="guide" {x1} {y1} {x2} {y2} />
		<circle class="handle" cx={x1} cy={y1} r="5" />
		<circle class="handle" cx={x2} cy={y2} r="5" />
	{:else if overlay?.kind === 'transform'}
		{@const points = corners(overlay)}
		<polygon class="frame" points={points.map(([x, y]) => `${x},${y}`).join(' ')} />
		{#each points as [x, y], index (index)}
			<rect class="handle" x={x - 5} y={y - 5} width="10" height="10" rx="3" />
		{/each}
	{:else if overlay?.kind === 'crop'}
		{@const doc = screenRect({ x: 0, y: 0, width, height })}
		{@const rect = screenRect(overlay.rect)}
		<path class="shade" fill-rule="evenodd" d="M{doc.x} {doc.y}h{doc.width}v{doc.height}h{-doc.width}Z M{rect.x} {rect.y}v{rect.height}h{rect.width}v{-rect.height}Z" />
		<rect class="frame" {...rect} />
		{#each [1, 2] as third (third)}
			<line class="third" x1={rect.x + (rect.width * third) / 3} y1={rect.y} x2={rect.x + (rect.width * third) / 3} y2={rect.y + rect.height} />
			<line class="third" x1={rect.x} y1={rect.y + (rect.height * third) / 3} x2={rect.x + rect.width} y2={rect.y + (rect.height * third) / 3} />
		{/each}
		<path class="corner" d="M{rect.x} {rect.y + 18}V{rect.y}H{rect.x + 18} M{rect.x + rect.width - 18} {rect.y}H{rect.x + rect.width}V{rect.y + 18} M{rect.x + rect.width} {rect.y + rect.height - 18}V{rect.y + rect.height}H{rect.x + rect.width - 18} M{rect.x + 18} {rect.y + rect.height}H{rect.x}V{rect.y + rect.height - 18}" />
	{/if}
	{#if shape}
		<g transform={view} style:color={shape.color}>
			{#if shape.kind === 'rectangle'}
				<rect class={['shape', shape.filled && 'filled']} x={Math.min(shape.from[0], shape.to[0])} y={Math.min(shape.from[1], shape.to[1])} width={Math.abs(shape.to[0] - shape.from[0])} height={Math.abs(shape.to[1] - shape.from[1])} stroke-width={shape.width} />
			{:else if shape.kind === 'ellipse'}
				<ellipse class={['shape', shape.filled && 'filled']} cx={(shape.from[0] + shape.to[0]) / 2} cy={(shape.from[1] + shape.to[1]) / 2} rx={Math.abs(shape.to[0] - shape.from[0]) / 2} ry={Math.abs(shape.to[1] - shape.from[1]) / 2} stroke-width={shape.width} />
			{:else}
				<line class="shape" x1={shape.from[0]} y1={shape.from[1]} x2={shape.to[0]} y2={shape.to[1]} stroke-width={shape.width} />
				{#if shape.kind === 'arrow'}
					<polyline class="shape" points={arrowHead(shape.from, shape.to, shape.width).map((point) => point.join(',')).join(' ')} stroke-width={shape.width} />
				{/if}
			{/if}
		</g>
	{/if}
	{#if cursor}
		{@const [x, y] = viewport.toScreen(cursor.x, cursor.y)}
		<circle class="cursor-ring" cx={x} cy={y} r={Math.max(1.5, cursor.radius * viewport.scale)} />
		<circle class="cursor-ring inner" cx={x} cy={y} r={Math.max(1.5, cursor.radius * viewport.scale)} />
	{/if}
</svg>

<style>
	svg * {
		fill: none;
	}

	.ants {
		stroke: #fff;
		stroke-width: 1.5;
		stroke-dasharray: 6 5;
		filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.8));
	}

	.guide,
	.frame {
		stroke: #fff;
		stroke-width: 1.5;
		filter: drop-shadow(0 0 1.5px rgba(0, 0, 0, 0.7));
	}

	.third {
		stroke: rgba(255, 255, 255, 0.4);
		stroke-width: 1;
	}

	.shade {
		fill: rgba(0, 0, 0, 0.5);
	}

	.corner {
		stroke: #fff;
		stroke-width: 4;
		stroke-linecap: round;
	}

	.handle {
		fill: #fff;
		stroke: rgba(0, 0, 0, 0.35);
		stroke-width: 1;
	}

	.shape {
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.shape.filled {
		fill: currentColor;
		stroke: none;
	}

	.cursor-ring {
		stroke: rgba(0, 0, 0, 0.6);
		stroke-width: 2.5;
	}

	.cursor-ring.inner {
		stroke: #fff;
		stroke-width: 1;
	}
</style>
