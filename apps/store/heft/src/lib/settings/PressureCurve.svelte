<script lang="ts">
	import { t } from '@luft/i18n';
	import { curve } from '#lib/ink/pressure.js';

	let { firmness, onchange }: { firmness: number; onchange: (firmness: number) => void } = $props();

	const SIZE = 132;
	const STEPS = 40;

	let path = $derived(
		Array.from({ length: STEPS + 1 }, (_, step) => {
			const pressure = step / STEPS;
			return `${step ? 'L' : 'M'}${(pressure * SIZE).toFixed(1)} ${(SIZE - curve(pressure, firmness) * SIZE).toFixed(1)}`;
		}).join('')
	);

	let dragging = false;

	function set(event: PointerEvent) {
		const box = (event.currentTarget as SVGElement).getBoundingClientRect();
		const x = Math.min(0.95, Math.max(0.05, (event.clientX - box.left) / box.width));
		const y = Math.min(0.95, Math.max(0.05, 1 - (event.clientY - box.top) / box.height));
		onchange(Math.max(-1, Math.min(1, Math.log2(Math.log(y) / Math.log(x)) / 1.3)));
	}
</script>

<svg
	class="curve"
	viewBox="0 0 {SIZE} {SIZE}"
	role="slider"
	tabindex="0"
	aria-label={t('settings-pressure')}
	aria-valuemin={-1}
	aria-valuemax={1}
	aria-valuenow={firmness}
	onpointerdown={(event) => {
		dragging = true;
		(event.currentTarget as SVGElement).setPointerCapture(event.pointerId);
		set(event);
	}}
	onpointermove={(event) => dragging && set(event)}
	onpointerup={() => (dragging = false)}
	onkeydown={(event) => {
		if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') onchange(Math.max(-1, firmness - 0.1));
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') onchange(Math.min(1, firmness + 0.1));
	}}
>
	<path d="M0 {SIZE}L{SIZE} 0" class="diagonal" />
	<path d={path} class="line" />
</svg>

<style>
	.curve {
		height: 132px;
		width: 132px;
		flex: none;
		border-radius: 12px;
		background: var(--control);
		touch-action: none;
		cursor: crosshair;
	}

	.diagonal {
		fill: none;
		stroke: var(--hairline);
		stroke-width: 1;
	}

	.line {
		fill: none;
		stroke: var(--accent);
		stroke-width: 2.5;
		stroke-linecap: round;
	}
</style>
