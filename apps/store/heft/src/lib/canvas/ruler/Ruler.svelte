<script lang="ts">
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import { t } from '@luft/i18n';
	import { MM } from '#lib/library/model.js';
	import { pen } from '#lib/input/pen.svelte.js';
	import { RULER_DEPTH, RULER_LENGTH, type Ruler } from './ruler.svelte';

	let { ruler, zoom }: { ruler: Ruler; zoom: number } = $props();

	const id = $props.id();
	const KNOB = 210;
	const WHEEL_STEP = Math.PI / 180;

	const touches = new Map<number, { x: number; y: number }>();
	let turning: { id: number } | null = null;
	let element: HTMLDivElement;

	let millimetre = $derived(MM * zoom);

	function origin() {
		const rect = element.parentElement!.getBoundingClientRect();
		return { left: rect.left, top: rect.top };
	}

	function down(event: PointerEvent) {
		if (event.pointerType === 'pen' || (event.pointerType === 'touch' && pen.palmLikely)) return;
		event.stopPropagation();
		element.setPointerCapture(event.pointerId);
		touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
	}

	function move(event: PointerEvent) {
		const last = touches.get(event.pointerId);
		if (!last) return;
		const next = { x: event.clientX, y: event.clientY };
		const other = [...touches].find(([id]) => id !== event.pointerId)?.[1];
		if (other) {
			const before = Math.atan2(last.y - other.y, last.x - other.x);
			const after = Math.atan2(next.y - other.y, next.x - other.x);
			ruler.moveBy((next.x - last.x) / 2, (next.y - last.y) / 2);
			ruler.angle += after - before;
		} else ruler.moveBy(next.x - last.x, next.y - last.y);
		touches.set(event.pointerId, next);
	}

	function up(event: PointerEvent) {
		touches.delete(event.pointerId);
		if (!touches.size) ruler.turnTo(ruler.angle);
	}

	function grabKnob(event: PointerEvent) {
		if (event.pointerType === 'touch' && pen.palmLikely) return;
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		turning = { id: event.pointerId };
	}

	function turnKnob(event: PointerEvent) {
		if (turning?.id !== event.pointerId) return;
		const { left, top } = origin();
		ruler.turnTo(Math.atan2(event.clientY - top - ruler.y, event.clientX - left - ruler.x));
	}

	function wheel(event: WheelEvent) {
		if (event.ctrlKey) return;
		event.preventDefault();
		event.stopPropagation();
		ruler.turnTo(ruler.angle + Math.sign(event.deltaY) * WHEEL_STEP * (event.shiftKey ? 15 : 1));
	}
</script>

<div
	bind:this={element}
	class="ruler"
	role="slider"
	tabindex="-1"
	aria-label={t('ruler-label')}
	aria-valuenow={ruler.degrees()}
	aria-valuemin={0}
	aria-valuemax={90}
	style:width="{RULER_LENGTH}px"
	style:height="{RULER_DEPTH}px"
	style:transform="translate({ruler.x - RULER_LENGTH / 2}px, {ruler.y - RULER_DEPTH / 2}px) rotate({ruler.angle}rad)"
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onwheel={wheel}
>
	<svg class="ticks" width={RULER_LENGTH} height={RULER_DEPTH} aria-hidden="true">
		<defs>
			<pattern id="ticks-{id}" width={millimetre * 10} height={RULER_DEPTH} patternUnits="userSpaceOnUse" x={RULER_LENGTH / 2}>
				{#each Array.from({ length: 10 }, (_, index) => index) as index (index)}
					{@const long = index === 0 ? 16 : index === 5 ? 11 : 7}
					<line x1={index * millimetre} x2={index * millimetre} y1="0" y2={long} />
					<line x1={index * millimetre} x2={index * millimetre} y1={RULER_DEPTH} y2={RULER_DEPTH - long} />
				{/each}
			</pattern>
		</defs>
		<rect width={RULER_LENGTH} height={RULER_DEPTH} fill="url(#ticks-{id})" />
	</svg>
	<span class="angle tabular-nums">{t('ruler-angle', { degrees: ruler.degrees() })}</span>
	<span
		class="knob"
		role="presentation"
		style:left="{RULER_LENGTH / 2 + KNOB - 15}px"
		onpointerdown={grabKnob}
		onpointermove={turnKnob}
		onpointerup={() => (turning = null)}
		onpointercancel={() => (turning = null)}
	>
		<RotateCw size={14} />
	</span>
</div>

<style>
	.ruler {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 3;
		border-radius: 10px;
		background: color-mix(in oklab, var(--popover) 78%, transparent);
		backdrop-filter: blur(6px);
		box-shadow:
			0 0 0 1px var(--hairline),
			0 10px 30px var(--shadow-faint);
		touch-action: none;
		cursor: grab;
		transform-origin: center;
	}

	.ticks {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.ticks line {
		stroke: var(--text-muted);
		stroke-width: 1;
	}

	.angle {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-soft);
		pointer-events: none;
	}

	.knob {
		position: absolute;
		top: calc(50% - 15px);
		display: grid;
		height: 30px;
		width: 30px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--control);
		color: var(--text-soft);
		cursor: alias;
	}
</style>
