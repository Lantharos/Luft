<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatClock } from './clock';

	const KEY_STEP = 5;
	const PAGE_STEP = 30;

	interface Props {
		time: number;
		duration: number;
		buffered?: number;
		label?: string;
		preview?: Snippet<[number]>;
		onseek: (time: number) => void;
		onscrub?: (scrubbing: boolean) => void;
	}

	let { time, duration, buffered = 0, label = 'Position', preview, onseek, onscrub }: Props = $props();

	let track = $state<HTMLDivElement>();
	let hover = $state<number | null>(null);
	let draft = $state<number | null>(null);

	let length = $derived(Number.isFinite(duration) && duration > 0 ? duration : 0);
	let shown = $derived(draft ?? time);
	let fraction = $derived(length ? Math.min(1, Math.max(0, shown / length)) : 0);
	let bufferedFraction = $derived(length ? Math.min(1, buffered / length) : 0);

	function pointerFraction(event: PointerEvent) {
		const box = track!.getBoundingClientRect();
		return Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
	}

	function seek(next: number) {
		draft = Math.min(length, Math.max(0, next));
		onseek(draft);
	}

	function pointerDown(event: PointerEvent) {
		if (!length || event.button !== 0) return;
		track!.setPointerCapture(event.pointerId);
		onscrub?.(true);
		seek(pointerFraction(event) * length);
	}

	function pointerMove(event: PointerEvent) {
		hover = pointerFraction(event);
		if (draft !== null) seek(hover * length);
	}

	function pointerUp() {
		if (draft === null) return;
		draft = null;
		onscrub?.(false);
	}

	function keydown(event: KeyboardEvent) {
		const delta = { ArrowRight: KEY_STEP, ArrowLeft: -KEY_STEP, PageUp: PAGE_STEP, PageDown: -PAGE_STEP }[event.key];
		const target = event.key === 'Home' ? 0 : event.key === 'End' ? length : delta === undefined ? null : time + delta;
		if (target === null || !length) return;
		event.preventDefault();
		event.stopPropagation();
		onseek(Math.min(length, Math.max(0, target)));
	}
</script>

<div
	bind:this={track}
	role="slider"
	tabindex={length ? 0 : -1}
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={length}
	aria-valuenow={shown}
	aria-valuetext={formatClock(shown)}
	aria-disabled={!length}
	class="seek"
	class:active={hover !== null || draft !== null}
	class:disabled={!length}
	onpointerdown={pointerDown}
	onpointermove={pointerMove}
	onpointerup={pointerUp}
	onpointercancel={pointerUp}
	onpointerleave={() => (hover = null)}
	onkeydown={keydown}
>
	<div class="rail">
		<div class="buffered" style:transform="scaleX({bufferedFraction})"></div>
		<div class="fill" style:transform="scaleX({fraction})"></div>
	</div>
	<div class="thumb" style:left="{fraction * 100}%"></div>
	{#if hover !== null && length}
		<div class="bubble" style:left="{hover * 100}%">
			{@render preview?.(hover * length)}
			<span class="time">{formatClock(hover * length)}</span>
		</div>
	{/if}
</div>

<style>
	.seek {
		position: relative;
		height: 28px;
		width: 100%;
		min-width: 80px;
		touch-action: none;
		cursor: pointer;
	}

	.seek.disabled {
		cursor: default;
		opacity: 0.4;
	}

	.rail {
		position: absolute;
		inset: 12px 0;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--control);
		transition: inset 140ms var(--ease);
	}

	.active .rail {
		inset: 11px 0;
	}

	.buffered,
	.fill {
		position: absolute;
		inset: 0;
		transform-origin: left;
	}

	.buffered {
		background: color-mix(in oklab, var(--text) 16%, transparent);
	}

	.fill {
		background: var(--accent);
	}

	.thumb {
		position: absolute;
		top: 8px;
		height: 12px;
		width: 12px;
		margin-left: -6px;
		border-radius: var(--radius-pill);
		background: var(--text);
		box-shadow: 0 1px 4px var(--shadow-soft);
		opacity: 0;
		transform: scale(0.5);
		transition:
			opacity 140ms var(--ease),
			transform 140ms var(--ease);
	}

	.active .thumb {
		opacity: 1;
		transform: none;
	}

	.bubble {
		position: absolute;
		bottom: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.time {
		padding: 3px 9px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		color: var(--text);
		font-size: 12px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		box-shadow: 0 4px 16px var(--shadow-soft);
	}
</style>
