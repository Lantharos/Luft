<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';

	interface Props {
		total: number;
		used: number;
		value: number;
		min: number;
		max: number;
		step: number;
		onchange: (value: number) => void;
	}

	let { total, used, value, min, max, step, onchange }: Props = $props();

	let track = $state<HTMLDivElement>();
	let dragging = $state(false);

	let kept = $derived(total - value);
	let split = $derived((kept / total) * 100);
	let windowsSize = $derived(t('ui-split-windows-size', { size: bytes(kept), used: bytes(used) }));

	function clamp(size: number) {
		return Math.min(max, Math.max(min, Math.round(size / step) * step));
	}

	function fromPointer(event: PointerEvent) {
		const box = track!.getBoundingClientRect();
		const fraction = (event.clientX - box.left) / box.width;
		onchange(clamp(total - fraction * total));
	}

	function down(event: PointerEvent) {
		if (event.button !== 0) return;
		dragging = true;
		track!.setPointerCapture(event.pointerId);
		fromPointer(event);
	}

	function keydown(event: KeyboardEvent) {
		const delta = { ArrowLeft: step, ArrowRight: -step, PageUp: step * 10, PageDown: -step * 10 }[event.key];
		if (delta === undefined) return;
		event.preventDefault();
		onchange(clamp(value + delta));
	}
</script>

<div class="flex flex-col gap-3">
	<div
		bind:this={track}
		class="track"
		class:dragging
		role="slider"
		tabindex="0"
		aria-label={t('ui-split-space')}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={bytes(value)}
		onpointerdown={down}
		onpointermove={(event) => dragging && fromPointer(event)}
		onpointerup={() => (dragging = false)}
		onpointercancel={() => (dragging = false)}
		onkeydown={keydown}
	>
		<div class="windows" style:width="{split}%">
			<div class="used" style:width="{(used / kept) * 100}%"></div>
		</div>
		<div class="handle" style:left="{split}%"></div>
		<div class="luft"></div>
	</div>
	<div class="flex justify-between text-[13.5px]">
		<span><span class="font-semibold">Windows</span> <span class="text-[var(--text-soft)]">{windowsSize}</span></span>
		<span><span class="font-semibold">Luft</span> <span class="text-[var(--text-soft)]">{bytes(value)}</span></span>
	</div>
</div>

<style>
	.track {
		position: relative;
		display: flex;
		height: 64px;
		gap: 6px;
		touch-action: none;
		user-select: none;
		outline-offset: 4px;
	}

	.windows,
	.luft {
		position: relative;
		overflow: hidden;
		border-radius: 16px;
	}

	.windows {
		flex: none;
		background: color-mix(in oklab, var(--secondary) 30%, transparent);
	}

	.used {
		height: 100%;
		background: color-mix(in oklab, var(--secondary) 55%, transparent);
	}

	.luft {
		flex: 1;
		background: var(--accent);
		opacity: 0.85;
	}

	.handle {
		position: absolute;
		top: 50%;
		height: 30px;
		width: 6px;
		border-radius: 3px;
		background: var(--ink);
		box-shadow: 0 2px 8px var(--shadow-soft);
		transform: translate(-1px, -50%);
		transition: transform var(--motion-tap) var(--ease-decelerate);
	}

	.track:hover .handle,
	.dragging .handle {
		transform: translate(-1px, -50%) scaleY(1.2);
	}
</style>
