<script lang="ts">
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import type { Viewport } from '#lib/viewport/viewport.svelte.js';

	let { doc, viewport }: { doc: ImageDocument; viewport: Viewport } = $props();

	const SIZE = 20;
	const STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

	let top = $state<HTMLCanvasElement>();
	let left = $state<HTMLCanvasElement>();
	let dragging = $state<{ axis: 'x' | 'y'; index: number | null; at: number } | null>(null);

	function draw(canvas: HTMLCanvasElement, horizontal: boolean) {
		const ratio = window.devicePixelRatio;
		const length = horizontal ? viewport.width : viewport.height;
		canvas.width = Math.round((horizontal ? length : SIZE) * ratio);
		canvas.height = Math.round((horizontal ? SIZE : length) * ratio);
		const context = canvas.getContext('2d')!;
		context.scale(ratio, ratio);
		const style = getComputedStyle(canvas);
		context.strokeStyle = context.fillStyle = style.color;
		context.font = '10px "Open Runde"';
		const step = STEPS.find((candidate) => candidate * viewport.scale >= 60) ?? 10000;
		const origin = horizontal ? viewport.x : viewport.y;
		const first = Math.floor(-origin / viewport.scale / step) * step;
		context.beginPath();
		for (let value = first; value * viewport.scale + origin < length; value += step / 5) {
			const position = Math.round(value * viewport.scale + origin) + 0.5;
			const major = Math.abs(value / step - Math.round(value / step)) < 1e-6;
			const reach = major ? 4 : SIZE - 5;
			if (horizontal) {
				context.moveTo(position, SIZE);
				context.lineTo(position, reach);
				if (major) context.fillText(String(Math.round(value)), position + 3, 11);
			} else {
				context.moveTo(SIZE, position);
				context.lineTo(reach, position);
				if (major) {
					context.save();
					context.translate(11, position + 3);
					context.rotate(Math.PI / 2);
					context.fillText(String(Math.round(value)), 0, 0);
					context.restore();
				}
			}
		}
		context.stroke();
	}

	$effect(() => {
		void [viewport.x, viewport.y, viewport.scale, viewport.width, viewport.height];
		if (top) draw(top, true);
		if (left) draw(left, false);
	});

	function start(axis: 'x' | 'y', index: number | null, event: PointerEvent) {
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = { axis, index, at: index === null ? 0 : doc.guides[index].at };
	}

	function follow(event: PointerEvent) {
		if (!dragging) return;
		const rect = (event.currentTarget as HTMLElement).closest('.stage')!.getBoundingClientRect();
		const [x, y] = viewport.toDocument(event.clientX - rect.left, event.clientY - rect.top);
		dragging = { ...dragging, at: Math.round(dragging.axis === 'x' ? x : y) };
	}

	function finish() {
		const current = dragging;
		dragging = null;
		if (!current) return;
		const limit = current.axis === 'x' ? doc.width : doc.height;
		const kept = doc.guides.filter((_, index) => index !== current.index);
		doc.guides = current.at >= 0 && current.at <= limit ? [...kept, { axis: current.axis, at: current.at }] : kept;
	}

	let shown = $derived(dragging ? [...doc.guides.filter((_, index) => index !== dragging!.index), { axis: dragging.axis, at: dragging.at }] : doc.guides);
</script>

{#each shown as guide, index (index)}
	{@const position = guide.axis === 'x' ? viewport.toScreen(guide.at, 0)[0] : viewport.toScreen(0, guide.at)[1]}
	<div
		class={['guide', guide.axis === 'x' ? 'vertical' : 'horizontal']}
		style={guide.axis === 'x' ? `left:${position - 3}px` : `top:${position - 3}px`}
		role="separator"
		aria-orientation={guide.axis === 'x' ? 'vertical' : 'horizontal'}
		onpointerdown={(event) => start(guide.axis, doc.guides.indexOf(guide), event)}
		onpointermove={follow}
		onpointerup={finish}
	></div>
{/each}
<canvas bind:this={top} class="ruler top" onpointerdown={(event) => start('y', null, event)} onpointermove={follow} onpointerup={finish}></canvas>
<canvas bind:this={left} class="ruler left" onpointerdown={(event) => start('x', null, event)} onpointermove={follow} onpointerup={finish}></canvas>

<style>
	.ruler {
		position: absolute;
		background: color-mix(in oklab, var(--content) 92%, transparent);
		color: var(--text-muted);
		cursor: default;
	}

	.top {
		inset-inline: 0;
		top: 0;
		height: 20px;
		width: 100%;
		cursor: row-resize;
	}

	.left {
		top: 0;
		left: 0;
		width: 20px;
		height: 100%;
		cursor: col-resize;
	}

	.guide {
		position: absolute;
		z-index: 1;
	}

	.guide::after {
		content: '';
		position: absolute;
		background: #3fb3ff;
	}

	.vertical {
		top: 0;
		bottom: 0;
		width: 7px;
		cursor: col-resize;
	}

	.vertical::after {
		inset-block: 0;
		left: 3px;
		width: 1px;
	}

	.horizontal {
		left: 0;
		right: 0;
		height: 7px;
		cursor: row-resize;
	}

	.horizontal::after {
		inset-inline: 0;
		top: 3px;
		height: 1px;
	}
</style>
