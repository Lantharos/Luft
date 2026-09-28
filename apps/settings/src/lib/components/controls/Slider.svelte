<script lang="ts">
	interface Props {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		label: string;
		disabled?: boolean;
		format?: (value: number) => string;
		oninput?: (value: number) => void;
		onchange: (value: number) => void;
	}

	let { value, min = 0, max = 1, step = 0.01, label, disabled = false, format, oninput, onchange }: Props = $props();

	let track = $state<HTMLDivElement>();
	let dragging = $state(false);
	let draft = $state<number | null>(null);

	let current = $derived(draft ?? value);
	let fraction = $derived(max === min ? 0 : (current - min) / (max - min));

	function snap(raw: number) {
		const stepped = Math.round((raw - min) / step) * step + min;
		return Math.min(max, Math.max(min, Number(stepped.toFixed(6))));
	}

	function fromPointer(event: PointerEvent) {
		const box = track!.getBoundingClientRect();
		return snap(min + ((event.clientX - box.left) / box.width) * (max - min));
	}

	function update(next: number) {
		if (next === draft) return;
		draft = next;
		oninput?.(next);
	}

	function commit() {
		if (draft !== null && draft !== value) onchange(draft);
		draft = null;
	}

	function pointerDown(event: PointerEvent) {
		if (disabled) return;
		dragging = true;
		track!.setPointerCapture(event.pointerId);
		update(fromPointer(event));
	}

	function pointerMove(event: PointerEvent) {
		if (dragging) update(fromPointer(event));
	}

	function pointerUp() {
		if (!dragging) return;
		dragging = false;
		commit();
	}

	function keydown(event: KeyboardEvent) {
		const delta = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[event.key];
		if (delta === undefined || disabled) return;
		event.preventDefault();
		update(snap(current + delta));
		commit();
	}
</script>

<div
	bind:this={track}
	role="slider"
	tabindex={disabled ? -1 : 0}
	aria-label={label}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={current}
	aria-valuetext={format?.(current)}
	aria-disabled={disabled}
	class="slider"
	class:dragging
	class:disabled
	onpointerdown={pointerDown}
	onpointermove={pointerMove}
	onpointerup={pointerUp}
	onpointercancel={pointerUp}
	onkeydown={keydown}
>
	<div class="rail">
		<div class="fill" style:width="{fraction * 100}%"></div>
	</div>
	<div class="thumb" style:left="{fraction * 100}%">
		{#if dragging && format}
			<span class="value">{format(current)}</span>
		{/if}
	</div>
</div>

<style>
	.slider {
		position: relative;
		height: 28px;
		width: 100%;
		min-width: 120px;
		touch-action: none;
	}

	.slider.disabled {
		opacity: 0.4;
	}

	.rail {
		position: absolute;
		inset: 11px 0;
		border-radius: var(--radius-pill);
		background: var(--control);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: var(--accent);
	}

	.thumb {
		position: absolute;
		top: 4px;
		height: 20px;
		width: 20px;
		margin-left: -10px;
		border-radius: var(--radius-pill);
		background: var(--text);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
		transition: transform 160ms var(--ease);
	}

	.slider:not(.disabled):hover .thumb,
	.dragging .thumb {
		transform: scale(1.1);
	}

	.value {
		position: absolute;
		bottom: 28px;
		left: 50%;
		transform: translateX(-50%);
		padding: 3px 9px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
		box-shadow: 0 4px 16px var(--shadow-soft);
	}
</style>
