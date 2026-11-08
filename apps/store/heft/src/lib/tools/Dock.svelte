<script lang="ts">
	import { t } from '@luft/i18n';
	import { dock, type DockSide } from './dock.svelte';
	import Toolbar, { type ToolbarActions } from './Toolbar.svelte';

	let {
		actions,
		zoom,
		books,
		ruled,
		width,
		height
	}: { actions: ToolbarActions; zoom: number; books: boolean; ruled: boolean; width: number; height: number } = $props();

	const INSET = 12;
	const NEAR = 64;
	const RETURN_AFTER = 900;

	let element: HTMLDivElement;
	let dockWidth = $state(0);
	let dockHeight = $state(0);
	let dragging: { pointer: number; dx: number; dy: number; x: number; y: number } | null = $state(null);
	let faded = $state(false);
	let placed = $state(false);

	let travel = $derived(Math.max(0, height - dockHeight - INSET * 2));
	let top = $derived(INSET + dock.along * travel);
	let left = $derived(dock.side === 'left' ? INSET : width - dockWidth - INSET);
	let opens: DockSide = $derived(dock.side === 'left' ? 'right' : 'left');

	function grab(event: PointerEvent) {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = { pointer: event.pointerId, dx: event.clientX - left, dy: event.clientY - top, x: left, y: top };
	}

	function drag(event: PointerEvent) {
		if (dragging?.pointer !== event.pointerId) return;
		dragging = { ...dragging, x: event.clientX - dragging.dx, y: event.clientY - dragging.dy };
	}

	function drop(event: PointerEvent) {
		if (dragging?.pointer !== event.pointerId) return;
		const middle = dragging.x + dockWidth / 2;
		dock.place(middle < width / 2 ? 'left' : 'right', travel ? (dragging.y - INSET) / travel : 0.5);
		dragging = null;
	}

	$effect(() => {
		if (dockWidth && !placed) requestAnimationFrame(() => (placed = true));
	});

	$effect(() => {
		let bounds: DOMRect | null = null;
		let timer = 0;
		const near = ({ clientX: x, clientY: y }: PointerEvent) =>
			bounds !== null && x > bounds.left - NEAR && x < bounds.right + NEAR && y > bounds.top - NEAR && y < bounds.bottom + NEAR;
		const down = (event: PointerEvent) => {
			if (event.pointerType !== 'pen' || element.contains(event.target as Node)) return;
			bounds = element.getBoundingClientRect();
			clearTimeout(timer);
			if (near(event)) faded = true;
		};
		const move = (event: PointerEvent) => {
			if (bounds && !faded && near(event)) faded = true;
		};
		const up = (event: PointerEvent) => {
			if (event.pointerType !== 'pen' || !bounds) return;
			bounds = null;
			timer = window.setTimeout(() => (faded = false), RETURN_AFTER);
		};
		const options = { capture: true, passive: true };
		window.addEventListener('pointerdown', down, options);
		window.addEventListener('pointermove', move, options);
		window.addEventListener('pointerup', up, options);
		window.addEventListener('pointercancel', up, options);
		return () => {
			clearTimeout(timer);
			window.removeEventListener('pointerdown', down, options);
			window.removeEventListener('pointermove', move, options);
			window.removeEventListener('pointerup', up, options);
			window.removeEventListener('pointercancel', up, options);
		};
	});
</script>

<div
	bind:this={element}
	bind:offsetWidth={dockWidth}
	bind:offsetHeight={dockHeight}
	class={['dock hidden-scroll', placed && 'placed', faded && 'faded', dragging && 'dragging']}
	style:max-height="{height - INSET * 2}px"
	style:transform="translate({dragging?.x ?? left}px, {dragging?.y ?? top}px)"
>
	<button
		type="button"
		class="grip"
		aria-label={t('toolbar-move')}
		onpointerdown={grab}
		onpointermove={drag}
		onpointerup={drop}
		onpointercancel={drop}
	>
		<span></span>
	</button>
	<Toolbar {actions} {zoom} {books} {ruled} side {opens} />
</div>

<style>
	.dock {
		position: absolute;
		z-index: 6;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
		padding: 0 5px 6px;
		border-radius: 28px;
		background: var(--popover);
		box-shadow:
			0 12px 36px var(--shadow-soft),
			0 1px 3px var(--shadow-faint);
		top: 0;
		left: 0;
		transition: opacity var(--motion-standard) var(--ease-decelerate);
	}

	.dock:not(.placed) {
		visibility: hidden;
	}

	.dock.placed {
		transition-property: opacity, transform;
	}

	.dock.faded {
		opacity: 0.22;
		pointer-events: none;
	}

	.dock.dragging {
		transition: none;
		box-shadow: 0 20px 48px var(--shadow-soft);
	}

	.grip {
		display: grid;
		height: 26px;
		width: 100%;
		flex: none;
		place-items: center;
		cursor: grab;
		touch-action: none;
	}

	.dragging .grip {
		cursor: grabbing;
	}

	.grip span {
		height: 4px;
		width: 24px;
		border-radius: var(--radius-pill);
		background: var(--text-muted);
		opacity: 0.5;
	}

	:global([data-posture='tablet']) .grip {
		height: 32px;
	}
</style>
