<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import Move from '@lucide/svelte/icons/move';
	import { objectPosition, thumbnail, type Focus } from './api';

	interface Props {
		path: string;
		focus: Focus;
		shape: number;
		fill: boolean;
		onchange: (focus: Focus) => void;
	}

	const KEY_STEP = 0.02;
	const ARROWS: Record<string, Focus> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

	let { path, focus, shape, fill, onchange }: Props = $props();

	let source = $state<string | null>(null);
	let pictureShape = $state(0);
	let width = $state(0);
	let height = $state(0);
	let dragging = $state<{ pointerX: number; pointerY: number; from: Focus } | null>(null);
	let shown = $state<Focus | null>(null);

	$effect(() => {
		const requested = path;
		void thumbnail(requested).then((preview) => {
			if (requested === path) source = fileUrl(preview);
		});
	});

	let position = $derived(shown ?? focus);
	let overflow = $derived.by<Focus>(() => {
		if (!fill || !pictureShape || !width) return [0, 0];
		return pictureShape > width / height ? [height * pictureShape - width, 0] : [0, width / pictureShape - height];
	});
	let movable = $derived(overflow[0] > 1 || overflow[1] > 1);

	const clamp = (value: number) => Math.min(1, Math.max(0, value));

	function pointerDown(event: PointerEvent) {
		if (!movable || event.button !== 0) return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = { pointerX: event.clientX, pointerY: event.clientY, from: focus };
		shown = focus;
	}

	function pointerMove(event: PointerEvent) {
		if (!dragging) return;
		const [overflowX, overflowY] = overflow;
		const [fromX, fromY] = dragging.from;
		shown = [
			overflowX ? clamp(fromX - (event.clientX - dragging.pointerX) / overflowX) : fromX,
			overflowY ? clamp(fromY - (event.clientY - dragging.pointerY) / overflowY) : fromY
		];
	}

	function pointerUp() {
		if (!dragging) return;
		dragging = null;
		if (shown && (shown[0] !== focus[0] || shown[1] !== focus[1])) onchange(shown);
	}

	$effect(() => {
		void focus;
		if (!dragging) shown = null;
	});

	function keyDown(event: KeyboardEvent) {
		const arrow = ARROWS[event.key];
		if (!movable || !arrow) return;
		event.preventDefault();
		const [x, y] = focus;
		onchange([overflow[0] ? clamp(x - arrow[0] * KEY_STEP) : x, overflow[1] ? clamp(y - arrow[1] * KEY_STEP) : y]);
	}
</script>

<div class="frame" style:aspect-ratio={shape} style:max-width="{Math.round(240 * shape)}px">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="preview"
		class:movable
		class:dragging
		role={movable ? 'application' : 'img'}
		aria-label={movable ? 'Wallpaper position. Drag or use the arrow keys to show another part' : 'Wallpaper'}
		tabindex={movable ? 0 : -1}
		bind:clientWidth={width}
		bind:clientHeight={height}
		onpointerdown={pointerDown}
		onpointermove={pointerMove}
		onpointerup={pointerUp}
		onpointercancel={pointerUp}
		onkeydown={keyDown}
	>
		{#if source}
			<img
				src={source}
				alt=""
				decoding="async"
				draggable="false"
				class:contain={!fill}
				style:object-position={objectPosition(position)}
				onload={(event) => {
					const image = event.currentTarget as HTMLImageElement;
					pictureShape = image.naturalWidth / image.naturalHeight;
				}}
			/>
		{/if}
		{#if movable}
			<span class="hint" aria-hidden="true"><Move size={14} />Drag to reposition</span>
		{/if}
	</div>
</div>

<style>
	.frame {
		width: 100%;
		margin: 0 auto;
	}

	.preview {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
		border-radius: 14px;
		background: var(--control);
		touch-action: none;
		outline: none;
	}

	.preview.movable {
		cursor: grab;
	}

	.preview.dragging {
		cursor: grabbing;
	}

	.preview:focus-visible {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--accent);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		user-select: none;
		animation: appear 240ms var(--ease);
	}

	img.contain {
		object-fit: contain;
	}

	.hint {
		position: absolute;
		bottom: 10px;
		left: 50%;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(12px);
		font-size: 12px;
		white-space: nowrap;
		color: rgba(255, 255, 255, 0.92);
		opacity: 0;
		transform: translate(-50%, 4px);
		transition: opacity 160ms var(--ease), transform 160ms var(--ease);
		pointer-events: none;
	}

	.preview.movable:hover .hint,
	.preview.movable:focus-visible .hint {
		opacity: 1;
		transform: translate(-50%, 0);
	}

	.preview.dragging .hint {
		opacity: 0;
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
