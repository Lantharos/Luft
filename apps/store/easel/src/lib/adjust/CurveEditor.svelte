<script lang="ts">
	import { t } from '@luft/i18n';
	import type { CurvePoint } from './adjustments';
	import { lutOf, newAdjustment } from './adjustments';

	let { points, onchange }: { points: CurvePoint[]; onchange: (points: CurvePoint[]) => void } = $props();

	const SIZE = 240;
	const GRAB = 0.05;

	let box = $state<SVGSVGElement>();
	let dragging = $state<number | null>(null);

	let path = $derived.by(() => {
		const lut = lutOf({ ...newAdjustment('curves'), curve: points });
		return Array.from({ length: 64 }, (_, step) => {
			const index = Math.round((step / 63) * 255);
			return `${step ? 'L' : 'M'}${(index / 255) * SIZE} ${SIZE - (lut[index * 4] / 255) * SIZE}`;
		}).join(' ');
	});

	function local(event: PointerEvent): CurvePoint {
		const rect = box!.getBoundingClientRect();
		return [Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))];
	}

	function down(event: PointerEvent) {
		const point = local(event);
		box!.setPointerCapture(event.pointerId);
		const near = points.findIndex(([x, y]) => Math.hypot(x - point[0], y - point[1]) < GRAB);
		if (near >= 0) return (dragging = near);
		const next = [...points, point].sort((a, b) => a[0] - b[0]);
		dragging = next.indexOf(point);
		onchange(next);
	}

	function move(event: PointerEvent) {
		if (dragging === null) return;
		const [x, y] = local(event);
		const next = points.map((point, index) => (index === dragging ? ([index === 0 ? 0 : index === points.length - 1 ? 1 : x, y] as CurvePoint) : point));
		onchange(next);
	}

	function up() {
		dragging = null;
	}
</script>

<svg bind:this={box} class="curve" viewBox="0 0 {SIZE} {SIZE}" role="img" aria-label={t('easel-curve')} onpointerdown={down} onpointermove={move} onpointerup={up}>
	{#each [0.25, 0.5, 0.75] as line (line)}
		<line class="grid" x1={line * SIZE} y1="0" x2={line * SIZE} y2={SIZE} />
		<line class="grid" x1="0" y1={line * SIZE} x2={SIZE} y2={line * SIZE} />
	{/each}
	<line class="grid" x1="0" y1={SIZE} x2={SIZE} y2="0" />
	<path class="line" d={path} />
	{#each points as [x, y], index (index)}
		<circle class="point" cx={x * SIZE} cy={SIZE - y * SIZE} r="5" />
	{/each}
</svg>

<style>
	.curve {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 12px;
		background: var(--surface);
		touch-action: none;
		cursor: crosshair;
	}

	.grid {
		stroke: var(--hairline);
		stroke-width: 1;
	}

	.line {
		fill: none;
		stroke: var(--text);
		stroke-width: 2;
	}

	.point {
		fill: var(--popover);
		stroke: var(--text);
		stroke-width: 2;
	}
</style>
