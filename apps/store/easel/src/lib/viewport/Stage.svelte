<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ToolEvent, ToolHandler } from '#lib/tools/tool.js';
	import { Navigation } from './navigation';
	import type { Surface } from './surface';
	import type { Viewport } from './viewport.svelte';

	interface Props {
		viewport: Viewport;
		surface: (canvas: HTMLCanvasElement) => Surface;
		handler: ToolHandler | null;
		cursor?: string;
		fingerPans?: boolean;
		connect: (invalidate: () => void) => void;
		onhover?: (event: ToolEvent | null) => void;
		adjust?: (event: ToolEvent) => ToolEvent;
		children?: Snippet;
	}

	let { viewport, surface, handler, cursor = 'default', fingerPans = false, connect, onhover, adjust = (event) => event, children }: Props = $props();

	const ERASER_BUTTON = 32;

	let host = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();
	let navigation: Navigation | null = null;
	let panning = $state(false);
	let spaceHeld = $state(false);
	let drawing: number | null = null;

	$effect(() => {
		if (!host || !canvas) return;
		const target = canvas;
		const presenter = surface(target);
		navigation = new Navigation(host, viewport, { fingerPans });
		connect(presenter.invalidate);
		viewport.onchange = presenter.invalidate;
		const observer = new ResizeObserver(([entry]) => {
			const ratio = window.devicePixelRatio;
			const { width, height } = entry.contentRect;
			target.width = Math.max(1, Math.round(width * ratio));
			target.height = Math.max(1, Math.round(height * ratio));
			viewport.resize(width, height, ratio);
			presenter.draw();
		});
		observer.observe(host);
		const wheel = (event: WheelEvent) => navigation?.wheel(event);
		host.addEventListener('wheel', wheel, { passive: false });
		return () => {
			host?.removeEventListener('wheel', wheel);
			observer.disconnect();
			presenter.destroy();
		};
	});

	function toolEvent(event: PointerEvent): ToolEvent {
		const { x: localX, y: localY } = navigation!.local(event);
		const [x, y] = viewport.toDocument(localX, localY);
		const sample = (point: PointerEvent) => {
			const local = navigation!.local(point);
			const [px, py] = viewport.toDocument(local.x, local.y);
			return { x: px, y: py, pressure: point.pointerType === 'pen' ? point.pressure : 1 };
		};
		const coalesced = event.type === 'pointermove' ? event.getCoalescedEvents() : [];
		return adjust({
			x,
			y,
			localX,
			localY,
			pressure: event.pointerType === 'pen' ? event.pressure : 1,
			pointer: event.pointerType,
			shift: event.shiftKey,
			alt: event.altKey,
			ctrl: event.ctrlKey || event.metaKey,
			eraser: event.pointerType === 'pen' && (event.buttons & ERASER_BUTTON) !== 0,
			samples: (coalesced.length ? coalesced : [event]).map(sample)
		});
	}

	function down(event: PointerEvent) {
		if (!navigation) return;
		navigation.spaceHeld = spaceHeld;
		if (navigation.claims(event)) {
			event.preventDefault();
			navigation.down(event);
			panning = true;
			return;
		}
		if (event.button !== 0 || drawing !== null || !handler) return;
		event.preventDefault();
		host!.setPointerCapture(event.pointerId);
		drawing = event.pointerId;
		handler.down(toolEvent(event));
	}

	function move(event: PointerEvent) {
		if (!navigation) return;
		if (navigation.panning) {
			navigation.move(event);
			return;
		}
		if (drawing === event.pointerId) handler?.move?.(toolEvent(event));
		else if (event.pointerType !== 'touch') onhover?.(toolEvent(event));
	}

	function up(event: PointerEvent) {
		if (!navigation) return;
		if (navigation.panning) {
			navigation.up(event);
			panning = navigation.panning;
			return;
		}
		if (drawing !== event.pointerId) return;
		drawing = null;
		handler?.up?.(toolEvent(event));
	}

	function keydown(event: KeyboardEvent) {
		if (event.code === 'Space' && !(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) {
			spaceHeld = true;
			event.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={keydown} onkeyup={(event) => event.code === 'Space' && (spaceHeld = false)} onblur={() => (spaceHeld = false)} />

<div
	bind:this={host}
	class="stage relative min-h-0 min-w-0 flex-1 touch-none overflow-hidden select-none"
	style:cursor={panning ? 'grabbing' : spaceHeld ? 'grab' : cursor}
	role="application"
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onpointerleave={() => onhover?.(null)}
	oncontextmenu={(event) => event.preventDefault()}
>
	<canvas bind:this={canvas} class="absolute inset-0 size-full"></canvas>
	{@render children?.()}
</div>
